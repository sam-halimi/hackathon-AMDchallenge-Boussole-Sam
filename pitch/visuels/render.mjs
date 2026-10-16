import { createRequire } from 'node:module'
const require = createRequire('/home/sam/tools/site-shots/')
const puppeteer = require('puppeteer-core')
const [file, outDir] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] })
const p = await b.newPage(); await p.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 2 })
await p.goto('file://' + file, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready)
for (const id of await p.evaluate(() => [...document.querySelectorAll('.c, .poster')].map((e) => e.id))) {
  const el = await p.$('#' + id); await el.screenshot({ path: `${outDir}/${id}.png`, omitBackground: true }); process.stdout.write(id + ' ')
}
await b.close()
