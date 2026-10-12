// @ts-check
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startMock } from '../scripts/mock-vllm.js'
import { handleHealth, handleTimeline } from './handler.js'

/** @type {import('node:http').Server[]} */
const servers = []
/** @type {Record<string, string>} */
const urls = {}

beforeAll(async () => {
  for (const mode of ['ok', 'hallucinate', 'garbage', 'down']) {
    const s = /** @type {import('node:http').Server} */ (await startMock({ port: 0, mode, apiKey: 'secret-test', tokensPerS: 1e6 }))
    servers.push(s)
    const a = /** @type {import('node:net').AddressInfo} */ (s.address())
    urls[mode] = `http://127.0.0.1:${a.port}/v1`
  }
})
afterAll(() => servers.forEach((s) => s.close()))

const NOTES = `Récit de la patiente ([PATIENTE]) : A accepté un verre offert vers 22 h 45. Est rentrée chez elle en taxi vers 2 h 15.

Note de triage : arrivée à l'urgence le 4 octobre à 4 h 20.`

const env = (/** @type {string} */ mode, key = 'secret-test') => ({ VLLM_BASE_URL: urls[mode], VLLM_MODEL: 'mock-model', VLLM_API_KEY: key, VLLM_LABEL: 'mock' })

describe('/api/timeline', () => {
  it('renvoie une chronologie en direct, citations vérifiées', async () => {
    const r = await handleTimeline({ notes: NOTES }, env('ok'))
    expect(r.status).toBe(200)
    expect(r.body.live).toBe(true)
    const result = /** @type {any} */ (r.body.result)
    expect(result.events.length).toBeGreaterThan(0)
    expect(r.body.removed).toEqual([])
  })
  it('retire les citations inventées et les jugements', async () => {
    const r = await handleTimeline({ notes: NOTES }, env('hallucinate'))
    expect(r.body.live).toBe(true)
    const removed = /** @type {any[]} */ (r.body.removed)
    expect(removed.map((x) => x.reason)).toEqual(expect.arrayContaining(['citation introuvable dans les notes (non étayé)', 'jugement de crédibilité']))
  })
  it('bascule en repli si la sortie est illisible', async () => {
    const r = await handleTimeline({ notes: NOTES }, env('garbage'))
    expect(r).toMatchObject({ status: 503, body: { live: false, error: 'invalid-json' } })
  })
  it('bascule en repli si l’endpoint est en panne, injoignable ou non configuré', async () => {
    expect((await handleTimeline({ notes: NOTES }, env('down'))).body).toMatchObject({ live: false, error: 'upstream' })
    expect((await handleTimeline({ notes: NOTES }, { ...env('ok'), VLLM_BASE_URL: 'http://127.0.0.1:9/v1' })).body).toMatchObject({ live: false, error: 'unreachable' })
    expect((await handleTimeline({ notes: NOTES }, {})).body).toMatchObject({ live: false, error: 'not-configured' })
  })
  it('signale une clé refusée', async () => {
    expect((await handleTimeline({ notes: NOTES }, env('ok', 'mauvaise'))).body).toMatchObject({ live: false, error: 'unauthorized' })
  })
  it('refuse d’envoyer des notes contenant encore un identifiant direct', async () => {
    const r = await handleTimeline({ notes: `${NOTES}\nTéléphone : 514-555-0147` }, env('ok'))
    expect(r.status).toBe(422)
    expect(r.body).toMatchObject({ live: false, error: 'identifiers' })
    expect(JSON.stringify(r.body)).not.toContain('555-0147')
  })
  it('refuse une requête vide ou trop longue', async () => {
    expect((await handleTimeline({}, env('ok'))).status).toBe(400)
    expect((await handleTimeline({ notes: 'x'.repeat(20_000) }, env('ok'))).status).toBe(413)
  })
  it('expose l’état de l’endpoint sans la clé', async () => {
    const r = await handleHealth(env('ok'))
    expect(r.body).toMatchObject({ configured: true, reachable: true })
    expect(JSON.stringify(r.body)).not.toContain('secret-test')
  })
})
