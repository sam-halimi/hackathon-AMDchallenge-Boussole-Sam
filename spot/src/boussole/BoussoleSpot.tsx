// Spot Boussole : assemblage des scènes sur le minutage de la voix, dans l'ordre de la présentation.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./theme";
import { DEBUT_PAPIER, NomScene, SCENES } from "./temps";
import { FondNuit, FondPapier, Grain, useT } from "./ui";
import { Aucune, Canada, Commencer, Delais, Entonnoir, Frise, Guide, Ouverture, Personne, Presse, Tspt } from "./scenes/Probleme";
import { Arrivee, Carte, Dossier, Etapes, HorsLigne, LogoScene, Quitter, Recit, Soignant } from "./scenes/Demo";
import { Carton, Com, Croissance, Demande, Equipe, Final, Humain, Modele, Organismes, Pilote, Recherche, Relie } from "./scenes/Preuves";

const RENDUS: Record<NomScene, React.FC<{ t: number }>> = {
  ouverture: Ouverture,
  presse: Presse,
  frise: Frise,
  aucune: Aucune,
  canada: Canada,
  entonnoir: Entonnoir,
  delais: Delais,
  tspt: Tspt,
  personne: Personne,
  commencer: Commencer,
  guide: Guide,
  logo: LogoScene,
  arrivee: Arrivee,
  quitter: Quitter,
  etapes: Etapes,
  recit: Recit,
  carte: Carte,
  dossier: Dossier,
  soignant: Soignant,
  horsLigne: HorsLigne,
  relie: Relie,
  organismes: Organismes,
  recherche: Recherche,
  com: Com,
  modele: Modele,
  pilote: Pilote,
  croissance: Croissance,
  equipe: Equipe,
  demande: Demande,
  humain: Humain,
  final: Final,
  carton: Carton,
};
const NOMS = Object.keys(SCENES) as NomScene[];

export const BoussoleSpot: React.FC = () => {
  const t = useT();
  const papier = t >= DEBUT_PAPIER && t < SCENES.carton[0];
  // « Par où commencer ? » : la nuit s'assombrit, silence avant la bascule.
  const intensite = t >= SCENES.commencer[0] && t < SCENES.logo[0] ? 0.35 : 1;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {papier ? <FondPapier t={t} /> : <FondNuit t={t} intensite={intensite} />}
      {NOMS.map((nom) => {
        const [a, b] = SCENES[nom];
        if (t < a || t >= b) return null;
        const Rendu = RENDUS[nom];
        return <Rendu key={nom} t={t} />;
      })}
      <Grain opacite={papier ? 0.045 : 0.08} />
    </AbsoluteFill>
  );
};
