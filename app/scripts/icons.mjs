// @ts-nocheck
// Régénère les icônes PNG de la PWA à partir des SVG du logo (public/icons/*.svg).
//   npm i --no-save playwright && node scripts/icons.mjs
// (navigateur Chromium requis : npx playwright install chromium, ou PLAYWRIGHT_CHROMIUM=/chemin/vers/chrome)
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const dir = new URL('../public/icons/', import.meta.url)
const jobs = [
  ['icon.svg', 'icon-192.png', 192, 'transparent'],
  ['icon.svg', 'icon-512.png', 512, 'transparent'],
  ['maskable.svg', 'maskable-512.png', 512, '#6A4CE0'],
  ['icon.svg', 'apple-touch-icon.png', 180, '#FFF9F3'],
]
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {})
const page = await browser.newPage()
for (const [src, out, size, bg] of jobs) {
  const svg = await readFile(new URL(src, dir), 'utf8')
  const pad = out.startsWith('apple') ? Math.round(size * 0.1) : 0
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<html><body style="margin:0;background:${bg}"><div style="width:${size}px;height:${size}px;padding:${pad}px;box-sizing:border-box">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`)
  await page.screenshot({ path: new URL(out, dir).pathname, omitBackground: bg === 'transparent' })
  console.log('écrit', out)
}
await browser.close()
