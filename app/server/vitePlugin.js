// @ts-check
// Branche /api/timeline et /api/health sur le serveur de dev et de prévisualisation de Vite.
import { nodeHealth, nodeTimeline } from './handler.js'

/**
 * @param {Record<string, string | undefined>} env variables VLLM_* (chargées depuis .env par vite.config.ts)
 * @returns {import('vite').Plugin}
 */
export function timelineApi(env) {
  /** @param {import('vite').Connect.Server} mw */
  const mount = (mw) => {
    mw.use('/api/timeline', (req, res) => void nodeTimeline(req, res, env))
    mw.use('/api/health', (req, res) => void nodeHealth(req, res, env))
  }
  return {
    name: 'timeline-api',
    configureServer: (server) => mount(server.middlewares),
    configurePreviewServer: (server) => mount(server.middlewares),
  }
}
