// « Quitter rapidement » : verrouille l'espace, puis remplace la page par un site neutre.
// location.replace retire Boussole de l'historique de l'onglet : le bouton « Retour » n'y ramène pas.
// Limite assumée et dite à l'écran (Vie privée) : l'historique du navigateur garde la trace de la visite.
export const SITE_NEUTRE = 'https://www.google.com/search?q=m%C3%A9t%C3%A9o+Montr%C3%A9al'

export function quitter(verrouiller: () => void, aller: (url: string) => void = (url) => window.location.replace(url)) {
  // On part même si le verrouillage échoue : sortir de l'écran passe avant tout.
  try { verrouiller() } finally { aller(SITE_NEUTRE) }
}
