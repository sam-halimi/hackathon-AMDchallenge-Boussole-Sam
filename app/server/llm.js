// @ts-check
// Fournisseur LLM compatible OpenAI (/chat/completions). Aucune dépendance : fetch natif.
// Cible prévue : un modèle ouvert servi par AMD (Token Factory, ou vLLM sur AMD Developer Cloud).
// Configuration par variables d'environnement, lues côté serveur uniquement :
//   AI_BASE_URL     URL de base compatible OpenAI, sans « /chat/completions » (ex. https://<hôte>/v1)
//   AI_MODEL        identifiant du modèle tel que l'endpoint l'attend
//   AI_API_KEY      clé de l'endpoint (jamais envoyée au navigateur, jamais journalisée)
//   AI_LABEL        libellé affiché dans l'appli à côté d'une réponse EN DIRECT
//   AI_TIMEOUT_MS   délai maximal d'une génération, attente et nouvelles tentatives comprises (défaut 45 000)
//   AI_RESPONSE_FORMAT  json_schema (défaut) · json_object (le schéma passe alors dans la consigne) · none
//   AI_REASONING_EFFORT optionnel (ex. low), envoyé tel quel si défini
//   AI_RATE_PER_MIN  requêtes par minute vers l'endpoint (défaut 30 : limite AMD Token Factory par clé)
//   AI_MAX_CONCURRENT requêtes simultanées vers l'endpoint (défaut 2)
//   AI_STREAM       « 0 » pour désactiver le streaming (activé par défaut : la connexion reste active
//                   pendant une longue génération ; la réponse est recomposée ici, jamais relayée brute)
//   AI_JSON_SCHEMA  ancien réglage : « 0 » équivaut à AI_RESPONSE_FORMAT=none
// Les anciens noms VLLM_* (même suffixe) restent lus en repli, pour compatibilité.

/**
 * @typedef {{ baseUrl: string, model: string, apiKey: string, label: string, timeoutMs: number, responseFormat: 'json_schema' | 'json_object' | 'none', reasoningEffort: string, ratePerMin: number, maxConcurrent: number, stream: boolean }} LlmConfig
 * @typedef {{ prompt_tokens?: number, completion_tokens?: number, total_tokens?: number }} Usage
 */

/**
 * @param {Record<string, string | undefined>} env
 * @returns {LlmConfig | null} null si l'endpoint n'est pas configuré
 */
export function configFromEnv(env) {
  /** AI_<nom>, sinon l'ancien VLLM_<nom>. @param {string} nom */
  const v = (nom) => (env[`AI_${nom}`] || env[`VLLM_${nom}`] || '').trim()
  const baseUrl = v('BASE_URL').replace(/\/+$/, '').replace(/\/chat\/completions$/, '')
  const model = v('MODEL')
  if (!baseUrl || !model) return null
  return {
    baseUrl,
    model,
    apiKey: v('API_KEY'),
    label: v('LABEL') || 'API compatible OpenAI',
    timeoutMs: Number(v('TIMEOUT_MS')) > 0 ? Number(v('TIMEOUT_MS')) : 45_000,
    responseFormat: format(v('RESPONSE_FORMAT'), v('JSON_SCHEMA')),
    reasoningEffort: v('REASONING_EFFORT'),
    ratePerMin: Number(v('RATE_PER_MIN')) > 0 ? Number(v('RATE_PER_MIN')) : 30,
    maxConcurrent: Number(v('MAX_CONCURRENT')) > 0 ? Number(v('MAX_CONCURRENT')) : 2,
    stream: v('STREAM') !== '0',
  }
}

/** @param {string} f @param {string} ancien @returns {LlmConfig['responseFormat']} */
const format = (f, ancien) => (f === 'json_object' || f === 'none' || f === 'json_schema' ? f : ancien === '0' ? 'none' : 'json_schema')

// ---------------------------------------------------------------------------
// Débit et file d'attente, partagés par toutes les requêtes de ce processus (une instance serverless
// ou le serveur autonome). Fenêtre glissante d'une minute + nombre de requêtes simultanées.
// ---------------------------------------------------------------------------
/** @type {number[]} */
const fenetre = []
let actives = 0
const pause = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms))

/** Attend une place (débit et simultanéité) avant l'échéance, sinon « rate-limited ». @param {LlmConfig} cfg @param {number} echeance */
async function place(cfg, echeance) {
  for (;;) {
    const now = Date.now()
    while (fenetre.length && now - fenetre[0] > 60_000) fenetre.shift()
    if (actives < cfg.maxConcurrent && fenetre.length < cfg.ratePerMin) {
      actives++
      fenetre.push(now)
      return
    }
    const attente = fenetre.length >= cfg.ratePerMin ? 60_000 - (now - fenetre[0]) + 20 : 150
    if (now + attente > echeance) throw new LlmError('rate-limited')
    await pause(Math.min(attente, 1000))
  }
}
const libere = () => {
  actives = Math.max(0, actives - 1)
}

/** Délai avant nouvelle tentative : Retry-After si fourni, sinon exponentiel avec gigue. @param {Response} res @param {number} essai */
function delaiRetry(res, essai) {
  const ra = res.headers.get('retry-after')
  const s = ra && /^\d+(\.\d+)?$/.test(ra.trim()) ? Number(ra) * 1000 : ra ? Date.parse(ra) - Date.now() : NaN
  const base = Number.isFinite(s) && s > 0 ? s : 800 * 2 ** essai
  return Math.min(base + Math.random() * 400, 10_000)
}
const RETRY = new Set([429, 502, 503])
const MAX_RETRIES = 3

export class LlmError extends Error {
  /** @param {string} code @param {string} [detail] */
  constructor(code, detail) {
    super(detail ? `${code}: ${detail}` : code)
    this.code = code
  }
}

/** Retire d'éventuelles balises ```json autour d'une réponse. */
export const stripFences = (/** @type {string} */ s) => s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')

/**
 * Appelle le modèle et renvoie l'objet JSON produit.
 * @param {LlmConfig} cfg
 * @param {{ system: string, user: string, schema?: object, schemaName?: string, maxTokens?: number, onDelta?: (texte: string) => void }} req
 * @returns {Promise<{ json: unknown, model: string, usage: Usage, latencyMs: number }>}
 */
export async function chatJson(cfg, req) {
  // json_object : l'endpoint garantit du JSON mais pas sa forme ; on donne donc le schéma dans la consigne.
  const system = cfg.responseFormat !== 'json_schema' && req.schema
    ? `${req.system}\n\nFormat de sortie obligatoire : un seul objet JSON, sans texte autour, conforme à ce schéma JSON :\n${JSON.stringify(req.schema)}`
    : req.system
  const body = {
    model: cfg.model,
    temperature: 0,
    max_tokens: req.maxTokens ?? 2048,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: req.user },
    ],
    ...(cfg.responseFormat === 'json_schema' && req.schema
      ? { response_format: { type: 'json_schema', json_schema: { name: req.schemaName ?? 'output', schema: req.schema, strict: true } } }
      : cfg.responseFormat === 'json_object'
        ? { response_format: { type: 'json_object' } }
        : {}),
    ...(cfg.reasoningEffort ? { reasoning_effort: cfg.reasoningEffort } : {}),
    ...(cfg.stream ? { stream: true, stream_options: { include_usage: true } } : {}),
  }
  const t0 = performance.now()
  const echeance = Date.now() + cfg.timeoutMs
  await place(cfg, echeance)
  /** @type {Response} */
  let res
  try {
    for (let essai = 0; ; essai++) {
      const reste = echeance - Date.now()
      if (reste <= 0) throw new LlmError('timeout')
      try {
        res = await fetch(`${cfg.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(reste),
        })
      } catch (e) {
        const name = e instanceof Error ? e.name : ''
        throw new LlmError(name === 'TimeoutError' ? 'timeout' : 'unreachable')
      }
      if (!RETRY.has(res.status) || essai >= MAX_RETRIES) break
      const d = delaiRetry(res, essai)
      if (Date.now() + d >= echeance) break
      await res.body?.cancel().catch(() => undefined)
      await pause(d)
    }
  } finally {
    libere()
  }
  if (res.status === 401 || res.status === 403) throw new LlmError('unauthorized')
  if (res.status === 429) throw new LlmError('rate-limited')
  if (!res.ok) throw new LlmError('upstream', String(res.status))
  /** @type {any} */
  const data = cfg.stream && /event-stream/.test(res.headers.get('content-type') ?? '') ? await lireFlux(res, echeance, req.onDelta) : await res.json().catch(() => null)
  const choice = data?.choices?.[0]
  const content = choice?.message?.content
  if (choice?.finish_reason === 'length') throw new LlmError('truncated')
  if (typeof content !== 'string' || !content.trim()) throw new LlmError('empty')
  let json
  try {
    json = JSON.parse(stripFences(content))
  } catch {
    throw new LlmError('invalid-json')
  }
  return { json, model: data.model ?? cfg.model, usage: data.usage ?? {}, latencyMs: Math.round(performance.now() - t0) }
}

/**
 * Recompose une réponse en streaming (SSE) au format non streamé : { model, usage, choices: [{ message, finish_reason }] }.
 * @param {Response} res @param {number} echeance @param {(texte: string) => void} [onDelta] reçoit la sortie accumulée
 */
async function lireFlux(res, echeance, onDelta) {
  if (!res.body) return null
  const dec = new TextDecoder()
  let tampon = ''
  let contenu = ''
  /** @type {any} */
  let fin = null
  let modele = ''
  /** @type {any} */
  let usage = {}
  try {
    for await (const morceau of /** @type {any} */ (res.body)) {
      if (Date.now() > echeance) throw new LlmError('timeout')
      tampon += dec.decode(morceau, { stream: true })
      let i
      while ((i = tampon.indexOf('\n')) >= 0) {
        const ligne = tampon.slice(0, i).trim()
        tampon = tampon.slice(i + 1)
        if (!ligne.startsWith('data:')) continue
        const charge = ligne.slice(5).trim()
        if (charge === '[DONE]') continue
        let j
        try {
          j = JSON.parse(charge)
        } catch {
          continue
        }
        modele = j.model ?? modele
        if (j.usage) usage = j.usage
        const c = j.choices?.[0]
        if (c?.delta?.content) {
          contenu += c.delta.content
          onDelta?.(contenu)
        }
        if (c?.finish_reason) fin = c.finish_reason
      }
    }
  } catch (e) {
    if (e instanceof LlmError) throw e
    throw new LlmError(e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'unreachable')
  }
  return { model: modele || undefined, usage, choices: [{ message: { content: contenu }, finish_reason: fin }] }
}

/**
 * Vérifie que l'endpoint répond (GET /models).
 * @param {LlmConfig} cfg
 */
export async function ping(cfg) {
  try {
    const res = await fetch(`${cfg.baseUrl}/models`, {
      headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {},
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}
