// Minutage calé sur la voix (généré par audio/caler.py) et outils d'animation en secondes.
import { Easing, interpolate } from "remotion";
import minutage from "./minutage.json";

export const M = minutage;
export const FPS = M.fps;
export const DUREE_IMAGES = M.images;
/** Début de la phrase n (0 à 23), en secondes vidéo. */
export const P = (n: number) => M.phrases[n].debut;
/** Fin de la phrase n. */
export const PF = (n: number) => M.phrases[n].fin;
/** Instant d'un mot-clé de la voix. */
export const K = (nom: keyof typeof M.cles) => M.cles[nom];

// Fenêtres des scènes (secondes vidéo), dans l'ordre de la présentation. Version anglaise, plus courte et plus rythmée.
export const SCENES = {
  ouverture: [0, P(1) - 0.25],
  presse: [P(1) - 0.25, P(2) - 0.25],
  frise: [P(2) - 0.25, P(4) - 0.25],
  canada: [P(4) - 0.25, P(6) - 0.2],
  delais: [P(6) - 0.2, P(7) - 0.2],
  dworkin: [P(7) - 0.2, P(8) - 0.2],
  personne: [P(8) - 0.2, P(9) - 0.2],
  guide: [P(9) - 0.2, P(10) - 0.3],
  logo: [P(10) - 0.3, P(11) - 0.3],
  arrivee: [P(11) - 0.3, P(12) - 0.25],
  quitter: [P(12) - 0.25, P(13) - 0.25],
  etapes: [P(13) - 0.25, P(14) - 0.25],
  recit: [P(14) - 0.25, P(15) - 0.25],
  carte: [P(15) - 0.25, P(16) - 0.25],
  soignant: [P(16) - 0.25, P(17) - 0.25],
  etudesTemps: [P(17) - 0.25, P(18) - 0.25],
  organismes: [P(18) - 0.25, P(19) - 0.25],
  prix: [P(19) - 0.25, P(20) - 0.25],
  croissance: [P(20) - 0.25, P(21) - 0.25],
  equipe: [P(21) - 0.25, P(22) - 0.25],
  demande: [P(22) - 0.25, P(23) - 0.3],
  final: [P(23) - 0.3, M.debut_carton],
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
