// Informations publiques du projet, en un seul endroit.
// CONTACT : adresse dédiée du projet. Tant qu'elle est vide, les pages « Qui sommes-nous » et
// « Confidentialité » ne sont ni affichées ni liées : la loi 25 exige un contact réel pour la personne
// responsable de la protection des renseignements personnels.
export const CONTACT: string | null = null

// Dernière vérification des ressources (voir docs/terrain/REVUE-RESSOURCES.md). Revue tous les trois mois.
export const RESOURCES_VERIFIED = '2026-10-04'
export const POLICY_UPDATED = '2026-10-15'

export function nextReview(iso = RESOURCES_VERIFIED) {
  const d = new Date(`${iso}T12:00:00`)
  d.setMonth(d.getMonth() + 3)
  return d
}
