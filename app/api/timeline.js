// @ts-check
// Fonction serverless (Vercel, runtime Node) : même route que le serveur autonome.
// Variables à définir dans le projet d'hébergement : AI_BASE_URL, AI_MODEL, AI_API_KEY, AI_LABEL (voir server/llm.js).
import { nodeTimeline } from '../server/handler.js'

/** @param {import('node:http').IncomingMessage & { body?: unknown }} req @param {import('node:http').ServerResponse} res */
export default function handler(req, res) {
  return nodeTimeline(req, res, process.env)
}
