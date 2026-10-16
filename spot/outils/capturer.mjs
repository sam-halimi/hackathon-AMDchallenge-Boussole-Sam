// Captures HD de Boussole pour le spot : téléphone 390×844 à l'échelle 3, outil soignant 1440×900 à l'échelle 2.
// Écrit public/captures/<nom>.png et src/boussole/boites.json (boîtes en pixels d'image).
//   cd app && npm run build && PORT=8137 npm start
//   node outils/capturer.mjs
// Données saisies : fictives. Horloge figée au 14 octobre 2026, 10 h, heure de Montréal.
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(process.env.PUPPETEER_FROM ?? '/home/sam/tools/site-shots/')
const puppeteer = require('puppeteer-core')
const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = join(ICI, '..')
const OUT = join(RACINE, 'public', 'captures')
const BASE = process.env.BASE ?? 'http://127.0.0.1:8137'
const FIXE = Date.parse('2026-10-14T10:00:00-04:00')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const boites = {}

const browser = await puppeteer.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] })
async function ouvrir(vp) {
  const p = await browser.newPage()
  await p.setViewport(vp)
  await p.emulateTimezone('America/Toronto')
  await p.evaluateOnNewDocument((fixe) => {
    const Vrai = Date; const ecart = fixe - Vrai.now()
    class Fige extends Vrai { constructor(...a) { if (a.length) super(...a); else super(Vrai.now() + ecart) } static now() { return Vrai.now() + ecart } }
    window.Date = Fige
    Object.defineProperty(navigator, 'language', { get: () => 'fr-CA' })
    addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style')
      s.textContent = 'html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'
      document.head.appendChild(s)
    })
  }, FIXE)
  return p
}
const TEL = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
const BUREAU = { width: 1440, height: 900, deviceScaleFactor: 2 }

let page = await ouvrir(TEL)
const clic = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 10000 }); await page.evaluate((s) => document.querySelector(s).click(), sel) }
const clicTexte = async (texte, tags = 'button,a,label') => {
  const ok = await page.evaluate((texte, tags) => {
    const el = [...document.querySelectorAll(tags)].find((e) => e.offsetParent !== null && (e.innerText || e.getAttribute('aria-label') || '').includes(texte))
    el?.click(); return !!el
  }, texte, tags)
  if (!ok) throw new Error(`Introuvable : « ${texte} »`)
}
const remplir = (sel, val) => page.evaluate((sel, val) => {
  const el = document.querySelector(sel); if (!el) throw new Error(`Champ introuvable : ${sel}`)
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}, sel, val)

/** Capture l'écran visible, puis enregistre les boîtes demandées : [clé, sélecteur CSS | {texte, tags}]. */
async function capture(nom, cles = [], { attente = 900 } = {}) {
  await sleep(attente)
  await page.evaluate(() => document.fonts.ready)
  await sleep(250)
  await page.screenshot({ path: join(OUT, `${nom}.png`), captureBeyondViewport: false })
  const dpr = page.viewport().deviceScaleFactor
  boites[nom] = { _taille: await page.evaluate((d) => ({ w: innerWidth * d, h: innerHeight * d }), dpr) }
  for (const [cle, cible] of cles) {
    const r = await page.evaluate((cible) => {
      let el
      if (typeof cible === 'string') el = document.querySelector(cible)
      else {
        const tous = [...document.querySelectorAll(cible.tags ?? '*')].filter((e) => e.offsetParent !== null && (e.innerText || e.getAttribute('aria-label') || '').includes(cible.texte))
        el = tous.sort((a, b) => a.innerText.length - b.innerText.length)[0]
      }
      if (!el) return null
      const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }
    }, cible)
    if (!r) { console.log(`  ⚠ ${nom} : boîte « ${cle} » introuvable`); continue }
    boites[nom][cle] = { x: Math.round(r.x * dpr), y: Math.round(r.y * dpr), w: Math.round(r.w * dpr), h: Math.round(r.h * dpr) }
  }
  console.log(`  ✓ ${nom}`)
}

await mkdir(OUT, { recursive: true })
await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
await capture('arrivee', [['quitter', '#quitter'], ['ecoute', { texte: 'Écoute', tags: 'a,button' }], ['danger', { texte: '911', tags: 'a,button' }], ['suivant', '#intro-next']])

// Création du compte (onglet neuf, sans passer par les diapos).
await page.close(); page = await ouvrir(TEL)
await page.goto(`${BASE}/#/`, { waitUntil: 'networkidle0' })
await clicTexte('déjà un espace', 'button'); await page.waitForSelector('#login', { visible: true })
await clicTexte('En créer un', 'button'); await page.waitForSelector('#create', { visible: true })
await remplir('#prenom', 'Camille'); await remplir('#email', 'camille@exemple.com'); await remplir('#pass1', 'Erable-Bleu-2026'); await remplir('#pass2', 'Erable-Bleu-2026')
await capture('compte', [['creer', '#create']], { attente: 400 })
await clic('#create')
await page.waitForSelector('#etapes', { visible: true, timeout: 20000 })
for (let i = 1; i <= 8; i++) {
  if (i === 1 || i === 4) await capture(`etape-${i}`, [['titre', '#etape-titre'], ['suivant', '#etape-next'], ['delai', { texte: 'jours', tags: 'p,span,li,strong,b' }], ['source', { texte: 'Source', tags: 'p,span,a,small' }]], { attente: 700 })
  await clic('#etape-next')
}
await page.waitForSelector('#call-ligne', { visible: true, timeout: 10000 })
await capture('accueil', [['ligne', '#call-ligne'], ['recit', '#mtab-recit'], ['aller', '#mtab-aller'], ['dossier', '#mtab-dossier'], ['quitter', '#quitter']])
await page.setOfflineMode(true); await capture('accueil-hors-ligne', [['ligne', '#call-ligne']], { attente: 700 }); await page.setOfflineMode(false)

await clic('#mtab-recit'); await sleep(500)
await clic('#recit-start'); await remplir('#q-quand', '2026-10-13T04:00'); await clic('#recit-next')
await remplir('#q-ou', 'Plateau-Mont-Royal'); await clic('#recit-next')
await remplir('#q-souvenirs', 'Je suis rentrée à pied après la soirée. Je me souviens du bar, puis de la rue. Ensuite, c’est flou.')
await capture('recit-souvenirs', [['champ', '#q-souvenirs'], ['suivant', '#recit-next']], { attente: 500 })
await clic('#recit-next'); await remplir('#q-oublis', 'Le trajet entre le bar et l’appartement.'); await clic('#recit-next')
for (const t of ['Trous de mémoire', 'Nausées']) await clicTexte(t, 'button')
await clic('#recit-next')
await capture('recit-substance', [['jsp', { texte: 'Je ne sais pas', tags: 'button' }], ['suivant', '#recit-next']], { attente: 500 })
await clicTexte('Je ne sais pas', 'button')
await capture('recit-substance-ok', [['jsp', { texte: 'Je ne sais pas', tags: 'button' }]], { attente: 400 })

await clic('#mtab-aller'); await page.waitForNetworkIdle({ idleTime: 700, timeout: 15000 }).catch(() => {})
await page.evaluate(() => document.querySelector('#filtre-all')?.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.evaluate(() => scrollBy(0, -90))
await capture('aller', [['examens', { texte: 'Examens médicaux', tags: 'button' }], ['soutien', { texte: 'Soutien psychologique', tags: 'button' }], ['juridique', { texte: 'Juridique', tags: 'button' }]], { attente: 1500 })
if (await page.$('#vue-carte')) { await clic('#vue-carte'); await page.waitForNetworkIdle({ idleTime: 700, timeout: 15000 }).catch(() => {}) }
await page.evaluate(() => document.querySelector('#vue-carte')?.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.evaluate(() => scrollBy(0, -80)); await sleep(1500)
await capture('carte', [['carte', '#map'], ['examens', { texte: 'Examens médicaux', tags: 'button' }], ['soutien', { texte: 'Soutien psychologique', tags: 'button' }], ['juridique', { texte: 'Juridique', tags: 'button' }]], { attente: 2500 })
if (await page.$('#vue-liste')) await clic('#vue-liste')

await clic('#mtab-dossier'); await sleep(500)
await capture('dossier', [['consentement', '#consent-send'], ['envoyer', '#send']])
await page.evaluate(() => document.querySelector('#consent-send')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
await capture('dossier-consent', [['consentement', '#consent-send'], ['beta', '#consent-beta'], ['envoyer', '#send']], { attente: 300 })
await clic('#consent-send'); await clic('#consent-beta')
await page.evaluate(() => document.querySelector('#send')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
await capture('dossier-pret', [['consentement', '#consent-send'], ['beta', '#consent-beta'], ['envoyer', '#send']], { attente: 400 })
await clic('#send'); await sleep(700); await clic('#confirm-send')
await page.waitForSelector('#rappel', { visible: true, timeout: 15000 })
await page.evaluate(() => document.querySelector('#rappel')?.scrollIntoView({ block: 'start', behavior: 'instant' }))
await capture('rappel', [['creneau', '.slot'], ['confirmer', '#rappel-confirm']], { attente: 600 })
await clic('.slot'); await remplir('#rappel-phone', '+1 514 555-0123')
await page.evaluate(() => document.querySelector('#rappel-confirm')?.scrollIntoView({ block: 'center', behavior: 'instant' }))
await capture('rappel-pret', [['creneau', '.slot'], ['confirmer', '#rappel-confirm']], { attente: 400 })

// Outil soignant, sur ordinateur.
await page.close(); page = await ouvrir(BUREAU)
await page.goto(`${BASE}/#/demo`, { waitUntil: 'networkidle0' }); await page.reload({ waitUntil: 'networkidle0' })
await capture('soignant-consentement', [['examen', '#consent-examen'], ['prelevements', '#consent-prelevements'], ['suivant', '#next']])
await clic('#consent-examen'); await clic('#consent-prelevements'); await sleep(400); await clic('#next')
await sleep(500); await clic('#next')
await capture('soignant-prelevements', [['suivant', '#next'], ['h72', { texte: '72', tags: 'span,p,td,strong,b' }]])
await clic('#next')
await clic('#generate'); await page.waitForSelector('#ai-source', { visible: true, timeout: 20000 })
await capture('soignant-chronologie', [['source', '#ai-source'], ['suivant', '#next']])

await browser.close()
await writeFile(join(RACINE, 'src', 'boussole', 'boites.json'), JSON.stringify(boites, null, 1))
console.log('boîtes : src/boussole/boites.json')
