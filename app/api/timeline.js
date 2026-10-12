// @ts-check
// Fonction serverless (Vercel, runtime Node) : même route que le serveur autonome.
// Variables à définir dans le projet d'hébergement : VLLM_BASE_URL, VLLM_MODEL, VLLM_API_KEY, VLLM_LABEL.
import { nodeTimeline } from '../server/handler.js'

/** @param {import('node:http').IncomingMessage & { body?: unknown }} req @param {import('node:http').ServerResponse} res */
export default function handler(req, res) {
  return nodeTimeline(req, res, process.env)
}
