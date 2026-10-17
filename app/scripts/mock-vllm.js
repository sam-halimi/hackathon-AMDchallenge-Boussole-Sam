// @ts-check
// FAUX serveur compatible OpenAI, pour tester sans GPU. Ne fait aucune IA : il découpe les notes
// en phrases et renvoie une chronologie au bon format. Ses latences ne disent rien d'AMD.
//   node scripts/mock-vllm.js                 → http://127.0.0.1:8001/v1
// MOCK_MODE : ok (défaut) · hallucinate (ajoute une citation inventée et un jugement interdit)
//             garbage (JSON invalide) · down (répond 500)
// MOCK_API_KEY : si défini, exige « Authorization: Bearer <clé> »
// MOCK_TOKENS_PER_S : débit simulé (défaut 400 jetons/s)
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'

/**
 * @param {string} notes
 * @param {string} mode
 */
export function fakeTimeline(notes, mode = 'ok') {
  const body = notes.replace(/^Notes \(pseudonymisées\) :\s*/, '')
  /** @type {{ time: string, description: string, source: string, origin: string }[]} */
  const events = []
  for (const block of body.split(/\n\s*\n/)) {
    const m = block.match(/^([^:]{3,40}) :\s*(.*)$/s)
    const origin = m ? m[1].replace(/\s*\(.*\)$/, '').trim() : 'Notes'
    const text = m ? m[2] : block
    for (const sentence of text.match(/[^.]+\.?/g) ?? []) {
      const s = sentence.trim()
      if (s.length < 8) continue
      const time = s.match(/\b\d{1,2} h(?: \d{2})?\b/)?.[0] ?? 'moment non précisé'
      events.push({ time, description: s.replace(/\.$/, '').slice(0, 80), source: s, origin })
    }
  }
  if (mode === 'hallucinate') {
    events.push({ time: '23 h', description: 'Rencontre avec un homme', source: 'Elle a rencontré un homme à 23 h.', origin: 'Récit' })
    events.push({ time: '1 h', description: 'Version peu fiable, la personne exagère', source: events[0]?.source ?? '', origin: 'Récit' })
  }
  return { events, gaps: [], inconsistencies: [] }
}

/** @param {{ port?: number, host?: string, mode?: string, apiKey?: string, tokensPerS?: number }} [opts] */
export function startMock(opts = {}) {
  const mode = opts.mode ?? process.env.MOCK_MODE ?? 'ok'
  const apiKey = opts.apiKey ?? process.env.MOCK_API_KEY ?? ''
  const tps = opts.tokensPerS ?? Number(process.env.MOCK_TOKENS_PER_S ?? 400)
  const server = createServer(async (req, res) => {
    const json = (/** @type {number} */ status, /** @type {unknown} */ body) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(body))
    }
    if (apiKey && req.headers.authorization !== `Bearer ${apiKey}`) return json(401, { error: 'unauthorized' })
    if (mode === 'down') return json(500, { error: 'down' })
    if (req.url === '/v1/models') return json(200, { object: 'list', data: [{ id: 'mock-model', object: 'model' }] })
    if (req.url !== '/v1/chat/completions' || req.method !== 'POST') return json(404, { error: 'not found' })
    let raw = ''
    for await (const c of req) raw += c
    const body = JSON.parse(raw)
    const user = body.messages?.find((/** @type {any} */ m) => m.role === 'user')?.content ?? ''
    const content = mode === 'garbage' ? 'Voici la chronologie : {events: [' : JSON.stringify(fakeTimeline(user, mode))
    const completion = Math.ceil(content.length / 4)
    const prompt = Math.ceil(JSON.stringify(body.messages).length / 4)
    if (body.stream) {
      // Streaming SSE, comme l'endpoint réel : la sortie arrive par petits morceaux.
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/event-stream')
      const pas = 40
      for (let i = 0; i < content.length; i += pas) {
        res.write(`data: ${JSON.stringify({ model: body.model ?? 'mock-model', choices: [{ index: 0, delta: { content: content.slice(i, i + pas) } }] })}\n\n`)
        await new Promise((r) => setTimeout(r, (pas / 4 / tps) * 1000))
      }
      res.write(`data: ${JSON.stringify({ model: body.model ?? 'mock-model', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion } })}\n\n`)
      res.end('data: [DONE]\n\n')
      return
    }
    await new Promise((r) => setTimeout(r, 30 + (completion / tps) * 1000))
    json(200, {
      id: 'mock', object: 'chat.completion', model: body.model ?? 'mock-model',
      choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content } }],
      usage: { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion },
    })
  })
  return new Promise((resolve) => {
    server.listen(opts.port ?? Number(process.env.MOCK_PORT ?? 8001), opts.host ?? '127.0.0.1', () => resolve(server))
  })
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const server = /** @type {import('node:http').Server} */ (await startMock())
  const a = server.address()
  console.log(`Faux vLLM (MOCK, aucune IA) sur http://127.0.0.1:${typeof a === 'object' && a ? a.port : '?'}/v1 · mode ${process.env.MOCK_MODE ?? 'ok'}`)
}
