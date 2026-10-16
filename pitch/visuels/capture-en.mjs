// Captures en anglais des écrans patient de Boussole pour le diaporama anglais (390×844, échelle 2).
import { createRequire } from 'node:module'
const require = createRequire('/home/sam/tools/site-shots/')
const puppeteer = require('puppeteer-core')
const OUT = process.argv[2]
const BASE = 'http://127.0.0.1:8137'
const FIXE = Date.parse('2026-10-14T10:00:00-04:00')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] })
async function ouvrir() {
  const p = await b.newPage()
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateTimezone('America/Toronto')
  await p.evaluateOnNewDocument((fixe) => {
    const V = Date; const e = fixe - V.now()
    class F extends V { constructor(...a) { if (a.length) super(...a); else super(V.now() + e) } static now() { return V.now() + e } }
    window.Date = F
    Object.defineProperty(navigator, 'language', { get: () => 'en-US' })
    addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = 'html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'; document.head.appendChild(s) })
  }, FIXE)
  return p
}
let page = await ouvrir()
const clic = async (s) => { await page.waitForSelector(s, { visible: true, timeout: 10000 }); await page.evaluate((s) => document.querySelector(s).click(), s) }
const clicTexte = async (t, tags = 'button,a,label') => { const ok = await page.evaluate((t, tags) => { const el = [...document.querySelectorAll(tags)].find((e) => e.offsetParent !== null && (e.innerText || e.getAttribute('aria-label') || '').includes(t)); el?.click(); return !!el }, t, tags); if (!ok) throw new Error('Introuvable : ' + t) }
const remplir = (s, v) => page.evaluate((s, v) => { const el = document.querySelector(s); const pr = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(pr, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) }, s, v)
const shot = async (n, w = 900) => { await sleep(w); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: `${OUT}/${n}.png`, captureBeyondViewport: false }); console.log('✓', n) }
await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
await shot('arrivee')
await page.close(); page = await ouvrir(); await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
await clicTexte('I already have a space', 'button'); await page.waitForSelector('#login', { visible: true })
await clicTexte('Create one', 'button'); await page.waitForSelector('#create', { visible: true })
await remplir('#prenom', 'Camille'); await remplir('#email', 'camille@example.com'); await remplir('#pass1', 'Maple-Blue-2026'); await remplir('#pass2', 'Maple-Blue-2026')
await clic('#create'); await page.waitForSelector('#etapes', { visible: true, timeout: 20000 })
for (let i = 1; i <= 8; i++) { if (i === 4) await shot('etape-4', 700); await clic('#etape-next') }
await page.waitForSelector('#call-ligne', { visible: true }); await shot('accueil')
await clic('#mtab-recit'); await sleep(400); await clic('#recit-start')
await remplir('#q-quand', '2026-10-13T04:00'); await clic('#recit-next')
await remplir('#q-ou', 'Plateau-Mont-Royal'); await clic('#recit-next')
await remplir('#q-souvenirs', 'I walked home after the party. I remember the bar, then the street. After that, it is blurry.'); await clic('#recit-next')
await remplir('#q-oublis', 'The walk between the bar and the apartment.'); await clic('#recit-next')
for (const t of ['Memory gaps', 'Nausea']) await clicTexte(t, 'button')
await shot('recit-symptomes', 500)
await clic('#mtab-aller'); await page.waitForNetworkIdle({ idleTime: 700, timeout: 15000 }).catch(() => {})
if (await page.$('#vue-carte')) { await clic('#vue-carte'); await page.waitForNetworkIdle({ idleTime: 700, timeout: 15000 }).catch(() => {}) }
await page.evaluate(() => { document.querySelector('#vue-carte')?.scrollIntoView({ block: 'start', behavior: 'instant' }); scrollBy(0, -80) })
await shot('carte', 2500)
if (await page.$('#vue-liste')) await clic('#vue-liste')
await clic('#mtab-dossier'); await sleep(500); await clic('#consent-send'); await clic('#consent-beta')
await clic('#send'); await sleep(700); await clic('#confirm-send')
await page.waitForSelector('#rappel', { visible: true, timeout: 15000 })
await clic('.slot'); await remplir('#rappel-phone', '+1 514 555-0123'); await clic('#rappel-confirm')
await page.waitForSelector('#rappel-ok', { visible: true })
await page.evaluate(() => { document.querySelector('#rappel-ok').scrollIntoView({ block: 'start', behavior: 'instant' }); scrollBy(0, -90) })
await shot('rappel-confirme', 600)
await clic('#mtab-vie-privee'); await sleep(400); await page.evaluate(() => scrollTo(0, 0)); await shot('vie-privee')
await b.close()
