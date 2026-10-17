// @ts-check
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startMock } from '../scripts/mock-vllm.js'
import { handleHealth, handleTimeline, nodeTimeline } from './handler.js'
import { createServer } from 'node:http'
import { nouveauxEvenements } from './timeline.js'
import { configFromEnv } from './llm.js'

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

const env = (/** @type {string} */ mode, key = 'secret-test') => ({ AI_BASE_URL: urls[mode], AI_MODEL: 'mock-model', AI_API_KEY: key, AI_LABEL: 'mock' })

describe('configuration du fournisseur', () => {
  it('lit AI_*, retombe sur les anciens VLLM_*, et ignore une valeur vide', () => {
    expect(configFromEnv({ AI_BASE_URL: 'https://h/v1/', AI_MODEL: 'm', AI_API_KEY: 'k' })).toMatchObject({ baseUrl: 'https://h/v1', model: 'm', apiKey: 'k' })
    expect(configFromEnv({ AI_BASE_URL: 'https://h/v1/chat/completions', AI_MODEL: 'm' })).toMatchObject({ baseUrl: 'https://h/v1' })
    expect(configFromEnv({ VLLM_BASE_URL: 'http://v/v1', VLLM_MODEL: 'old' })).toMatchObject({ baseUrl: 'http://v/v1', model: 'old' })
    expect(configFromEnv({ AI_BASE_URL: '', VLLM_BASE_URL: 'http://v/v1', AI_MODEL: 'm' })).toMatchObject({ baseUrl: 'http://v/v1' })
    expect(configFromEnv({ AI_MODEL: 'm' })).toBeNull()
  })
})

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
    expect((await handleTimeline({ notes: NOTES }, { ...env('ok'), AI_BASE_URL: 'http://127.0.0.1:9/v1' })).body).toMatchObject({ live: false, error: 'unreachable' })
    expect((await handleTimeline({ notes: NOTES }, {})).body).toMatchObject({ live: false, error: 'not-configured' })
  })
  it('signale une clé refusée ou absente (repli, jamais « en direct »)', async () => {
    expect((await handleTimeline({ notes: NOTES }, env('ok', 'mauvaise'))).body).toMatchObject({ live: false, error: 'unauthorized' })
    expect((await handleTimeline({ notes: NOTES }, env('ok', ''))).body).toMatchObject({ live: false, error: 'unauthorized' })
  })
  it('« en direct » seulement après un appel réel réussi : aucun autre cas ne renvoie live', async () => {
    const cas = [env('down'), env('garbage'), env('ok', 'mauvaise'), { ...env('ok'), AI_BASE_URL: 'http://127.0.0.1:9/v1' }, {}]
    for (const e of cas) {
      const r = await handleTimeline({ notes: NOTES }, e)
      expect(r.body.live).toBe(false)
      expect(r.body).not.toHaveProperty('label')
    }
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

describe('affichage progressif', () => {
  it('extrait les événements complets d’une sortie JSON en cours, chaînes comprises', () => {
    const debut = '{"events":[{"time":"22 h","description":"a } b","source":"x \\" y","origin":"o"},{"time":"23'
    const r1 = nouveauxEvenements(debut, 0)
    expect(r1.objets).toEqual([{ time: '22 h', description: 'a } b', source: 'x " y', origin: 'o' }])
    const r2 = nouveauxEvenements(`${debut} h","description":"c","source":"s","origin":"o"}],"gaps":[]}`, r1.position)
    expect(r2.objets).toEqual([{ time: '23 h', description: 'c', source: 's', origin: 'o' }])
  })
  it('envoie en NDJSON les lignes déjà vérifiées, puis le résultat final ; jamais une citation inventée', async () => {
    const app = createServer((req, res) => void nodeTimeline(req, res, env('hallucinate')))
    await new Promise((r) => app.listen(0, '127.0.0.1', () => r(null)))
    const a = /** @type {import('node:net').AddressInfo} */ (app.address())
    const r = await fetch(`http://127.0.0.1:${a.port}/api/timeline`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' }, body: JSON.stringify({ notes: NOTES }) })
    expect(r.headers.get('content-type')).toContain('application/x-ndjson')
    const lignes = (await r.text()).trim().split('\n').map((l) => JSON.parse(l))
    app.close()
    const events = lignes.filter((l) => l.type === 'event').map((l) => l.event)
    const final = lignes.at(-1)
    expect(events.length).toBeGreaterThan(0)
    expect(final).toMatchObject({ type: 'final', live: true })
    expect(events).toEqual(final.result.events)
    expect(JSON.stringify(events)).not.toContain('rencontré un homme')
    expect(JSON.stringify(events)).not.toContain('peu fiable')
  })
  it('sans demande de streaming, ou en cas d’erreur avant l’appel, répond en JSON ordinaire', async () => {
    const app = createServer((req, res) => void nodeTimeline(req, res, env('ok')))
    await new Promise((r) => app.listen(0, '127.0.0.1', () => r(null)))
    const a = /** @type {import('node:net').AddressInfo} */ (app.address())
    const url = `http://127.0.0.1:${a.port}/api/timeline`
    const brut = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: NOTES }) })
    expect(brut.headers.get('content-type')).toContain('application/json')
    const fuite = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' }, body: JSON.stringify({ notes: `${NOTES}\nTéléphone : 514-555-0147` }) })
    expect(fuite.status).toBe(422)
    expect(await fuite.json()).toMatchObject({ live: false, error: 'identifiers' })
    app.close()
  })
})
