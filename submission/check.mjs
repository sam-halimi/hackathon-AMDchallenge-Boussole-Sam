// Vérifie les longueurs imposées par lablab.ai : node submission/check.mjs
import { readFileSync } from 'node:fs'
const md = readFileSync(new URL('./TEXTS.md', import.meta.url), 'utf8')
const get = (k) => md.match(new RegExp(`<!-- ${k} -->\\n([\\s\\S]*?)\\n<!-- /${k} -->`))[1].trim()
const checks = [
  ['title', (s) => s.length <= 50, (s) => `${s.length}/50 caractères`],
  ['short', (s) => s.length <= 255, (s) => `${s.length}/255 caractères`],
  ['long', (s) => s.split(/\s+/).length >= 100, (s) => `${s.split(/\s+/).length} mots (≥ 100)`],
  ['future', (s) => s.length > 0, (s) => `${s.split(/\s+/).length} mots`],
]
let ok = true
for (const [k, test, info] of checks) {
  const s = get(k)
  const pass = test(s)
  ok &&= pass
  console.log(`${pass ? 'ok ' : 'KO '} ${k.padEnd(7)} ${info(s)}`)
}
process.exit(ok ? 0 : 1)
