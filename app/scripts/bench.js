// @ts-check
// Benchmark simple de l'endpoint vLLM : latence et débit sur des notes fictives.
//   npm run bench                         (lit .env : VLLM_BASE_URL, VLLM_MODEL, VLLM_API_KEY, VLLM_LABEL)
//   npm run bench -- --runs 5 --concurrency 1,4,8
// Écrit bench/results.md (résumé, à recopier dans le README ; bench/results-mock.md avec le faux serveur)
// et bench/raw/<date>.json (non versionné).
import { mkdir, writeFile } from 'node:fs/promises'
import { chatJson, configFromEnv } from '../server/llm.js'
import { applyGuardrails, hasShape, SCHEMA, SYSTEM } from '../server/timeline.js'
import { BENCH_CASES } from './bench-cases.js'

const arg = (/** @type {string} */ name, /** @type {string} */ def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : def
}
const RUNS = Number(arg('runs', '3'))
const LEVELS = arg('concurrency', '1,4').split(',').map(Number)

const cfg = configFromEnv(process.env)
if (!cfg) {
  console.error('VLLM_BASE_URL et VLLM_MODEL sont requis (voir .env.example).')
  process.exit(1)
}

/** @param {number[]} xs @param {number} p */
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)] ?? 0
}

/** @typedef {{ case: string, ok: boolean, error?: string, latencyMs: number, promptTokens: number, completionTokens: number, kept: number, removed: number }} Sample */

/** @param {typeof BENCH_CASES[number]} c @returns {Promise<Sample>} */
async function once(c) {
  const t0 = performance.now()
  try {
    const r = await chatJson(/** @type {NonNullable<typeof cfg>} */ (cfg), { system: SYSTEM, user: `Notes (pseudonymisées) :\n\n${c.notes}`, schema: SCHEMA, schemaName: 'chronologie', maxTokens: 3000 })
    const json = r.json
    const shaped = hasShape(json)
    const g = hasShape(json) ? applyGuardrails(json, c.notes) : null
    return {
      case: c.id, ok: shaped, error: shaped ? undefined : 'bad-shape', latencyMs: r.latencyMs,
      promptTokens: r.usage.prompt_tokens ?? 0, completionTokens: r.usage.completion_tokens ?? 0,
      kept: g ? g.result.events.length : 0, removed: g ? g.removed.length : 0,
    }
  } catch (e) {
    return { case: c.id, ok: false, error: e instanceof Error ? e.message : 'error', latencyMs: Math.round(performance.now() - t0), promptTokens: 0, completionTokens: 0, kept: 0, removed: 0 }
  }
}

// Échauffement (chargement du modèle, compilation des noyaux) : non compté.
console.log(`Échauffement… (${cfg.model} · ${cfg.label})`)
await once(BENCH_CASES[0])

/** @type {{ concurrency: number, wallMs: number, samples: Sample[] }[]} */
const levels = []
for (const conc of LEVELS) {
  const jobs = Array.from({ length: RUNS }, () => BENCH_CASES).flat()
  /** @type {Sample[]} */
  const samples = []
  const t0 = performance.now()
  let next = 0
  await Promise.all(
    Array.from({ length: conc }, async () => {
      while (next < jobs.length) samples.push(await once(jobs[next++]))
    }),
  )
  const wallMs = performance.now() - t0
  levels.push({ concurrency: conc, wallMs, samples })
  console.log(`concurrence ${conc} : ${samples.length} requêtes en ${(wallMs / 1000).toFixed(1)} s`)
}

const rows = levels.map(({ concurrency, wallMs, samples }) => {
  const ok = samples.filter((s) => s.ok)
  const lat = ok.map((s) => s.latencyMs)
  const out = ok.reduce((a, s) => a + s.completionTokens, 0)
  const perReq = ok.map((s) => (s.completionTokens / s.latencyMs) * 1000)
  const kept = ok.reduce((a, s) => a + s.kept, 0)
  const removed = ok.reduce((a, s) => a + s.removed, 0)
  return {
    concurrency, n: samples.length, ok: ok.length,
    p50: pct(lat, 50), p95: pct(lat, 95),
    tokPerReq: perReq.length ? perReq.reduce((a, b) => a + b, 0) / perReq.length : 0,
    aggTokPerS: (out / wallMs) * 1000,
    reqPerMin: (ok.length / wallMs) * 60_000,
    guard: kept + removed ? `${kept} kept / ${removed} removed` : '—',
  }
})

const date = new Date().toISOString()
const isMock = /mock/i.test(`${cfg.model} ${cfg.label}`)
const md = `# Boussole benchmark · ${date.slice(0, 10)}
${isMock ? '\n> **LOCAL MOCK SERVER**: validates the harness only. It measures neither a model nor AMD hardware.\n' : ''}
- Endpoint: **${cfg.label}** · model \`${cfg.model}\`
- ${BENCH_CASES.length} fictional notes × ${RUNS} runs per concurrency level, after one warm-up request.
- JSON-schema \`response_format\`: ${cfg.jsonSchema ? 'yes' : 'no'} · temperature 0 · max 3000 tokens.

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) |
|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.concurrency} | ${r.ok}/${r.n} | ${(r.p50 / 1000).toFixed(2)} s | ${(r.p95 / 1000).toFixed(2)} s | ${r.tokPerReq.toFixed(0)} | ${r.aggTokPerS.toFixed(0)} | ${r.reqPerMin.toFixed(1)} | ${r.guard} |`).join('\n')}

Latency = full (non-streamed) request, measured client-side. Token counts from the endpoint's \`usage\` field.
`
await mkdir(new URL('../bench/raw/', import.meta.url), { recursive: true })
await writeFile(new URL(isMock ? '../bench/results-mock.md' : '../bench/results.md', import.meta.url), md)
await writeFile(new URL(`../bench/raw/${date.replace(/[:.]/g, '-')}.json`, import.meta.url), JSON.stringify({ date, model: cfg.model, label: cfg.label, levels }, null, 2))
console.log('\n' + md)
