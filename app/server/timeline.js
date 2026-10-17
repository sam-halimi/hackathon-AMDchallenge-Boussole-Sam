// @ts-check
// Cœur de la chronologie assistée par IA : consigne, schéma de sortie et garde-fous.
// Partagé par le serveur de dev (Vite), la fonction serverless (api/) et le serveur Node autonome.

export const SYSTEM = `Tu es un assistant de structuration documentaire pour une équipe soignante qui accueille une personne victime d'agression sexuelle.
Ta seule tâche : transformer des notes libres (déjà pseudonymisées) en chronologie factuelle.
Règles absolues :
- Ne désigne jamais de coupable, ne qualifie jamais juridiquement les faits, ne pose aucun diagnostic.
- N'évalue jamais la crédibilité de la personne. Ne signale JAMAIS une contradiction ou un oubli dans le récit de la personne comme un problème.
- Les trous de mémoire du récit sont des "informations non disponibles", décrits de façon neutre (fréquents après un traumatisme ou une substance).
- Les "incohérences" ne concernent que le DOSSIER (horodatages de soins, prélèvements, documents, signatures) — jamais la parole de la personne.
- Chaque événement doit citer mot pour mot la phrase source, copiée telle quelle depuis les notes ; n'invente aucun fait.
- Tout est une suggestion soumise à validation humaine.
- Sois concis : au plus 12 événements ; "description" en 10 mots au plus ; "source" = la phrase exacte la plus courte qui prouve l'événement ; "gaps" et "inconsistencies" seulement s'ils sont nets, au plus 3 chacun.
Réponds en français, uniquement avec un objet JSON conforme au schéma.`

export const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['events', 'gaps', 'inconsistencies'],
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['time', 'description', 'source', 'origin'],
        properties: {
          time: { type: 'string', description: 'Heure ou moment, ex. "J 22 h 45"' },
          description: { type: 'string' },
          source: { type: 'string', description: 'Citation exacte de la phrase source' },
          origin: { type: 'string', description: 'Récit de la personne, note de triage, note infirmière…' },
        },
      },
    },
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['from', 'to', 'note'],
        properties: { from: { type: 'string' }, to: { type: 'string' }, note: { type: 'string' } },
      },
    },
    inconsistencies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'sources', 'suggestion'],
        properties: {
          description: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
          suggestion: { type: 'string' },
        },
      },
    },
  },
}

/**
 * @typedef {{ time: string, description: string, source: string, origin: string }} TimelineEvent
 * @typedef {{ from: string, to: string, note: string }} TimelineGap
 * @typedef {{ description: string, sources: string[], suggestion: string }} TimelineInconsistency
 * @typedef {{ events: TimelineEvent[], gaps: TimelineGap[], inconsistencies: TimelineInconsistency[] }} TimelineResult
 * @typedef {{ kind: 'event' | 'gap' | 'inconsistency', text: string, reason: string }} Removed
 */

// Formulations interdites dans le texte produit par l'IA (description, note, suggestion).
// Une suggestion qui en contient une est retirée et signalée : on préfère perdre une ligne
// que montrer un jugement sur la personne.
/** @type {{ re: RegExp, reason: string }[]} */
export const FORBIDDEN = [
  { re: /\bcoupables?\b|\bculpabilit/i, reason: 'désignation de coupable' },
  { re: /\bl[’']agresseur (?:est|serait|était|s[’']appelle)\b|\bsuspect(?:e|s|es)?(?!\p{L})/iu, reason: 'désignation de coupable' },
  { re: /\bcrédib|\bpeu fiable\b|\bnon fiable\b|\bfiabilité (?:du|de son) récit\b/i, reason: 'jugement de crédibilité' },
  { re: /\b(?:ment|mentir|mensonges?|menteu(?:r|se)|fabul\p{L}*|exag[éè]r\p{L}*|invent[ée]\p{L}*)(?!\p{L})/iu, reason: 'jugement de crédibilité' },
  { re: /\bscores?\b|\b\d{1,3}\s?%\s*(?:de )?(?:confiance|crédibilité|probabilité)/i, reason: 'score sur la personne' },
  { re: /\b(?:contradiction|incohérence)s? (?:du|dans le|de son) (?:récit|témoignage)\b/i, reason: 'jugement du récit' },
  { re: /\b(?:est|constitue|constituerait|serait) (?:un|une) (?:viol|crime|infraction|agression sexuelle)\b/i, reason: 'qualification juridique' },
  { re: /\bdiagnosti\w*/i, reason: 'diagnostic médical' },
]

/** Normalise pour comparer une citation au texte source (espaces, apostrophes, guillemets). */
export const normalize = (/** @type {string} */ s) =>
  s.normalize('NFC').replace(/[’‘]/g, "'").replace(/[«»“”]/g, '"').replace(/\s+/g, ' ').trim()

/** Une citation est valide si elle figure mot pour mot dans les notes (ponctuation finale tolérée). */
export function isQuoted(/** @type {string} */ quote, /** @type {string} */ notes) {
  const q = normalize(quote).replace(/[.;:,]+$/, '').replace(/^"|"$/g, '')
  return q.length >= 3 && normalize(notes).includes(q)
}

const forbidden = (/** @type {string} */ s) => FORBIDDEN.find((f) => f.re.test(s))?.reason

/** @param {unknown} v */
const isStr = (v) => typeof v === 'string'

/**
 * Vérifie la forme exacte de la sortie (même schéma que celui imposé au modèle).
 * @param {any} r
 * @returns {r is TimelineResult}
 */
export function hasShape(r) {
  return (
    !!r && typeof r === 'object' &&
    Array.isArray(r.events) && Array.isArray(r.gaps) && Array.isArray(r.inconsistencies) &&
    r.events.every((/** @type {any} */ e) => e && isStr(e.time) && isStr(e.description) && isStr(e.source) && isStr(e.origin)) &&
    r.gaps.every((/** @type {any} */ g) => g && isStr(g.from) && isStr(g.to) && isStr(g.note)) &&
    r.inconsistencies.every((/** @type {any} */ c) => c && isStr(c.description) && isStr(c.suggestion) && Array.isArray(c.sources) && c.sources.every(isStr))
  )
}

/**
 * Garde-fous appliqués à toute réponse du modèle, avant affichage :
 * - événement sans citation exacte dans les notes → retiré (« non étayé ») ;
 * - incohérence dont une source n'est pas citée mot pour mot → retirée ;
 * - formulation interdite (coupable, crédibilité, score, diagnostic, qualification) → retirée.
 * Rien n'est réécrit : on retire et on dit pourquoi, le soignant voit la liste.
 * @param {TimelineResult} result
 * @param {string} notes texte pseudonymisé réellement envoyé au modèle
 * @returns {{ result: TimelineResult, removed: Removed[] }}
 */
export function applyGuardrails(result, notes) {
  /** @type {Removed[]} */
  const removed = []
  const events = result.events.slice(0, 60).filter((e) => {
    const why = !isQuoted(e.source, notes) ? 'citation introuvable dans les notes (non étayé)' : forbidden(`${e.description} ${e.origin}`)
    if (why) removed.push({ kind: 'event', text: e.description, reason: why })
    return !why
  })
  const gaps = result.gaps.slice(0, 20).filter((g) => {
    const why = forbidden(g.note)
    if (why) removed.push({ kind: 'gap', text: `${g.from} → ${g.to}`, reason: why })
    return !why
  })
  const inconsistencies = result.inconsistencies.slice(0, 20).filter((c) => {
    const why =
      c.sources.length === 0 || !c.sources.every((s) => isQuoted(s, notes))
        ? 'source introuvable dans les notes (non étayé)'
        : forbidden(`${c.description} ${c.suggestion}`)
    if (why) removed.push({ kind: 'inconsistency', text: c.description, reason: why })
    return !why
  })
  return { result: { events, gaps, inconsistencies }, removed }
}

/**
 * Un événement isolé passe-t-il les garde-fous ? Même règle que applyGuardrails, pour l'affichage progressif.
 * @param {any} e @param {string} notes
 */
export const eventOk = (e, notes) =>
  !!e && isStr(e.time) && isStr(e.description) && isStr(e.source) && isStr(e.origin) && isQuoted(e.source, notes) && !forbidden(`${e.description} ${e.origin}`)

/**
 * Lecture progressive d'une sortie JSON en cours de génération : renvoie les objets complets du tableau
 * "events" apparus depuis la position `depuis` (les chaînes et échappements sont respectés).
 * @param {string} texte sortie accumulée @param {number} depuis position déjà lue (0 au départ)
 * @returns {{ objets: unknown[], position: number }}
 */
export function nouveauxEvenements(texte, depuis) {
  /** @type {unknown[]} */
  const objets = []
  let i = depuis
  if (i === 0) {
    const m = /"events"\s*:\s*\[/.exec(texte)
    if (!m) return { objets, position: 0 }
    i = m.index + m[0].length
  }
  for (;;) {
    while (i < texte.length && /[\s,]/.test(texte[i])) i++
    if (i >= texte.length || texte[i] !== '{') return { objets, position: i }
    let prof = 0
    let chaine = false
    let echap = false
    let j = i
    for (; j < texte.length; j++) {
      const c = texte[j]
      if (chaine) {
        if (echap) echap = false
        else if (c === '\\') echap = true
        else if (c === '"') chaine = false
      } else if (c === '"') chaine = true
      else if (c === '{') prof++
      else if (c === '}' && --prof === 0) break
    }
    if (j >= texte.length) return { objets, position: i }
    try {
      objets.push(JSON.parse(texte.slice(i, j + 1)))
    } catch {
      /* objet mal formé : ignoré ici, la vérification finale tranchera */
    }
    i = j + 1
  }
}
