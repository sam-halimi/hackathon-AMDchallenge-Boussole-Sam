// @ts-check
// Plugin Vite : produit dist/sw.js à partir de pwa/sw.js, avec la liste exacte des fichiers
// construits (JS, CSS, polices, icônes) à mettre en cache pour le mode hors ligne.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

/** @returns {import('vite').Plugin} */
export function serviceWorker() {
  return {
    name: 'boussole-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      // Polices : seulement les sous-ensembles latins (les autres se chargent au besoin).
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.endsWith('.LICENSE.txt') && !/(cyrillic|vietnamese|greek)/.test(f))
      const statics = ['./', './index.html', './offline.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg']
      const precache = [...statics, ...files.map((f) => `./${f}`)]
      const version = createHash('sha256').update(files.sort().join('|')).digest('hex').slice(0, 12)
      const src = readFileSync(new URL('../pwa/sw.js', import.meta.url), 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify([...new Set(precache)], null, 2))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src })
    },
  }
}
