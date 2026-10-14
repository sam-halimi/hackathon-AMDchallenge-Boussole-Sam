// Captures et mesures de tous les écrans de Boussole, pour l'audit UX (avant) et la recette (après).
//   cd app && npm run build && PORT=8137 npm start
//   node docs/ux-v2/capture.mjs avant            (ou « apres »)
// Variables : BASE (défaut http://127.0.0.1:8137), PUPPETEER_FROM (dossier où puppeteer-core est installé),
// CHROME (défaut /usr/bin/google-chrome), ONLY (ex. 375x667 pour un seul format).
// L'horloge du navigateur est figée (14 octobre 2026, 10 h, heure de Montréal) pour que les deux séries
// de captures soient comparables. Données saisies : fictives.
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(process.env.PUPPETEER_FROM ?? '/home/sam/tools/site-shots/')
const puppeteer = require('puppeteer-core')

const HERE = dirname(fileURLToPath(import.meta.url))
const SERIE = process.argv[2] ?? 'avant'
const OUT = join(HERE, SERIE)
const BASE = process.env.BASE ?? 'http://127.0.0.1:8137'
const FIXED = Date.parse('2026-10-14T10:00:00-04:00')
const VIEWPORTS = [
  { w: 375, h: 667, mobile: true },
  { w: 360, h: 640, mobile: true },
  { w: 1280, h: 800, mobile: false },
].filter((v) => !process.env.ONLY || process.env.ONLY === `${v.w}x${v.h}`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* Mesures faites dans la page : débordements, zones de clic, petits textes, contrastes. */
function measure() {
  const vw = innerWidth, vh = innerHeight
  const de = document.documentElement
  const dialog = document.querySelector('[role=dialog]')
  const root = dialog ?? document.body
  const cv = document.createElement('canvas'); cv.width = cv.height = 1
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  const cache = new Map()
  const rgba = (c) => {
    if (cache.has(c)) return cache.get(c)
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    const v = [d[0], d[1], d[2], d[3] / 255]; cache.set(c, v); return v
  }
  const over = (top, under) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1) }
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]) }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  const hex = (c) => '#' + [0, 1, 2].map((i) => Math.round(c[i]).toString(16).padStart(2, '0')).join('')
  const visible = (el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el)
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const label = (el) => (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || el.id || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 48)
  const bgOf = (el) => {
    const stack = []; let image = false; let opacity = 1
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.backgroundImage !== 'none') image = true
      opacity *= parseFloat(cs.opacity)
      const c = rgba(cs.backgroundColor); if (c[3] > 0) stack.push(c)
    }
    let bg = [255, 255, 255, 1]
    for (const c of stack.reverse()) bg = over(c, bg)
    return { bg, image, opacity }
  }

  /* Zones de clic */
  const targets = []
  for (const el of root.querySelectorAll('a[href],button,input,textarea,select,[role=button],[role=option],[role=radio],label')) {
    if (el.matches('input[type=hidden]') || !visible(el)) continue
    if (el.matches('input.sr-only')) continue
    if (el.tagName === 'LABEL' && !el.querySelector('input.sr-only')) continue
    const r = el.getBoundingClientRect()
    if (Math.min(r.width, r.height) < 47.5) targets.push({ t: label(el), w: Math.round(r.width), h: Math.round(r.height), leaflet: !!el.closest('.leaflet-container'), off: !!el.closest('[disabled]') })
  }

  /* Textes : taille et contraste */
  const small = new Map(); const low = new Map(); const seen = new Set()
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const txt = n.nodeValue.replace(/\s+/g, ' ').trim(); const el = n.parentElement
    if (!txt || !el || !visible(el) || el.closest('.sr-only,.leaflet-container,script,style')) continue
    const cs = getComputedStyle(el); const size = parseFloat(cs.fontSize); const weight = parseInt(cs.fontWeight, 10)
    if (size < 16) { const k = `${size}`; const s = small.get(k) ?? { px: size, n: 0, ex: [] }; s.n += txt.length; if (s.ex.length < 4 && !s.ex.includes(txt.slice(0, 40))) s.ex.push(txt.slice(0, 40)); small.set(k, s) }
    if (seen.has(el)) continue; seen.add(el)
    const { bg, image, opacity } = bgOf(el)
    let fg = over(rgba(cs.color), bg); if (opacity < 1) fg = over([fg[0], fg[1], fg[2], opacity], bg)
    const r = ratio(fg, bg); const big = size >= 24 || (size >= 18.66 && weight >= 700)
    if (r < (big ? 3 : 4.5)) {
      const k = `${hex(fg)}/${hex(bg)}/${size}/${big}`
      const s = low.get(k) ?? { fg: hex(fg), bg: hex(bg), px: size, w: weight, ratio: Math.round(r * 100) / 100, need: big ? 3 : 4.5, n: 0, ex: [], image, off: !!el.closest('[disabled]') }
      s.n++; if (s.ex.length < 3) s.ex.push(txt.slice(0, 40)); low.set(k, s)
    }
  }
  for (const el of root.querySelectorAll('input[placeholder],textarea[placeholder]')) {
    if (!visible(el) || el.value) continue
    const { bg } = bgOf(el); const fg = over(rgba(getComputedStyle(el, '::placeholder').color), bg); const r = ratio(fg, bg)
    if (r < 4.5) { const k = `ph/${hex(fg)}/${hex(bg)}`; const s = low.get(k) ?? { fg: hex(fg), bg: hex(bg), px: parseFloat(getComputedStyle(el).fontSize), ratio: Math.round(r * 100) / 100, need: 4.5, n: 0, ex: [], placeholder: true }; s.n++; if (s.ex.length < 3) s.ex.push(el.placeholder.slice(0, 40)); low.set(k, s) }
  }

  /* Défilements internes, contenus coupés, débordement horizontal */
  const innerScroll = []; const clipped = []; const wide = []
  for (const el of root.querySelectorAll('*')) {
    if (!visible(el) || el.closest('.leaflet-container')) continue
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
    const name = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${(el.className?.baseVal ?? el.className ?? '').toString().split(' ').slice(0, 3).join('.')}`
    if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) innerScroll.push({ el: name, axe: 'y', contenu: el.scrollHeight, visible: el.clientHeight })
    if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) innerScroll.push({ el: name, axe: 'x', contenu: el.scrollWidth, visible: el.clientWidth })
    if (cs.overflowY === 'hidden' && el.clientHeight > 60 && el.scrollHeight > el.clientHeight + 2) clipped.push({ el: name, contenu: el.scrollHeight, visible: el.clientHeight })
    if (r.right > vw + 1 && r.width > 0 && cs.position !== 'fixed' && wide.length < 6) wide.push({ el: name, droite: Math.round(r.right) })
  }
  const dr = dialog?.getBoundingClientRect()
  return {
    vw, vh, echelle: Math.round((window.visualViewport?.scale ?? 1) * 1000) / 1000, largeurContenu: de.scrollWidth, hauteurPage: de.scrollHeight, ecrans: Math.round((de.scrollHeight / vh) * 10) / 10,
    debordementHorizontal: de.scrollWidth > vw + 1 ? de.scrollWidth - vw : 0, horsEcran: de.scrollWidth > vw + 1 ? wide : [],
    fenetre: dr ? { haut: Math.round(dr.top), bas: Math.round(dr.bottom), depasse: dr.top < -1 || dr.bottom > vh + 1 } : null,
    defilementInterne: innerScroll, contenuCoupe: clipped,
    petitesCibles: targets, petitsTextes: [...small.values()].sort((a, b) => a.px - b.px), contrastesFaibles: [...low.values()].sort((a, b) => a.ratio - b.ratio),
  }
}

async function run(vp) {
  const tag = `${vp.w}x${vp.h}`
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--lang=fr-CA'] })
  const errors = []
  const open = async () => {
    const p = await browser.newPage()
    await p.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile })
    await p.emulateTimezone('America/Toronto')
    await p.evaluateOnNewDocument((fixed) => {
      const Real = Date; const off = fixed - Real.now()
      class Fixed extends Real {
        constructor(...a) { if (a.length) super(...a); else super(Real.now() + off) }
        static now() { return Real.now() + off }
      }
      window.Date = Fixed
    }, FIXED)
    p.on('pageerror', (e) => errors.push(String(e)))
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    return p
  }
  let page = await open()

  const results = []
  let order = 0
  let extras = 0
  // extra : écran qui n'existe que dans la V2. Il prend le numéro du précédent suivi d'une lettre,
  // pour que les écrans communs gardent le même numéro dans « avant » et « apres ».
  const shot = async (name, { at, full = true, wait = 1100, extra = false } = {}) => {
    await sleep(wait)
    if (at) await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'start', behavior: 'instant' }), at)
    else if (!(await page.$('[role=dialog]'))) await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await sleep(200)
    if (extra) extras++; else { order++; extras = 0 }
    const id = `${String(order).padStart(2, '0')}${extra ? String.fromCharCode(96 + extras) : ''}-${name}`
    await page.screenshot({ path: join(OUT, tag, `${id}.webp`), type: 'webp', quality: 88, captureBeyondViewport: false })
    const m = await page.evaluate(measure)
    if (full && !m.fenetre && m.hauteurPage > vp.h + 8) await page.screenshot({ path: join(OUT, tag, `${id}--page.webp`), type: 'webp', quality: 82, fullPage: true })
    results.push({ ecran: id, ...m })
    process.stdout.write(`  ${tag} ${id}\n`)
  }
  const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.evaluate((s) => document.querySelector(s).click(), sel) }
  const clickText = async (text, tags = 'button,a,label') => {
    const ok = await page.evaluate((text, tags) => {
      const el = [...document.querySelectorAll(tags)].find((e) => e.offsetParent !== null && (e.innerText || e.getAttribute('aria-label') || '').includes(text))
      el?.click(); return !!el
    }, text, tags)
    if (!ok) throw new Error(`Introuvable : « ${text} »`)
  }
  const fill = (sel, val, nth = 0) => page.evaluate((sel, val, nth) => {
    const el = document.querySelectorAll(sel)[nth]; if (!el) throw new Error(`Champ introuvable : ${sel}`)
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, sel, val, nth)
  const tab = (id) => click(vp.mobile ? `#mtab-${id}` : `#tab-${id}`)
  const idle = () => page.waitForNetworkIdle({ idleTime: 700, timeout: 15000 }).catch(() => {})
  const step = async (name, fn) => { try { await fn() } catch (e) { errors.push(`[${name}] ${e.message}`); process.stdout.write(`  ! ${tag} ${name} : ${e.message}\n`) } }

  await mkdir(join(OUT, tag), { recursive: true })
  await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })

  await step('diapos', async () => {
    for (let i = 1; i <= 5; i++) { await shot(`arrivee-diapo-${i}`); if (i < 5) await click('#intro-next') }
  })

  // Les diapos peuvent laisser la page zoomée (voir « echelle » dans les mesures), et ce zoom survit à un
  // rechargement : on repart d'un onglet neuf et on rejoint la création de compte sans repasser par elles,
  // pour juger chaque écran à l'échelle 1.
  await step('compte', async () => {
    await page.close(); page = await open()
    await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
    await clickText('déjà un espace', 'button'); await page.waitForSelector('#login', { visible: true })
    await clickText('En créer un', 'button')
    await page.waitForSelector('#create', { visible: true })
    await shot('compte-vide')
    await fill('#prenom', 'Camille'); await fill('#email', 'camille@exemple.com'); await fill('#pass1', 'Erable-Bleu-2026'); await fill('#pass2', 'Erable-Bleu-2027')
    await click('#create')
    await shot('compte-erreur', { wait: 700 })
    await fill('#pass2', 'Erable-Bleu-2026'); await click('#create')
    await page.waitForSelector('#etapes', { visible: true, timeout: 20000 })
  })

  await step('etapes', async () => {
    for (let i = 1; i <= 8; i++) { await shot(`etapes-${i}`, { wait: 900 }); if (i < 8) await click('#etape-next') }
    await click('#etape-next')
  })

  await step('accueil', async () => {
    await shot('accueil')
    await page.setOfflineMode(true); await shot('accueil-hors-ligne', { full: false, wait: 600 }); await page.setOfflineMode(false)
  })

  await step('recit', async () => {
    await tab('recit'); await shot('recit-vide')
    const souvenirs = 'Je suis rentrée à pied après la soirée. Je me souviens du bar, puis de la rue. Ensuite, c’est flou.'
    const oublis = 'Le trajet entre le bar et l’appartement.'
    if (await page.$('#recit-start')) {
      // V2 : une question à la fois, puis la vue d'ensemble.
      await click('#recit-start'); await fill('#q-quand', '2026-10-13T04:00'); await shot('recit-question-quand', { extra: true, wait: 500 }); await click('#recit-next')
      await fill('#q-ou', 'Plateau-Mont-Royal'); await click('#recit-next')
      await fill('#q-souvenirs', souvenirs); await shot('recit-question-souvenirs', { extra: true, wait: 500 }); await click('#recit-next')
      await fill('#q-oublis', oublis); await click('#recit-next')
      for (const t of ['Trous de mémoire', 'Nausées']) await clickText(t, 'button')
      await shot('recit-question-symptomes', { extra: true, wait: 500 }); await click('#recit-next')
      await clickText('Je ne sais pas', 'button'); await shot('recit-question-substance', { extra: true, wait: 500 }); await click('#recit-next')
      await click('#recit-next')
      await clickText('Gardés tels quels', 'button'); await click('#recit-next')
      for (const t of ['Parler à quelqu’un', 'Un examen médical']) await clickText(t, 'button')
      await click('#recit-all'); await shot('recit-rempli')
      await clickText('Tout effacer', 'button'); await shot('recit-effacer', { at: '#wipe-confirm', full: false, wait: 600 })
    } else {
      await fill('input[type=datetime-local]', '2026-10-13T04:00')
      await fill('input[placeholder^="Un lieu"]', 'Plateau-Mont-Royal')
      await fill('textarea', souvenirs, 0)
      await fill('textarea', oublis, 1)
      for (const t of ['Trous de mémoire', 'Nausées', 'Gardés tels quels', 'Parler à quelqu’un', 'Un examen médical']) await clickText(t, 'button')
      await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter((e) => e.innerText.trim() === 'Je ne sais pas'); b[0]?.click() })
      await shot('recit-rempli')
      await clickText('Tout effacer', 'button'); await shot('recit-effacer', { at: 'main > div > div:last-child', full: false, wait: 600 })
    }
    await clickText('Annuler', 'button')
  })

  await step('aller', async () => {
    await tab('aller'); await idle(); await shot('ou-aller', { wait: 1800 })
    // V2 sur téléphone : la carte est une vue à part, à demander.
    if (await page.$('#vue-carte')) { await click('#vue-carte'); await idle() }
    await shot('ou-aller-carte', { at: '#map', full: false, wait: 1500 })
    if (await page.$('#vue-liste')) await click('#vue-liste')
    await shot('ou-aller-fiche', { at: '#res-cvasm-soir', full: false, wait: 300 })
  })

  await step('dossier', async () => {
    await tab('dossier'); await shot('dossier')
    await click('#consent-send'); await click('#consent-beta')
    await shot('dossier-pret', { at: '#send', full: false, wait: 500 })
    await click('#send'); await shot('dossier-confirmation', { wait: 900 })
    await click('#confirm-send')
    await page.waitForSelector('#rappel', { visible: true, timeout: 15000 })
    await shot('dossier-envoye', { at: '#send-progress', full: false })
  })

  await step('rappel', async () => {
    await shot('rappel', { at: '#rappel' })
    await click('.slot'); await fill('#rappel-phone', '+1 514 555-0123')
    await shot('rappel-pret', { at: '#rappel-confirm', full: false, wait: 500 })
    await click('#rappel-confirm'); await page.waitForSelector('#rappel-ok', { visible: true })
    await shot('rappel-confirme', { at: '#rappel-ok', full: false })
  })

  await step('vie-privee', async () => { await tab('vie-privee'); await shot('vie-privee') })

  await step('connexion', async () => { await clickText('Verrouiller', 'button'); await page.waitForSelector('#login', { visible: true }); await shot('connexion') })

  await step('soignant', async () => {
    await page.goto(`${BASE}/#/demo`, { waitUntil: 'networkidle0' }); await page.reload({ waitUntil: 'networkidle0' })
    await shot('soignant-1-consentement')
    await click('#consent-examen'); await click('#consent-prelevements'); await sleep(400); await click('#next')
    await shot('soignant-2-dossier'); await click('#next')
    await shot('soignant-3-prelevements'); await click('#next')
    await shot('soignant-4-chronologie-vide')
    await click('#generate'); await page.waitForSelector('#ai-source', { visible: true, timeout: 20000 })
    await shot('soignant-4-chronologie'); await click('#next')
    await shot('soignant-5-export')
  })

  await browser.close()
  return { format: tag, erreurs: errors, ecrans: results }
}

const all = []
for (const vp of VIEWPORTS) { console.log(`Format ${vp.w}x${vp.h}`); all.push(await run(vp)) }
await writeFile(join(OUT, 'mesures.json'), JSON.stringify({ serie: SERIE, base: BASE, horloge: new Date(FIXED).toISOString(), formats: all }, null, 2))
console.log(`Mesures : ${join(OUT, 'mesures.json')}`)
for (const f of all) if (f.erreurs.length) console.log(`Erreurs ${f.format} :\n  ${f.erreurs.join('\n  ')}`)
