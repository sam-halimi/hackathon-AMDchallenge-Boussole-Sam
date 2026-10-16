// Acte 1 : l'affaire de Cornell (faits allégués, sources de presse), puis les chiffres canadiens. Fond nuit.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { alea, ENTREE, env, K, P, prog, SCENES, SORTIE, tw } from "../temps";
import { Camera, Icone, Image, Mots, Pastille, apparition, monte, secousse, useFormat } from "../ui";

type Props = { t: number };

const titre = (taille: number, couleur: string = C.nuitTexte): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "-0.02em", lineHeight: 1.08 });
const petit = (taille: number, couleur: string = C.nuitDoux): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "0.18em", textTransform: "uppercase" });
const texte = (taille: number, couleur: string = C.nuitDoux): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 600, fontSize: taille, color: couleur, lineHeight: 1.35 });

/** Mention de source, en bas à gauche, discrète. */
export const Source: React.FC<{ t: number; a: number; b: number; texte: string; sombre?: boolean }> = ({ t, a, b, texte: s, sombre = true }) => (
  <div style={{ position: "absolute", left: 96, bottom: 52, opacity: env(t, a + 0.4, b, 0.5, 0.3) * 0.9, fontFamily: F.texte, fontWeight: 600, fontSize: 21, color: sombre ? C.nuitDoux : C.encre3 }}>{s}</div>
);

// 1. « Octobre 2024, université Cornell. »
export const Ouverture: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.ouverture;
  const o = env(t, a, b, 0.6, 0.45);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, flexDirection: "column", gap: 28 }}>
      <div style={{ ...petit(30, C.corail), ...monte(t, P(0) - 0.1, 24, 0.8) }}>Octobre 2024</div>
      <Mots texte="Université Cornell" t={t} debut={K("cornell") - 0.55} ecart={0.1} duree={0.7} style={titre(124)} />
      <div style={{ ...texte(26), ...monte(t, K("cornell") + 0.4, 16), marginTop: 10 }}>Ithaca, État de New York</div>
    </AbsoluteFill>
  );
};

// 2. « Une étudiante dit avoir été droguée, puis violée, par des membres d'une fraternité. »
export const Presse: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.presse;
  const o = env(t, a, b, 0.45, 0.4);
  const pousse = tw(t, a, b, 1, 1.07, (x) => x);
  const carte = (src: string, debut: number, x: number, y: number, w: number, rot: number, ratio: number) => {
    const p = prog(t, debut, debut + 0.9);
    const assombri = 1 - 0.45 * prog(t, K("droguee") - 0.2, K("droguee") + 0.4);
    return (
      <div style={{ position: "absolute", left: x, top: y + (1 - p) * 60, width: w, height: w * ratio, opacity: p, rotate: `${rot}deg`, borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.7)", filter: `brightness(${assombri})` }}>
        <Image src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ scale: String(pousse) }}>
        {carte("nbc-c.png", a + 0.1, 150, 110, 940, -1.5, 540 / 1940)}
        {carte("npr-c.png", a + 0.55, 1010, 150, 770, 1.2, 820 / 1820)}
        {carte("cbs-c.png", a + 1.0, 1260, 470, 520, -1, 1180 / 1440)}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 560, width: 1050 }}>
        <div style={{ ...texte(40, C.nuitTexte), ...monte(t, P(1) - 0.05, 24) }}>Une étudiante dit avoir été</div>
        <div style={{ display: "flex", gap: 30, marginTop: 6 }}>
          <span style={{ ...titre(104, C.corail), ...apparition(t, K("droguee") - 0.15, 0.6) }}>droguée,</span>
          <span style={{ ...titre(104, C.corail), ...apparition(t, K("violee") - 0.15, 0.6) }}>puis violée.</span>
        </div>
        <div style={{ ...texte(34, C.nuitTexte), ...monte(t, K("fraternite") - 0.6, 20), marginTop: 18 }}>Par des membres d’une fraternité, selon sa plainte.</div>
      </div>
      <Source t={t} a={a} b={b} texte="Captures : NBC News, NPR (29 sept. 2026), CBS News (6 oct. 2026). Faits allégués, aucune condamnation." />
    </AbsoluteFill>
  );
};

// 3. Frise : deux jours, trois semaines, la sanction.
const NOEUDS = [
  { x: 360, date: "20 octobre 2024", texte: "La nuit des faits allégués, dans une fraternité.", debut: () => SCENES.frise[0] + 0.2, couleur: C.nuitTexte },
  { x: 1080, date: "Deux jours après", texte: "Centre de santé du campus : aucune trousse proposée, selon son avocat.", debut: () => K("deux_jours") - 0.3, couleur: C.corail },
  { x: 1800, date: "Trois semaines après", texte: "Elle demande la trousse elle-même.", debut: () => K("trois_semaines") - 0.4, couleur: C.corail },
  { x: 2520, date: "Mai 2025", texte: "Sanctions de l’université : deux exclus, deux suspendus.", debut: () => K("exclus") - 0.5, couleur: C.nuitTexte },
];
export const Frise: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.frise;
  const o = env(t, a, b, 0.4, 0.4);
  const y = 380;
  const cles = [
    { t: a, x: 700, y: 540, z: 1 },
    { t: K("deux_jours") - 0.6, x: 700, y: 540, z: 1 },
    { t: K("deux_jours") + 0.5, x: 1080, y: 540, z: 1 },
    { t: K("trois_semaines") - 0.7, x: 1080, y: 540, z: 1 },
    { t: K("trois_semaines") + 0.4, x: 1800, y: 540, z: 1 },
    { t: K("exclus") - 0.8, x: 1800, y: 540, z: 1 },
    { t: K("exclus") + 0.3, x: 2520, y: 600, z: 1 },
    { t: b, x: 2520, y: 620, z: 0.96 },
  ];
  const adn = prog(t, K("adn") + 0.15, K("adn") + 1.6, ENTREE);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Camera t={t} cles={cles}>
        {/* Ligne du temps, qui se dessine nœud après nœud */}
        {NOEUDS.slice(0, -1).map((n, i) => {
          const suivant = NOEUDS[i + 1];
          const p = prog(t, suivant.debut() - 0.5, suivant.debut() + 0.3);
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: n.x, top: y, width: (suivant.x - n.x - 30) * p, height: 4, background: `linear-gradient(90deg, ${C.nuitDoux}, ${C.corail})`, borderRadius: 2 }} />
              <div style={{ position: "absolute", left: n.x + (suivant.x - n.x - 30) * p - 4, top: y - 11, width: 0, height: 0, borderTop: "13px solid transparent", borderBottom: "13px solid transparent", borderLeft: `20px solid ${C.corail}`, opacity: p > 0.02 ? 1 : 0 }} />
            </React.Fragment>
          );
        })}
        {NOEUDS.map((n, i) => {
          const d = n.debut();
          return (
            <div key={i} style={{ position: "absolute", left: n.x - 290, top: y - 20, width: 580 }}>
              <div style={{ position: "absolute", left: 270, top: 0, width: 44, height: 44, borderRadius: 22, background: n.couleur, ...apparition(t, d, 0.5), boxShadow: `0 0 30px ${n.couleur}` }} />
              <div style={{ position: "absolute", top: -150, width: 580, textAlign: "center", ...monte(t, d + 0.05, 20) }}>
                <div style={petit(28, n.couleur)}>{n.date}</div>
              </div>
              <div style={{ position: "absolute", top: 90, width: 580, textAlign: "center", ...monte(t, d + 0.2, 24) }}>
                <div style={texte(40, C.nuitTexte)}>{n.texte}</div>
              </div>
            </div>
          );
        })}
        {/* « Aucune trousse » */}
        <div style={{ position: "absolute", left: 1080 - 150, top: y + 330, width: 300, display: "flex", justifyContent: "center", ...apparition(t, K("trousse") - 0.1, 0.5) }}>
          <Pastille icone="hopital" texte="Pas de trousse" couleur={C.corail} fond="rgba(255,138,101,.12)" taille={30} />
        </div>
        {/* L'ADN qui disparaît */}
        <div style={{ position: "absolute", left: 1800 - 300, top: y + 250, width: 600, textAlign: "center", ...monte(t, K("adn") - 0.25, 20, 0.4), opacity: Math.min(prog(t, K("adn") - 0.25, K("adn") + 0.15), 1 - prog(t, K("exclus") - 0.6, K("exclus"))) }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 + adn * 60 }}>
            {"ADN".split("").map((l, i) => (
              <span key={i} style={{ ...titre(150, C.corail), opacity: 1 - prog(t, K("adn") + 0.2 + i * 0.18, K("adn") + 1.2 + i * 0.18, ENTREE), filter: `blur(${adn * 16}px)`, translate: `0 ${-adn * (30 + i * 20)}px` }}>{l}</span>
            ))}
          </div>
          <div style={{ ...texte(36, C.nuitTexte), ...monte(t, K("adn") + 0.5, 16) }}>a disparu.</div>
        </div>
        {/* La sanction : le titre de presse sur les travaux écrits */}
        <div style={{ position: "absolute", left: 2520 - 560, top: y + 250, width: 1120, ...monte(t, K("reflexion") - 0.9, 40, 0.8) }}>
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.7)", outline: `4px solid ${C.corail}` }}>
            <Image src="essays-c.png" style={{ width: 1120, height: 1120 * (550 / 1900), display: "block" }} />
          </div>
          <div style={{ ...texte(30, C.nuitTexte), textAlign: "center", marginTop: 20, ...monte(t, K("reflexion") - 0.2, 12) }}>Pour d’autres : des travaux de réflexion écrits.</div>
        </div>
      </Camera>
      <Source t={t} a={a} b={b} texte="Faits allégués. Sources : CBS (2 et 6 oct. 2026), Cornell Daily Sun d’après les dossiers du New York Times, FOX19 / Gray News (28 sept. 2026)." />
    </AbsoluteFill>
  );
};

// 4. « Deux ans plus tard, aucune accusation. »
export const Aucune: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.aucune;
  const o = env(t, a, b, 0.4, 0.45);
  const tampon = prog(t, K("aucune") - 0.12, K("aucune") + 0.18, ENTREE);
  const s = secousse(t, K("aucune") + 0.15, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, opacity: o }}>
      <div style={{ ...petit(30, C.nuitDoux), ...monte(t, P(5) - 0.1, 20) }}>Septembre 2026 · enquête rouverte</div>
      <div style={{ ...titre(150, C.nuitTexte), opacity: tampon, scale: String(1.6 - 0.6 * tampon), translate: `${s.x}px ${s.y}px` }}>
        Aucune accusation.
      </div>
      <div style={{ ...texte(30), ...monte(t, K("aucune") + 0.5, 14) }}>Deux ans après les faits allégués.</div>
      <Source t={t} a={a} b={b} texte="Sources : NPR (29 sept. 2026), AP (14 oct. 2026)." />
    </AbsoluteFill>
  );
};

// 5. « Ce n'est pas qu'aux États-Unis. » puis 6 % signalées à la police.
export const Canada: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.canada;
  const o = env(t, a, b, 0.4, 0.35);
  const sort = prog(t, P(7) - 0.4, P(7) + 0.4, SORTIE);
  const lit = (i: number) => prog(t, K("six") - 0.2 + i * 0.09, K("six") + 0.2 + i * 0.09);
  const compteur = Math.round(6 * prog(t, K("six") - 0.2, K("six") + 0.5, (x) => x));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${-sort * 380}px`, scale: String(1 - 0.45 * sort), opacity: 1 - 0.4 * sort }}>
        <Mots texte="Ce n’est pas qu’aux États-Unis." t={t} debut={P(6) - 0.15} ecart={0.08} style={titre(96)} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 230, top: 300, display: "grid", gridTemplateColumns: "repeat(10, 54px)", gap: 16, opacity: prog(t, P(7) - 0.2, P(7) + 0.5) }}>
        {Array.from({ length: 100 }, (_, i) => {
          const allume = i < 6 ? lit(i) : 0;
          return <div key={i} style={{ width: 54, height: 54, borderRadius: 27, background: allume > 0 ? `rgba(255,138,101,${0.25 + 0.75 * allume})` : "rgba(239,234,247,.13)", scale: String(1 + 0.25 * allume * (1 - prog(t, K("six") + 0.4, K("six") + 1.0))), boxShadow: allume > 0.5 ? `0 0 24px ${C.corail}` : undefined, opacity: prog(t, P(7) - 0.1 + alea(i) * 0.6, P(7) + 0.3 + alea(i) * 0.6) }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 1010, top: 330, width: 760 }}>
        <div style={{ ...petit(26, C.nuitDoux), ...monte(t, P(7), 16) }}>Au Canada</div>
        <div style={{ ...titre(220, C.corail), lineHeight: 1, marginTop: 10, ...monte(t, K("six") - 0.2, 30) }}>{compteur} %</div>
        <div style={{ ...texte(40, C.nuitTexte), marginTop: 18, ...monte(t, K("six") + 0.3, 20) }}>des agressions sexuelles sont signalées à la police.</div>
        <div style={{ ...texte(30), marginTop: 26, ...monte(t, K("police") - 0.2, 14) }}>Contre 36 % des voies de fait.</div>
      </div>
      <Source t={t} a={P(7)} b={b} texte="Statistique Canada, Enquête sociale générale 2019 (Cotter, 2021)." />
    </AbsoluteFill>
  );
};

// 6. Sur 1 000 affaires déclarées, 52 finissent par une peine de prison.
const PALIERS = [
  { n: 1000, label: "affaires déclarées à la police" },
  { n: 360, label: "mènent à une accusation" },
  { n: 219, label: "arrivent devant un tribunal" },
  { n: 104, label: "finissent par une condamnation" },
  { n: 52, label: "par une peine de prison" },
];
export const Entonnoir: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.entonnoir;
  const o = env(t, a, b, 0.35, 0.35);
  const k52 = K("cinquante_deux");
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 150, top: 120, ...monte(t, a + 0.1, 20) }}>
        <div style={petit(26)}>Au Canada, de 2015 à 2019</div>
      </div>
      {PALIERS.map((p, i) => {
        const d = i === 0 ? K("mille") - 0.25 : K("mille") + 0.35 + i * 0.32;
        const fin = i === 4 ? k52 - 0.2 : d;
        const w = (p.n / 1000) * 1080 * prog(t, fin, fin + 0.7);
        const final = i === 4;
        const eteint = !final && t > k52 ? 0.45 : 1;
        return (
          <div key={i} style={{ position: "absolute", left: 150, top: 220 + i * 150, display: "flex", alignItems: "center", gap: 30, opacity: Math.min(eteint, prog(t, fin - 0.1, fin + 0.3)) }}>
            <div style={{ width: Math.max(final ? 26 : 0, w), height: 104, borderRadius: 18, background: final ? C.corail : i === 0 ? "rgba(239,234,247,.85)" : `rgba(185,176,204,${0.75 - i * 0.12})`, boxShadow: final ? `0 0 40px ${C.corail}` : undefined }} />
            <span style={titre(final ? 96 : 64, final ? C.corail : C.nuitTexte)}>{p.n.toLocaleString("fr-CA")}</span>
            <span style={texte(final ? 40 : 32, final ? C.nuitTexte : C.nuitDoux)}>{p.label}</span>
          </div>
        );
      })}
      <Source t={t} a={a} b={b} texte="Statistique Canada, Juristat, décisions de 2015 à 2019 (Cotter, 2024)." />
    </AbsoluteFill>
  );
};

// 7. « La preuve a une date limite : douze heures pour certaines drogues, soixante-douze heures pour l'ADN. »
export const Delais: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.delais;
  const o = env(t, a, b, 0.35, 0.35);
  const X0 = 520, L = 1060; // 0 h → 72 h
  const barre = (heures: number, debut: number, couleur: string, y: number, label: string, valeur: string) => {
    const p = prog(t, debut - 0.2, debut + 0.9);
    return (
      <div style={{ position: "absolute", left: 150, top: y, width: 1700, opacity: prog(t, debut - 0.4, debut) }}>
        <div style={{ position: "absolute", left: 0, top: 18, width: 340, ...texte(36, C.nuitTexte) }}>{label}</div>
        <div style={{ position: "absolute", left: X0 - 150, top: 0, width: (heures / 72) * L * p, height: 92, borderRadius: 16, background: couleur, boxShadow: `0 0 34px ${couleur}66` }} />
        <div style={{ position: "absolute", left: X0 - 150 + (heures / 72) * L * p + 26, top: 8, ...titre(64, couleur), whiteSpace: "nowrap", opacity: p }}>{valeur}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 150, top: 110 }}>
        <Mots texte="La preuve a une date limite." t={t} debut={P(9) - 0.1} ecart={0.07} style={{ ...titre(84), justifyContent: "flex-start" }} />
      </div>
      {[0, 12, 24, 48, 72].map((h) => (
        <div key={h} style={{ position: "absolute", left: X0 + (h / 72) * L, top: 330, height: 520, borderLeft: "2px dashed rgba(239,234,247,.18)", opacity: prog(t, P(9) + 0.3, P(9) + 1) }}>
          <div style={{ ...texte(26), position: "absolute", top: 530, left: -30, width: 80, textAlign: "center" }}>{h} h</div>
        </div>
      ))}
      {barre(12, K("douze"), C.corail, 400, "Certaines drogues", "12 h")}
      {barre(72, K("soixante_douze"), C.violet, 600, "ADN", "72 h")}
      <Source t={t} a={a} b={b} texte="Sources : ASB 121 (2021) ; ligne directrice canadienne, CMAJ (2025) ; OMS (2024)." />
    </AbsoluteFill>
  );
};

// 8. « Un mois après, trois victimes sur quatre vivent un stress post-traumatique. »
export const Tspt: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.tspt;
  const o = env(t, a, b, 0.35, 0.35);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ ...petit(28), ...monte(t, P(10) - 0.1, 16) }}>Un mois après</div>
      <div style={{ display: "flex", gap: 60 }}>
        {[0, 1, 2, 3].map((i) => {
          const allume = i < 3 ? prog(t, K("trois_quatre") - 0.1 + i * 0.22, K("trois_quatre") + 0.3 + i * 0.22) : 0;
          return (
            <div key={i} style={{ ...apparition(t, P(10) + i * 0.12, 0.6) }}>
              <Icone nom="personne" taille={200} couleur={allume > 0 ? `rgba(255,138,101,${0.3 + 0.7 * allume})` : "rgba(239,234,247,.3)"} trait={1.6} style={{ filter: allume > 0.6 ? `drop-shadow(0 0 22px ${C.corail})` : undefined }} />
            </div>
          );
        })}
      </div>
      <div style={{ ...titre(76), ...monte(t, K("trois_quatre") + 0.2, 20), textAlign: "center" }}>
        <span style={{ color: C.corail }}>3 victimes sur 4</span>
      </div>
      <div style={{ ...texte(40, C.nuitTexte), ...monte(t, K("stress") - 0.15, 16) }}>vivent un stress post-traumatique.</div>
      <Source t={t} a={a} b={b} texte="Dworkin et coll., Trauma, Violence & Abuse (2023), méta-analyse de 22 échantillons, 2 106 victimes." />
    </AbsoluteFill>
  );
};

// 9. « Et personne ne leur dit quoi faire, ni dans quel ordre. »
const QUESTIONS = ["Hôpital ?", "Police ?", "Trousse ?", "Qui appeler ?", "72 h ?", "Plainte ?", "IVAC ?", "Avocat ?", "CALACS ?", "Médicaments ?", "Seule ?", "Quel délai ?"];
export const Personne: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.personne;
  const o = env(t, a, b, 0.35, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {QUESTIONS.map((q, i) => {
        const ang = (i / QUESTIONS.length) * Math.PI * 2 + 0.3;
        const r = 360 + alea(i) * 140;
        const d = a + 0.15 + i * 0.2;
        const derive = (t - d) * 14;
        const tremble = t > K("ordre") - 0.2 ? secousse(t, K("ordre") - 0.2 + (i % 3) * 0.05, 8, 0.8) : { x: 0, y: 0 };
        return (
          <div key={i} style={{ position: "absolute", left: 960 + Math.cos(ang) * r * 1.6 - 120 + tremble.x, top: 520 + Math.sin(ang) * r - 30 + tremble.y - derive, width: 240, textAlign: "center", ...texte(34 + (i % 3) * 6, i % 4 === 0 ? C.corail : C.nuitDoux), opacity: prog(t, d, d + 0.5) * 0.85 }}>
            {q}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <Mots texte="Personne ne leur dit quoi faire," t={t} debut={P(11) - 0.05} ecart={0.07} style={titre(76)} />
        <Mots texte="ni dans quel ordre." t={t} debut={K("ordre") - 0.6} ecart={0.08} style={titre(76, C.corail)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 10. « Par où commencer ? » (silence, tout s'éteint)
export const Commencer: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.commencer;
  const o = env(t, a, b, 0.3, 0.3);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ ...titre(150), fontWeight: 300, letterSpacing: "-0.03em", ...apparition(t, P(12) - 0.15, 0.7) }}>Par où commencer ?</div>
    </AbsoluteFill>
  );
};

// 11. « Et si quelqu'un la guidait… pas à pas ? » : le papier s'ouvre en cercle.
export const Guide: React.FC<Props> = ({ t }) => {
  const { W, H } = useFormat();
  const [a, b] = SCENES.guide;
  const rayon = prog(t, K("pas_a_pas") - 0.35, b + 0.05, SORTIE) * Math.hypot(W, H) * 0.62;
  const texteSombre = 1 - prog(t, K("pas_a_pas") - 0.2, K("pas_a_pas") + 0.2);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(prog(t, a, a + 0.3), texteSombre) }}>
        <Mots texte="Et si quelqu’un la guidait…" t={t} debut={P(13) - 0.1} ecart={0.08} style={titre(96)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${rayon}px at 50% 50%)`, background: C.papier, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: i === 4 ? C.violet : C.filet, ...apparition(t, K("pas_a_pas") + i * 0.12, 0.4) }} />
          ))}
        </div>
        <div style={{ ...titre(96, C.encre), marginTop: 50, ...monte(t, K("pas_a_pas") - 0.05, 20) }}>pas à pas ?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

