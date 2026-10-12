// @ts-check
// Motifs d'identifiants directs, partagés par l'appli (pseudonymisation avant envoi)
// et par le serveur (contrôle de second niveau : refus si un identifiant passe quand même).
// Prototype : en production, ajouter une reconnaissance d'entités nommées et les listes de l'établissement.

/** Un groupe capturant éventuel (ex. « née le ») est conservé devant l'étiquette. */
/** @typedef {{ tag: string, re: RegExp, label: string }} IdentifierPattern */

/** @type {IdentifierPattern[]} */
export const IDENTIFIER_PATTERNS = [
  { tag: '[COURRIEL]', label: 'courriel', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  // Numéro d'assurance maladie du Québec : 4 lettres + 8 chiffres (espaces tolérés)
  { tag: '[RAMQ]', label: "numéro d'assurance maladie", re: /\b[A-Z]{4}\s?\d{4}\s?\d{4}\b/g },
  // Téléphones nord-américains : 514-555-0147, (514) 555-0147, 514 555 0147, +1 514 555-0147
  { tag: '[TÉLÉPHONE]', label: 'téléphone', re: /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/g },
  { tag: '[DATE]', label: 'date de naissance', re: /\b((?:née?|DDN|date de naissance)\s*(?:le\s*|:\s*)?)\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/gi },
  // Code postal canadien : H2L 4M1
  { tag: '[CODE POSTAL]', label: 'code postal', re: /\b[ABCEGHJ-NPRSTVXY]\d[A-Z][\s-]?\d[A-Z]\d\b/g },
  // Adresse civique : « 123, rue des Érables »
  { tag: '[LIEU]', label: 'adresse', re: /\b\d{1,5},?\s+(?:rue|avenue|av\.|boulevard|boul\.|chemin|place|rang|montée)\s+[^,.\n]{2,40}/gi },
]

/**
 * Liste les identifiants directs encore présents dans un texte.
 * @param {string} text
 * @returns {{ label: string, count: number }[]}
 */
export function findIdentifiers(text) {
  /** @type {{ label: string, count: number }[]} */
  const found = []
  for (const p of IDENTIFIER_PATTERNS) {
    const n = (text.match(new RegExp(p.re.source, p.re.flags)) ?? []).length
    if (n) found.push({ label: p.label, count: n })
  }
  return found
}
