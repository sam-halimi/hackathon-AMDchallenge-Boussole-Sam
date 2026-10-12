import { DEMO_IDENTITY } from './demoCase'
import { IDENTIFIER_PATTERNS } from '../../shared/identifiers.js'

type Identity = { name: string; firstName: string; lastName: string; address: string }

// Remplace les identifiants AVANT tout envoi au modèle d'IA.
// 1. Identité connue du dossier (nom, prénom, adresse) ; 2. motifs génériques (téléphone, courriel,
// date de naissance, n° RAMQ, code postal, adresse civique). Le serveur refait le contrôle et refuse
// l'envoi si un identifiant passe quand même. En production : NER + listes de l'établissement.
export function pseudonymize(text: string, id: Identity = DEMO_IDENTITY): { text: string; count: number } {
  let count = 0
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rep = (s: string, re: RegExp, tag: string) =>
    s.replace(re, (...m) => {
      count++
      const keep = typeof m[1] === 'string' ? m[1] : ''
      return keep + tag
    })
  let out = text
  if (id.address) out = rep(out, new RegExp(esc(id.address), 'g'), '[LIEU]')
  if (id.name) out = rep(out, new RegExp(esc(id.name), 'g'), '[PATIENTE]')
  if (id.firstName) out = rep(out, new RegExp(`(?<![\\p{L}])${esc(id.firstName)}(?![\\p{L}])`, 'gu'), '[PATIENTE]')
  if (id.lastName) out = rep(out, new RegExp(`(?<![\\p{L}])${esc(id.lastName)}(?![\\p{L}])`, 'gu'), '[PATIENTE]')
  for (const p of IDENTIFIER_PATTERNS) out = rep(out, new RegExp(p.re.source, p.re.flags), p.tag)
  return { text: out, count }
}
