// @ts-check
// Banc d'essai de l'endpoint IA (compatible OpenAI) : latence, débit et garde-fous, sur des notes fictives.
//   npm run bench                         (lit .env : AI_BASE_URL, AI_MODEL, AI_API_KEY, AI_LABEL)
//   npm run bench -- --runs 1 --concurrency 1      (vérification rapide, une requête par cas)
//   npm run bench -- --runs 5 --concurrency 1,4,8
// Écrit bench/results.md (résumé, à recopier dans le README ; bench/results-mock.md avec le faux serveur)
// et bench/raw/<date>.json (non versionné).
import { mkdir, writeFile } from 'node:fs/promises'
import { handleTimeline } from '../server/handler.js'
import { chatJson, configFromEnv, ping } from '../server/llm.js'
import { applyGuardrails, FORBIDDEN, hasShape, isQuoted, SCHEMA, SYSTEM } from '../server/timeline.js'
import { BENCH_CASES } from './bench-cases.js'

const arg = (/** @type {string} */ name, /** @type {string} */ def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 ? process.argv[i + 1] : def
}
const RUNS = Number(arg('runs', '3'))
const LEVELS = arg('concurrency', '1,4').split(',').map(Number)

const cfg = configFromEnv(process.env)
if (!cfg) {
  console.error(`Endpoint IA non configuré : AI_BASE_URL et AI_MODEL sont requis.
  → Copier app/.env.example en app/.env et remplir AI_BASE_URL, AI_MODEL, AI_API_KEY (valeurs du Token Factory AMD).
  → Test du banc sans IA : npm run mock, puis AI_BASE_URL=http://127.0.0.1:8001/v1 et AI_MODEL=mock-model.`)
  process.exit(1)
}
const local = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(cfg.baseUrl)
if (!cfg.apiKey && !local) {
  console.error(`Clé manquante : AI_API_KEY est vide alors que l'endpoint ${new URL(cfg.baseUrl).host} n'est pas local.
  → La clé personnelle du Token Factory AMD va dans app/.env (jamais dans git, jamais dans la conversation).`)
  process.exit(2)
}
// Vérification préalable : l'endpoint répond-il, la clé est-elle acceptée ?
if (!(await ping(cfg))) {
  console.warn(`Avertissement : GET ${new URL(cfg.baseUrl).host}/models ne répond pas (endpoint injoignable, clé refusée, ou route /models absente). On tente quand même une requête.`)
}

/** Vérifie a posteriori les invariants des garde-fous sur une sortie déjà filtrée. @param {any} result @param {string} notes */
const invariantsOk = (result, notes) =>
  result.events.every((/** @type {any} */ e) => isQuoted(e.source, notes) && !FORBIDDEN.some((f) => f.re.test(`${e.description} ${e.origin}`))) &&
  result.gaps.every((/** @type {any} */ g) => !FORBIDDEN.some((f) => f.re.test(g.note))) &&
  result.inconsistencies.every((/** @type {any} */ c) => c.sources.every((/** @type {string} */ q) => isQuoted(q, notes)) && !FORBIDDEN.some((f) => f.re.test(`${c.description} ${c.suggestion}`)))

/** @param {number[]} xs @param {number} p */
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)] ?? 0
}

/** @typedef {{ case: string, ok: boolean, error?: string, latencyMs: number, promptTokens: number, completionTokens: number, kept: number, removed: number, reasons: string[], invariants: boolean }} Sample */

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
      reasons: g ? g.removed.map((x) => x.reason) : [], invariants: g ? invariantsOk(g.result, c.notes) : false,
    }
  } catch (e) {
    return { case: c.id, ok: false, error: e instanceof Error ? e.message : 'error', latencyMs: Math.round(performance.now() - t0), promptTokens: 0, completionTokens: 0, kept: 0, removed: 0, reasons: [], invariants: false }
  }
}

// Garde-fou d'entrée : des notes qui contiennent encore un identifiant direct ne partent jamais au modèle.
const fuite = await handleTimeline({ notes: `${BENCH_CASES[0].notes}\nCourriel : jane.doe@example.com` }, process.env)
const blocageOk = fuite.status === 422 && fuite.body.error === 'identifiers'
console.log(`Blocage des identifiants avant envoi : ${blocageOk ? 'OK (422, rien envoyé)' : `ÉCHEC (${fuite.status})`}`)

// Échauffement (chargement du modèle) : non compté, mais il sert de diagnostic.
console.log(`Échauffement… (${cfg.model} · ${cfg.label})`)
const premier = await once(BENCH_CASES[0])
if (!premier.ok) {
  const conseil = /unauthorized/.test(premier.error ?? '') ? 'clé refusée : vérifier AI_API_KEY'
    : /unreachable|timeout/.test(premier.error ?? '') ? 'endpoint injoignable : vérifier AI_BASE_URL'
    : /upstream: 404/.test(premier.error ?? '') ? 'route ou modèle introuvable : vérifier AI_BASE_URL (sans /chat/completions) et AI_MODEL'
    : /upstream: 400|invalid-json|bad-shape/.test(premier.error ?? '') ? 'réponse refusée ou hors format : essayer AI_JSON_SCHEMA=0'
    : 'voir le détail ci-dessus'
  console.error(`Première requête en échec (${premier.error}) : ${conseil}.`)
  process.exit(3)
}

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
    invariants: ok.length && ok.every((s) => s.invariants) ? 'all respected' : ok.length ? 'VIOLATED' : '—',
  }
})

const tous = levels.flatMap((l) => l.samples)
/** @type {Record<string, number>} */
const raisons = {}
for (const r of tous.flatMap((s) => s.reasons)) raisons[r] = (raisons[r] ?? 0) + 1
const pieges = tous.filter((s) => s.case === 'piege' && s.ok)
const piege = pieges.length ? `${pieges.filter((s) => s.invariants).length}/${pieges.length} outputs clean after guardrails, ${pieges.reduce((a, s) => a + s.removed, 0)} items removed` : 'not run'
const date = new Date().toISOString()
const isMock = /mock/i.test(`${cfg.model} ${cfg.label}`)
const md = `# Boussole benchmark · ${date.slice(0, 10)}
${isMock ? '\n> **LOCAL MOCK SERVER**: validates the harness only. It measures neither a model nor AMD hardware.\n' : ''}
- Endpoint: **${cfg.label}** · model \`${cfg.model}\`
- ${BENCH_CASES.length} fictional notes × ${RUNS} runs per concurrency level, after one warm-up request.
- \`response_format\`: ${cfg.responseFormat}${cfg.reasoningEffort ? ` · reasoning_effort ${cfg.reasoningEffort}` : ''} · temperature 0 · max 3000 tokens.

| Concurrency | OK requests | Latency p50 | Latency p95 | Tokens/s per request | Total throughput (tokens/s) | Requests/min | Guardrails (events) | Invariants |
|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.concurrency} | ${r.ok}/${r.n} | ${(r.p50 / 1000).toFixed(2)} s | ${(r.p95 / 1000).toFixed(2)} s | ${r.tokPerReq.toFixed(0)} | ${r.aggTokPerS.toFixed(0)} | ${r.reqPerMin.toFixed(1)} | ${r.guard} | ${r.invariants} |`).join('\n')}

Guardrail checks:
- Identifier still present in the notes: ${blocageOk ? 'request refused before reaching the model (HTTP 422)' : '**NOT BLOCKED**'}.
- Removed by the guardrails, by reason: ${Object.entries(raisons).map(([k, n]) => `${k} (${n})`).join(', ') || 'nothing removed'}.
- Trap case (third-party opinions on credibility and blame in the notes): ${piege}.
- Invariants re-checked on every kept line: verbatim quote found in the notes, no forbidden wording.

Latency = full (non-streamed) request, measured client-side. Token counts from the endpoint's \`usage\` field.
`
await mkdir(new URL('../bench/raw/', import.meta.url), { recursive: true })
await writeFile(new URL(isMock ? '../bench/results-mock.md' : '../bench/results.md', import.meta.url), md)
await writeFile(new URL(`../bench/raw/${date.replace(/[:.]/g, '-')}.json`, import.meta.url), JSON.stringify({ date, model: cfg.model, label: cfg.label, levels }, null, 2))
console.log('\n' + md)
