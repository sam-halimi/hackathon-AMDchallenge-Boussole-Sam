// Three map views for the English scaling sequence (same Leaflet style as the deck's Canada map):
// Montreal close-up, Canada by phase, and the world. Output: public/img/carte-{montreal,canada-en,monde}.png (3200×1800).
import { createRequire } from 'node:module'
const puppeteer = createRequire(`${process.env.HOME}/tools/site-shots/`)('puppeteer-core')
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] })
for (const [nom, sortie] of [['montreal', 'carte-montreal'], ['canada', 'carte-canada-en'], ['monde', 'carte-monde']]) {
  const p = await b.newPage(); await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 })
  await p.goto(`file://${process.cwd()}/outils/cartes/${nom}.html`, { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(() => document.fonts.ready); await new Promise((r) => setTimeout(r, 1500))
  await p.screenshot({ path: `public/img/${sortie}.png`, clip: { x: 0, y: 0, width: 1600, height: 900 } })
  console.log('✓', sortie); await p.close()
}
await b.close()
