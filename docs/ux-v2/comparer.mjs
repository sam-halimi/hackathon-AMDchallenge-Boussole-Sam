// Compare les mesures des deux séries de captures : node docs/ux-v2/comparer.mjs
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
const load = (s) => JSON.parse(readFileSync(join(HERE, s, 'mesures.json'), 'utf8'))
const avant = load('avant'), apres = load('apres')
const nom = (e) => e.ecran.replace(/^\d+[a-z]?-/, '')
// Fausse alerte connue : texte clair d'un bouton sélectionné dont le fond foncé est un élément voisin.
const vrai = (c) => !c.off && !(c.fg === '#fff9f3' && c.bg === '#f6efe8')
const somme = (f) => {
  const cibles44 = new Set(), cibles48 = new Set(), contrastes = new Map(), petits = { 11: 0, 12: 0, 13: 0 }
  let zoom = 1, debord = 0, interne = 0
  for (const e of f.ecrans) {
    zoom = Math.max(zoom, e.echelle ?? 1); debord = Math.max(debord, (e.largeurContenu ?? e.vw) - (e.vw / (e.echelle ?? 1) > e.vw ? e.vw : e.vw))
    interne += e.defilementInterne.length
    for (const t of e.petitesCibles) { if (t.leaflet || t.off) continue; const k = `${t.t}|${t.w}x${t.h}`; cibles48.add(k); if (Math.min(t.w, t.h) < 43.5) cibles44.add(k) }
    for (const c of e.contrastesFaibles.filter(vrai)) contrastes.set(`${c.fg}/${c.bg}/${c.placeholder ? 'ph' : ''}`, c)
    for (const t of e.petitsTextes) if (t.px < 14) petits[Math.floor(t.px)] = (petits[Math.floor(t.px)] ?? 0) + t.n
  }
  return { zoom, interne, cibles44: cibles44.size, cibles48: cibles48.size, contrastes: contrastes.size, pire: [...contrastes.values()].sort((a, b) => a.ratio - b.ratio)[0], petits, liste44: [...cibles44], listeC: [...contrastes.values()] }
}
for (let i = 0; i < avant.formats.length; i++) {
  const a = somme(avant.formats[i]), b = somme(apres.formats[i])
  console.log(`\n== ${avant.formats[i].format}`)
  console.log(`zoom max de la page        : ${a.zoom} → ${b.zoom}`)
  console.log(`défilements internes       : ${a.interne} → ${b.interne}`)
  console.log(`zones de clic < 44 px      : ${a.cibles44} → ${b.cibles44}`)
  console.log(`zones de clic < 48 px      : ${a.cibles48} → ${b.cibles48}`)
  console.log(`couples de couleurs sous AA: ${a.contrastes} → ${b.contrastes}${b.pire ? ` (pire : ${b.pire.ratio})` : ''}`)
  console.log(`caractères sous 14 px      : ${a.petits[11] + a.petits[12] + a.petits[13]} → ${b.petits[11] + b.petits[12] + b.petits[13]}`)
  const A = new Map(avant.formats[i].ecrans.map((e) => [nom(e), e])), B = new Map(apres.formats[i].ecrans.map((e) => [nom(e), e]))
  console.log('hauteur de page (écrans)   : ' + [...A].filter(([k, e]) => B.has(k) && !e.fenetre && !/-(carte|fiche|pret|effacer|hors-ligne|erreur|envoye)$/.test(k)).map(([k, e]) => `${k} ${e.ecrans}→${B.get(k).ecrans}`).join(' · '))
  if (process.argv.includes('--detail')) {
    console.log('  cibles < 44 restantes :', b.liste44.slice(0, 30).join(' ; '))
    console.log('  contrastes restants   :', b.listeC.map((c) => `${c.ratio} ${c.fg}/${c.bg} ${c.px}px « ${c.ex[0]} »${c.placeholder ? ' [ph]' : ''}`).join(' ; '))
  }
}
