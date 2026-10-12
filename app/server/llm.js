// @ts-check
// Fournisseur LLM compatible OpenAI (/v1/chat/completions), pensé pour un endpoint vLLM
// servi sur AMD Developer Cloud (GPU AMD Instinct, ROCm). Aucune dépendance : fetch natif.
// Configuration par variables d'environnement, lues côté serveur uniquement :
//   VLLM_BASE_URL   ex. http://<ip-du-droplet>:8000/v1
//   VLLM_MODEL      ex. Qwen/Qwen2.5-7B-Instruct
//   VLLM_API_KEY    la clé passée à `vllm serve --api-key` (jamais envoyée au navigateur)
//   VLLM_LABEL      libellé affiché dans l'appli, ex. « AMD Developer Cloud · MI300X »
//   VLLM_TIMEOUT_MS délai maximal d'une requête (défaut 45 000)
//   VLLM_JSON_SCHEMA « 0 » pour ne pas envoyer response_format (si l'endpoint ne le gère pas)

/**
 * @typedef {{ baseUrl: string, model: string, apiKey: string, label: string, timeoutMs: number, jsonSchema: boolean }} LlmConfig
 * @typedef {{ prompt_tokens?: number, completion_tokens?: number, total_tokens?: number }} Usage
 */

/**
 * @param {Record<string, string | undefined>} env
 * @returns {LlmConfig | null} null si l'endpoint n'est pas configuré
 */
export function configFromEnv(env) {
  const baseUrl = (env.VLLM_BASE_URL ?? '').trim().replace(/\/+$/, '')
  const model = (env.VLLM_MODEL ?? '').trim()
  if (!baseUrl || !model) return null
  return {
    baseUrl,
    model,
    apiKey: (env.VLLM_API_KEY ?? '').trim(),
    label: (env.VLLM_LABEL ?? '').trim() || 'vLLM',
    timeoutMs: Number(env.VLLM_TIMEOUT_MS) > 0 ? Number(env.VLLM_TIMEOUT_MS) : 45_000,
    jsonSchema: env.VLLM_JSON_SCHEMA !== '0',
  }
}

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
 * @param {{ system: string, user: string, schema?: object, schemaName?: string, maxTokens?: number }} req
 * @returns {Promise<{ json: unknown, model: string, usage: Usage, latencyMs: number }>}
 */
export async function chatJson(cfg, req) {
  const body = {
    model: cfg.model,
    temperature: 0,
    max_tokens: req.maxTokens ?? 2048,
    messages: [
      { role: 'system', content: req.system },
      { role: 'user', content: req.user },
    ],
    ...(cfg.jsonSchema && req.schema
      ? { response_format: { type: 'json_schema', json_schema: { name: req.schemaName ?? 'output', schema: req.schema, strict: true } } }
      : {}),
  }
  const t0 = performance.now()
  /** @type {Response} */
  let res
  try {
    res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    })
  } catch (e) {
    const name = e instanceof Error ? e.name : ''
    throw new LlmError(name === 'TimeoutError' ? 'timeout' : 'unreachable')
  }
  if (res.status === 401 || res.status === 403) throw new LlmError('unauthorized')
  if (!res.ok) throw new LlmError('upstream', String(res.status))
  /** @type {any} */
  const data = await res.json().catch(() => null)
  const choice = data?.choices?.[0]
  const content = choice?.message?.content
  if (typeof content !== 'string' || !content.trim()) throw new LlmError('empty')
  if (choice.finish_reason === 'length') throw new LlmError('truncated')
  let json
  try {
    json = JSON.parse(stripFences(content))
  } catch {
    throw new LlmError('invalid-json')
  }
  return { json, model: data.model ?? cfg.model, usage: data.usage ?? {}, latencyMs: Math.round(performance.now() - t0) }
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
