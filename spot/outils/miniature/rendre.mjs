// YouTube thumbnail, 1280×720, from miniature.html. Output: out/en/miniature_youtube.png
import { createRequire } from 'node:module'
const puppeteer = createRequire(`${process.env.HOME}/tools/site-shots/`)('puppeteer-core')
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] })
const p = await b.newPage(); await p.setViewport({ width: 1280, height: 720, deviceScaleFactor: Number(process.env.ECHELLE ?? 1) })
await p.goto(`file://${process.cwd()}/outils/miniature/miniature.html`, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready)
await p.screenshot({ path: process.env.SORTIE ?? 'out/en/miniature_youtube.png' }); await b.close(); console.log('✓ out/en/miniature_youtube.png')
