// Boussole spot, English version: scenes assembled on the voice timing, in the order of the deck.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./theme";
import { DEBUT_PAPIER, NomScene, SCENES } from "./temps";
import { FondNuit, FondPapier, Grain, useT } from "./ui";
import { Canada, Delais, Dworkin, Frise, Guide, Ouverture, Personne, Presse } from "./scenes/Probleme";
import { Arrivee, Carte, Etapes, LogoScene, Quitter, Recit, Soignant } from "./scenes/Demo";
import { Carton, Croissance, Demande, Equipe, EtudesTemps, Final, Organismes, Prix } from "./scenes/Preuves";

const RENDUS: Record<NomScene, React.FC<{ t: number }>> = {
  ouverture: Ouverture,
  presse: Presse,
  frise: Frise,
  canada: Canada,
  delais: Delais,
  dworkin: Dworkin,
  personne: Personne,
  guide: Guide,
  logo: LogoScene,
  arrivee: Arrivee,
  quitter: Quitter,
  etapes: Etapes,
  recit: Recit,
  carte: Carte,
  soignant: Soignant,
  etudesTemps: EtudesTemps,
  organismes: Organismes,
  prix: Prix,
  croissance: Croissance,
  equipe: Equipe,
  demande: Demande,
  final: Final,
  carton: Carton,
};
const NOMS = Object.keys(SCENES) as NomScene[];

export const SpotEN: React.FC = () => {
  const t = useT();
  const papier = t >= DEBUT_PAPIER && t < SCENES.carton[0];
  // “What if someone guided them?”: the night dims just before the switch to daylight.
  const intensite = t >= SCENES.guide[0] && t < SCENES.logo[0] ? 0.35 : 1;
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
