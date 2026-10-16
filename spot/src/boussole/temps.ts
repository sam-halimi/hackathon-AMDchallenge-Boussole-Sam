// Minutage calé sur la voix (généré par audio/caler.py) et outils d'animation en secondes.
import { Easing, interpolate } from "remotion";
import minutage from "./minutage.json";

export const M = minutage;
export const FPS = M.fps;
export const DUREE_IMAGES = M.images;
/** Début de la phrase n (0 à 37), en secondes vidéo. */
export const P = (n: number) => M.phrases[n].debut;
/** Fin de la phrase n. */
export const PF = (n: number) => M.phrases[n].fin;
/** Instant d'un mot-clé de la voix. */
export const K = (nom: keyof typeof M.cles) => M.cles[nom];

// Fenêtres des scènes (secondes vidéo), dans l'ordre de la présentation.
// Les sons (audio/composer.py) utilisent les mêmes repères.
export const SCENES = {
  // Acte 1 : l'affaire de Cornell, puis les chiffres canadiens (fond nuit)
  ouverture: [0, P(1) - 0.3],
  presse: [P(1) - 0.3, P(2) - 0.3],
  frise: [P(2) - 0.3, P(5) - 0.3],
  aucune: [P(5) - 0.3, P(6) - 0.3],
  canada: [P(6) - 0.3, P(8) - 0.25],
  entonnoir: [P(8) - 0.25, P(9) - 0.25],
  delais: [P(9) - 0.25, P(10) - 0.25],
  tspt: [P(10) - 0.25, P(11) - 0.25],
  personne: [P(11) - 0.25, P(12) - 0.2],
  commencer: [P(12) - 0.2, P(13) - 0.25],
  // Bascule vers le papier
  guide: [P(13) - 0.25, P(14) - 0.35],
  logo: [P(14) - 0.35, P(15) - 0.4],
  // Acte 2 : l'application, écran par écran (vraies captures)
  arrivee: [P(15) - 0.4, P(17) - 0.3],
  quitter: [P(17) - 0.3, P(18) - 0.3],
  etapes: [P(18) - 0.3, P(19) - 0.3],
  recit: [P(19) - 0.3, P(21) - 0.35],
  carte: [P(21) - 0.35, P(22) - 0.3],
  dossier: [P(22) - 0.3, P(24) - 0.3],
  soignant: [P(24) - 0.3, P(26) - 0.3],
  horsLigne: [P(26) - 0.3, P(27) - 0.3],
  // Acte 3 : organismes, études, communication, modèle d'affaires
  relie: [P(27) - 0.3, P(28) - 0.3],
  organismes: [P(28) - 0.3, P(29) - 0.3],
  recherche: [P(29) - 0.3, P(30) - 0.3],
  com: [P(30) - 0.3, P(31) - 0.3],
  modele: [P(31) - 0.3, P(32) - 0.3],
  pilote: [P(32) - 0.3, P(33) - 0.3],
  croissance: [P(33) - 0.3, P(34) - 0.3],
  equipe: [P(34) - 0.3, P(35) - 0.3],
  demande: [P(35) - 0.3, P(36) - 0.3],
  humain: [P(36) - 0.3, P(37) - 0.35],
  final: [P(37) - 0.35, M.debut_carton],
  carton: [M.debut_carton, M.duree_totale],
} as const;
export type NomScene = keyof typeof SCENES;
/** Le papier remplace la nuit au logo (la scène « guide » l’ouvre en cercle juste avant). */
export const DEBUT_PAPIER = SCENES.logo[0];

export const SORTIE = Easing.bezier(0.16, 1, 0.3, 1); // arrivée douce (expo)
export const ENTREE = Easing.bezier(0.7, 0, 0.84, 0); // départ qui accélère
export const VA_ET_VIENT = Easing.bezier(0.65, 0, 0.35, 1); // trajet tenu → trajet → tenu
export const RESSORT = Easing.bezier(0.34, 1.56, 0.64, 1); // léger dépassement

const BORNE = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
/** Interpole entre a et b (secondes) avec une courbe, valeurs bornées. */
export const tw = (t: number, a: number, b: number, de: number, vers: number, courbe = SORTIE) =>
  interpolate(t, [a, b], [de, vers], { ...BORNE, easing: courbe });
/** 0 → 1 entre a et b. */
export const prog = (t: number, a: number, b: number, courbe = SORTIE) => tw(t, a, b, 0, 1, courbe);
/** Enveloppe : monte entre a et a+entree, descend entre b-sortie et b. */
export const env = (t: number, a: number, b: number, entree = 0.35, sortie = 0.3) =>
  Math.min(prog(t, a, a + entree), 1 - prog(t, b - sortie, b, ENTREE));

export type Cle = { t: number; x: number; y: number; z: number };
/** Caméra : suite de clés (instant, point visé, zoom), trajets en va-et-vient entre les clés. */
export function camera(t: number, cles: Cle[], courbe = VA_ET_VIENT) {
  if (t <= cles[0].t) return cles[0];
  for (let i = 0; i < cles.length - 1; i++) {
    const a = cles[i], b = cles[i + 1];
    if (t <= b.t) {
      const p = courbe((t - a.t) / Math.max(1e-6, b.t - a.t));
      // Zoom interpolé en échelle logarithmique : la vitesse perçue reste constante.
      const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p);
      return { t, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z };
    }
  }
  return cles[cles.length - 1];
}

/** Bruit déterministe (même image = même valeur). */
export function alea(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
