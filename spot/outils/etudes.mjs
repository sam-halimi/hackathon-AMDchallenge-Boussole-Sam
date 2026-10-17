// Capture des résumés PubMed (anglais) et position exacte de la phrase citée, pour un zoom ciblé dans le spot.
// Sortie : public/etudes/<nom>.png (bloc titre + résumé, échelle 2) et src/en/etudes.json (rectangles des lignes surlignées).
import { createRequire } from 'node:module'
import { writeFile, mkdir } from 'node:fs/promises'
const require = createRequire('/home/sam/tools/site-shots/')
const puppeteer = require('puppeteer-core')
const ETUDES = [
  ['dworkin', 'https://pubmed.ncbi.nlm.nih.gov/?term=10.1177/15248380211032213', '74.58%', 'following sexual assault, respectively'],
  ['hendrich', 'https://pubmed.ncbi.nlm.nih.gov/?term=10.7812/tpp/08-021', 'documentation (35.3%', '147.5 minutes)'],
  ['poissant', 'https://pubmed.ncbi.nlm.nih.gov/?term=10.1197/jamia.m1700', 'The use of bedside terminals', 'documenting during a shift'],
  ['campbell', 'https://pubmed.ncbi.nlm.nih.gov/?term=10.1037/0003-066X.63.8.702', 'for many victims, postassault help seeking', 'initial trauma'],
]
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--lang=en-US'] })
const sortie = {}
await mkdir(new URL('../src/en/', import.meta.url), { recursive: true })
for (const [nom, url, debut, fin] of ETUDES) {
  const p = await b.newPage()
  await p.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36')
  await p.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 2 })
  await p.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 2000))
  const res = await p.evaluate((debut, fin) => {
    for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); if ((cs.position === 'fixed' || cs.position === 'sticky') && el.getBoundingClientRect().height > 30) el.remove() }
    document.querySelectorAll('[id*=cookie i],[class*=cookie i],.usa-banner,#ncbi-header, .ncbi-header').forEach((e) => e.remove())
    const titre = document.querySelector('h1.heading-title') || document.querySelector('h1')
    const resume = document.querySelector('#eng-abstract') || document.querySelector('.abstract-content') || document.querySelector('#abstract')
    if (!titre || !resume) return null
    titre.scrollIntoView({ block: 'start' }); window.scrollBy(0, -20)
    // Trouver la phrase dans le texte du résumé et construire une Range qui la couvre.
    const marcheur = document.createTreeWalker(resume, NodeFilter.SHOW_TEXT)
    const noeuds = []; let tout = ''
    for (let n = marcheur.nextNode(); n; n = marcheur.nextNode()) { noeuds.push([n, tout.length]); tout += n.nodeValue }
    const norm = (s) => s.replace(/[“”]/g, '"')
    const i0 = norm(tout).indexOf(norm(debut)); const i1 = norm(tout).indexOf(norm(fin), i0)
    if (i0 < 0 || i1 < 0) return { erreur: 'phrase introuvable', extrait: tout.slice(0, 300) }
    const j1 = i1 + fin.length
    const trouve = (k) => { for (let q = noeuds.length - 1; q >= 0; q--) if (noeuds[q][1] <= k) return [noeuds[q][0], k - noeuds[q][1]] }
    const r = document.createRange(); const [a, ao] = trouve(i0); const [z, zo] = trouve(j1)
    r.setStart(a, ao); r.setEnd(z, Math.min(zo, z.nodeValue.length))
    const bloc = titre.closest('.full-view, main, article') || document.body
    const t = titre.getBoundingClientRect(); const re = resume.getBoundingClientRect()
    const cadre = { x: Math.min(t.left, re.left) - 24, y: t.top - 24, w: Math.max(t.right, re.right) - Math.min(t.left, re.left) + 48, h: re.bottom - t.top + 48 }
    const lignes = [...r.getClientRects()].filter((q) => q.width > 4).map((q) => ({ x: q.left - cadre.x, y: q.top - cadre.y, w: q.width, h: q.height }))
    return { cadre, page: { x: cadre.x + window.scrollX, y: cadre.y + window.scrollY }, lignes, titre: titre.innerText.trim(), phrase: tout.slice(i0, j1) }
  }, debut, fin)
  if (!res || res.erreur) { console.log('✗', nom, res); await p.close(); continue }
  await p.screenshot({ path: new URL(`../public/etudes/${nom}.png`, import.meta.url).pathname, clip: { x: res.page.x, y: res.page.y, width: res.cadre.w, height: res.cadre.h } })
  sortie[nom] = { url, titre: res.titre, phrase: res.phrase, taille: { w: Math.round(res.cadre.w * 2), h: Math.round(res.cadre.h * 2) }, lignes: res.lignes.map((q) => ({ x: Math.round(q.x * 2), y: Math.round(q.y * 2), w: Math.round(q.w * 2), h: Math.round(q.h * 2) })) }
  console.log('✓', nom, '|', res.phrase.slice(0, 90))
  await p.close()
}
await b.close()
await writeFile(new URL('../src/en/etudes.json', import.meta.url), JSON.stringify(sortie, null, 1))
