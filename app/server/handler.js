// @ts-check
// Route /api/timeline, indépendante du serveur qui l'héberge (Vite en dev, fonction serverless,
// serveur Node autonome). Reçoit UNIQUEMENT des notes déjà pseudonymisées par l'appli ;
// la clé de l'endpoint reste ici, côté serveur.
import { findIdentifiers } from '../shared/identifiers.js'
import { chatJson, configFromEnv, LlmError, ping } from './llm.js'
import { applyGuardrails, hasShape, SCHEMA, SYSTEM } from './timeline.js'

export const MAX_NOTES_CHARS = 12_000

/**
 * @typedef {{ status: number, body: Record<string, unknown> }} ApiResponse
 */

/**
 * @param {unknown} payload corps JSON déjà lu
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<ApiResponse>}
 */
export async function handleTimeline(payload, env) {
  const notes = /** @type {any} */ (payload)?.notes
  if (typeof notes !== 'string' || !notes.trim()) return { status: 400, body: { live: false, error: 'bad-request' } }
  if (notes.length > MAX_NOTES_CHARS) return { status: 413, body: { live: false, error: 'too-long' } }

  // Contrôle de second niveau : si un identifiant direct a échappé à la pseudonymisation,
  // on refuse l'envoi au modèle (et on ne renvoie pas le texte).
  const leaks = findIdentifiers(notes)
  if (leaks.length) return { status: 422, body: { live: false, error: 'identifiers', found: leaks } }

  const cfg = configFromEnv(env)
  if (!cfg) return { status: 503, body: { live: false, error: 'not-configured' } }

  const user = `Notes (pseudonymisées) :\n\n${notes}`
  let lastError = 'error'
  // Une seule nouvelle tentative, seulement si la sortie est mal formée.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await chatJson(cfg, { system: SYSTEM, user, schema: SCHEMA, schemaName: 'chronologie', maxTokens: 3000 })
      if (!hasShape(r.json)) {
        lastError = 'bad-shape'
        continue
      }
      const { result, removed } = applyGuardrails(r.json, notes)
      return {
        status: 200,
        body: { live: true, provider: 'vllm', label: cfg.label, model: r.model, latencyMs: r.latencyMs, usage: r.usage, result, removed },
      }
    } catch (e) {
      lastError = e instanceof LlmError ? e.code : 'error'
      if (lastError !== 'invalid-json') break
    }
  }
  return { status: 503, body: { live: false, error: lastError } }
}

/**
 * État de l'endpoint, sans rien divulguer de sa configuration.
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<ApiResponse>}
 */
export async function handleHealth(env) {
  const cfg = configFromEnv(env)
  if (!cfg) return { status: 200, body: { configured: false, reachable: false } }
  return { status: 200, body: { configured: true, reachable: await ping(cfg), label: cfg.label, model: cfg.model } }
}

/**
 * Adaptateur Node (http.IncomingMessage / ServerResponse), utilisé par Vite, le serveur autonome
 * et la fonction serverless. Corps limité à 64 Ko, jamais journalisé.
 * @param {import('node:http').IncomingMessage & { body?: unknown }} req
 * @param {import('node:http').ServerResponse} res
 * @param {Record<string, string | undefined>} env
 */
export async function nodeTimeline(req, res, env) {
  /** @param {ApiResponse} r */
  const send = (r) => {
    res.statusCode = r.status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(r.body))
  }
  if (req.method !== 'POST') return send({ status: 405, body: { live: false, error: 'method' } })
  let payload = req.body
  if (payload === undefined) {
    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > 64_000) return send({ status: 413, body: { live: false, error: 'too-long' } })
    }
    try {
      payload = JSON.parse(raw)
    } catch {
      return send({ status: 400, body: { live: false, error: 'bad-request' } })
    }
  } else if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload)
    } catch {
      return send({ status: 400, body: { live: false, error: 'bad-request' } })
    }
  }
  send(await handleTimeline(payload, env))
}

/**
 * @param {import('node:http').IncomingMessage} _req
 * @param {import('node:http').ServerResponse} res
 * @param {Record<string, string | undefined>} env
 */
export async function nodeHealth(_req, res, env) {
  const r = await handleHealth(env)
  res.statusCode = r.status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(r.body))
}
