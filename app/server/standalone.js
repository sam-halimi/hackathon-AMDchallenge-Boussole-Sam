// @ts-check
// Petit serveur Node autonome : sert l'appli construite (dist/) et la route IA.
// Peut tourner sur le droplet AMD Developer Cloud, à côté de vLLM, ou sur n'importe quel hôte Node.
//   npm run build && npm start          (lit .env s'il existe)
// Variables : PORT (défaut 8080), HOST (défaut 127.0.0.1), ALLOWED_ORIGINS (CORS, liste séparée par des virgules),
// RATE_LIMIT_PER_MIN (défaut 20 requêtes IA par minute et par adresse), plus les AI_* (voir llm.js).
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nodeHealth, nodeTimeline } from './handler.js'
import { configFromEnv } from './llm.js'

const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const PORT = Number(process.env.PORT ?? 8080)
const HOST = process.env.HOST ?? '127.0.0.1'
const ORIGINS = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const LIMIT = Number(process.env.RATE_LIMIT_PER_MIN ?? 20)

/** @type {Record<string, string>} */
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain',
}

/** @type {Map<string, { n: number, t: number }>} */
const hits = new Map()
const limited = (/** @type {string} */ ip) => {
  const now = Date.now()
  if (hits.size > 10_000) for (const [k, v] of hits) if (now - v.t > 60_000) hits.delete(k)
  const h = hits.get(ip)
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now })
    return false
  }
  h.n++
  return h.n > LIMIT
}

/** @param {import('node:http').IncomingMessage} req @param {import('node:http').ServerResponse} res */
async function handle(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Frame-Options', 'DENY')
  const url = new URL(req.url ?? '/', 'http://local')
  const origin = req.headers.origin
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Vary', 'Origin')
  }
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }
  if (url.pathname === '/api/health') return nodeHealth(req, res, process.env)
  if (url.pathname === '/api/timeline') {
    if (limited(req.socket.remoteAddress ?? '?')) {
      res.statusCode = 429
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ live: false, error: 'rate-limited' }))
    }
    // Journal minimal : jamais le contenu des notes.
    const t0 = Date.now()
    await nodeTimeline(req, res, process.env)
    return console.log(`[api] timeline ${res.statusCode} ${Date.now() - t0} ms`)
  }

  // Fichiers statiques ; routage par ancre (#/), donc tout le reste renvoie index.html.
  let path = '/'
  try {
    path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  } catch {
    // URL mal encodée : on sert l'accueil plutôt que de planter.
  }
  if (path.endsWith('/')) path += 'index.html'
  let file = join(DIST, path)
  if (!file.startsWith(DIST)) file = join(DIST, 'index.html')
  try {
    if (!(await stat(file)).isFile()) throw new Error()
  } catch {
    file = join(DIST, 'index.html')
  }
  try {
    const data = await readFile(file)
    res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
    res.setHeader('Cache-Control', file.includes(`${DIST}/assets/`) ? 'public, max-age=31536000, immutable' : 'no-cache')
    res.end(data)
  } catch {
    res.statusCode = 404
    res.end('Lancez « npm run build » avant « npm start ».')
  }
}

const server = createServer((req, res) => {
  handle(req, res).catch(() => {
    // Erreur inattendue : réponse 500 sans détail, le serveur continue.
    if (!res.headersSent) res.statusCode = 500
    res.end()
  })
})

server.listen(PORT, HOST, () => {
  const cfgIa = configFromEnv(process.env)
  const ai = cfgIa ? `IA : ${cfgIa.model} (${cfgIa.label})${cfgIa.apiKey ? '' : ', sans clé'}` : 'IA non configurée : réponse pré-enregistrée étiquetée'
  console.log(`Boussole sur http://${HOST}:${PORT} · ${ai}`)
})
