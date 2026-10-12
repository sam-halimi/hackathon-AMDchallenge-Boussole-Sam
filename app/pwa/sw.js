// Service worker de Boussole (gabarit, pwa/sw.js : la liste des fichiers est injectée au build par scripts/swPlugin.js).
// - Coquille de l'appli en cache : l'espace personnel (chiffré sur l'appareil) s'ouvre sans réseau.
// - Jamais de cache pour /api/ (IA) ni pour les tuiles de carte ou autres domaines.
// - Si rien n'est en cache : page hors ligne avec les numéros d'urgence.
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
const CACHE = `boussole-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('boussole-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.includes('/api/')) return

  if (req.mode === 'navigate') {
    // Réseau d'abord (version à jour), puis coquille en cache, puis page hors ligne.
    event.respondWith(
      fetch(req).catch(async () => (await caches.match('./index.html', { ignoreSearch: true })) ?? (await caches.match('./offline.html'))),
    )
    return
  }
  // Fichiers de l'appli : cache d'abord (noms versionnés), mise en cache au passage.
  event.respondWith(
    caches.match(req).then((hit) => hit ?? fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
      }
      return res
    })),
  )
})
