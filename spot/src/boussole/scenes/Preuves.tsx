// Acte 3 : ce qu'elle relie, qui la relit, la recherche, la communication, le modèle d'affaires, l'équipe, la demande, la fin.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F } from "../theme";
import { env, K, M, P, prog, RESSORT, SCENES, tw } from "../temps";
import { Camera, Icone, Image, Logo, Mots, Pastille, apparition, monte } from "../ui";
import { Source } from "./Probleme";

type Props = { t: number };

const titre = (taille: number, couleur: string = C.encre): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "-0.02em", lineHeight: 1.08 });
const texte = (taille: number, couleur: string = C.encre2): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 600, fontSize: taille, color: couleur, lineHeight: 1.35 });
const surtitre = (couleur: string): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: couleur });

/** En-tête de scène : surtitre et titre, en haut à gauche. */
const Entete: React.FC<{ t: number; a: number; sur: string; couleur?: string; children: React.ReactNode }> = ({ t, a, sur, couleur = C.violet, children }) => (
  <div style={{ position: "absolute", left: 120, top: 90, width: 1680 }}>
    <div style={{ ...surtitre(couleur), ...monte(t, a + 0.1, 14) }}>{sur}</div>
    <div style={{ ...titre(66), marginTop: 14, ...monte(t, a + 0.2, 22) }}>{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// « Boussole ne remplace personne. Elle relie ce qui existe déjà. »
// ---------------------------------------------------------------------------
const NOEUDS = [
  { nom: "Info-aide violence sexuelle", icone: "telephone", couleur: C.corailEncre },
  { nom: "Centres désignés", icone: "hopital", couleur: C.ciel },
  { nom: "CALACS", icone: "coeur", couleur: C.sauge },
  { nom: "Rebâtir", icone: "balance", couleur: C.ambre },
  { nom: "CAVAC", icone: "bouclier", couleur: C.ambre },
  { nom: "IVAC", icone: "argent", couleur: C.violet },
];
export const Relie: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.relie;
  const o = env(t, a, b, 0.4, 0.35);
  const cx = 960, cy = 590;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Le réseau">Elle relie ce qui existe déjà.</Entete>
      <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
        {NOEUDS.map((n, i) => {
          const ang = -Math.PI / 2 + (i / NOEUDS.length) * Math.PI * 2;
          const x = cx + Math.cos(ang) * 560, y = cy + Math.sin(ang) * 300;
          const p = prog(t, K("relie") - 0.3 + i * 0.1, K("relie") + 0.5 + i * 0.1);
          return <line key={i} x1={cx} y1={cy} x2={cx + (x - cx) * p} y2={cy + (y - cy) * p} stroke={n.couleur} strokeWidth={4} strokeDasharray="10 10" strokeLinecap="round" opacity={0.75} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: cx - 80, top: cy - 80, ...apparition(t, a + 0.2, 0.7) }}>
        <Logo taille={160} lueur={0.6} />
      </div>
      {NOEUDS.map((n, i) => {
        const ang = -Math.PI / 2 + (i / NOEUDS.length) * Math.PI * 2;
        const x = cx + Math.cos(ang) * 560, y = cy + Math.sin(ang) * 300;
        return (
          <div key={i} style={{ position: "absolute", left: x - 200, top: y - 40, width: 400, display: "flex", justifyContent: "center", ...apparition(t, K("remplace") - 0.2 + i * 0.18, 0.55) }}>
            <Pastille icone={n.icone} texte={n.nom} couleur={n.couleur} fond={C.blanc} taille={28} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Nous la soumettons aux organismes du terrain : le CVASM, les CALACS, Rebâtir, les CAVAC, la Chaire de l'UQAM. »
// ---------------------------------------------------------------------------
const ORGS: { cle: keyof typeof M.cles; nom: string; role: string; logo?: string; ratio?: number; couleur: string }[] = [
  { cle: "cvasm", nom: "CVASM", role: "Opère Info-aide, accompagne les victimes à Montréal", logo: "cvasm.png", ratio: 279 / 828, couleur: C.corailEncre },
  { cle: "calacs", nom: "RQCALACS", role: "Regroupement des centres d’aide (CALACS)", logo: "rqcalacs.png", ratio: 234 / 264, couleur: C.sauge },
  { cle: "rebatir", nom: "Rebâtir", role: "Conseils juridiques gratuits aux victimes", couleur: C.ambre },
  { cle: "cavac", nom: "CAVAC", role: "Accompagnement au tribunal, aide à l’IVAC", couleur: C.sauge },
  { cle: "uqam", nom: "Chaire VSSMES, UQAM", role: "Recherche sur les violences en enseignement supérieur", logo: "chaire.png", ratio: 114 / 345, couleur: C.ciel },
];
export const Organismes: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.organismes;
  const o = env(t, a, b, 0.4, 0.35);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Validation par le terrain" couleur={C.ciel}>Soumise aux organismes du terrain</Entete>
      <div style={{ position: "absolute", left: 120, top: 330, width: 1680, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 26 }}>
        {ORGS.map((g) => (
          <div key={g.nom} style={{ height: 430, background: C.blanc, borderRadius: 28, padding: 30, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 24px 50px -32px rgba(45,36,64,.5)", ...apparition(t, K(g.cle) - 0.35, 0.6) }}>
            <div style={{ height: 120, display: "flex", alignItems: "center" }}>
              {g.logo ? (
                <Image src={g.logo} style={{ maxWidth: 250, maxHeight: 110, objectFit: "contain" }} />
              ) : (
                <div style={{ ...titre(46, g.couleur), border: `4px solid ${g.couleur}`, borderRadius: 16, padding: "6px 20px" }}>{g.nom}</div>
              )}
            </div>
            <div style={titre(32)}>{g.nom}</div>
            <div style={texte(24)}>{g.role}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, top: 810, ...apparition(t, K("uqam") + 0.2) }}>
        <Pastille icone="courriel" texte="Premiers courriels envoyés le 16 octobre 2026 : relecture d’une heure demandée" couleur={C.ciel} fond={C.cielPale} taille={26} />
      </div>
      <Source t={t} a={a} b={b} sombre={false} texte="Logos utilisés pour identifier les organismes sollicités. Aucun ne valide Boussole à ce jour." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Elle s'appuie sur la recherche : pour beaucoup de victimes, chercher de l'aide devient une seconde blessure. »
// ---------------------------------------------------------------------------
export const Recherche: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.recherche;
  const o = env(t, a, b, 0.4, 0.35);
  const page = (src: string, w: number, h: number, x: number, y: number, rot: number, debut: number) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, rotate: `${rot}deg`, borderRadius: 14, overflow: "hidden", background: C.blanc, boxShadow: "0 30px 70px -30px rgba(45,36,64,.6)", ...monte(t, debut, 50, 0.8) }}>
      <Image src={src} style={{ width: w, height: h, objectFit: "cover", objectPosition: "top left" }} />
    </div>
  );
  // Caméra : on part large, puis on s'approche du résumé de Campbell (2008).
  const cles = [
    { t: a, x: 960, y: 540, z: 1 },
    { t: K("recherche") + 1.2, x: 960, y: 540, z: 1 },
    { t: K("blessure") - 1.6, x: 820, y: 470, z: 1.45 },
    { t: b, x: 820, y: 470, z: 1.5 },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Camera t={t} cles={cles}>
        {page("c-dworkin.png", 560, 515, 1280, 170, 3, a + 0.1)}
        {page("c-jmir.png", 470, 470, 1330, 560, -2, a + 0.35)}
        {page("c-campbell.png", 1100, 600, 280, 230, -1, K("recherche") - 0.2)}
      </Camera>
      <div style={{ position: "absolute", left: 100, top: 840, display: "flex", alignItems: "baseline", gap: 30, padding: "26px 44px", background: C.papier, borderRadius: 28, boxShadow: "0 30px 60px -30px rgba(45,36,64,.45)", opacity: prog(t, K("blessure") - 0.5, K("blessure")) }}>
        <div style={{ ...titre(72, C.corailEncre), ...apparition(t, K("blessure") - 0.4, 0.6) }}>Une seconde blessure.</div>
        <div style={{ ...texte(28), ...monte(t, K("blessure") + 0.1, 12) }}>Campbell, American Psychologist, 2008</div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 80, ...surtitre(C.violet), ...monte(t, a + 0.1, 14) }}>Ce que dit la recherche</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Pour être trouvée avant d'en avoir besoin : des affiches sur les campus, des cartes en pharmacie, des sous-verres dans les bars. »
// ---------------------------------------------------------------------------
export const Com: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.com;
  const o = env(t, a, b, 0.4, 0.35);
  const support = (src: string, w: number, h: number, x: number, y: number, rot: number, debut: number, legende: string) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, ...apparition(t, debut, 0.7) }}>
      <div style={{ rotate: `${rot}deg`, filter: "drop-shadow(0 30px 40px rgba(45,36,64,.35))" }}>
        <Image src={src} style={{ width: w, height: h, display: "block", borderRadius: src.includes("sous") ? 0 : 10 }} />
      </div>
      <div style={{ ...texte(28, C.encre), fontWeight: 800, textAlign: "center", marginTop: 22 }}>{legende}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Faire connaître" couleur={C.sauge}>Être trouvée avant d’en avoir besoin</Entete>
      <div style={{ position: "absolute", left: 1150, top: 250, opacity: 0.35 * prog(t, a + 0.3, a + 1) }}>
        <Image src="abribus.png" style={{ width: 680, height: 408, borderRadius: 10 }} />
      </div>
      {support("affiche-campus.png", 380, 538, 170, 290, -2, K("affiches") - 0.4, "Campus, dans les toilettes")}
      {support("carte-poche.png", 520, 329, 680, 430, 1.5, K("cartes") - 0.4, "Carte de poche, en pharmacie")}
      {support("sous-verre.png", 380, 380, 1360, 380, -3, K("sous_verres") - 0.4, "Sous-verre, dans les bars")}
      <Source t={t} a={a} b={b} sombre={false} texte="Maquettes, à faire relire par les CALACS avant impression." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « La victime ne paie jamais. Ce sont les institutions qui paient : la santé, les cégeps et les universités, les services juridiques. »
// ---------------------------------------------------------------------------
export const Modele: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.modele;
  const o = env(t, a, b, 0.4, 0.35);
  const payeurs: { cle: keyof typeof M.cles; nom: string; detail: string; icone: string; couleur: string; fond: string }[] = [
    { cle: "sante", nom: "Santé Québec", detail: "Licence par centre désigné", icone: "hopital", couleur: C.ciel, fond: C.cielPale },
    { cle: "cegeps", nom: "Cégeps et universités", detail: "Abonnement selon la taille", icone: "ecole", couleur: C.violet, fond: C.violetPale },
    { cle: "juridiques", nom: "Services juridiques", detail: "Licence de service", icone: "balance", couleur: C.ambre, fond: C.ambrePale },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Modèle d’affaires" couleur={C.ambre}>Les institutions paient. Jamais la victime.</Entete>
      <div style={{ position: "absolute", left: 120, top: 300, display: "flex", flexDirection: "column", gap: 26 }}>
        {payeurs.map((p) => (
          <div key={p.nom} style={{ width: 640, height: 150, background: p.fond, borderRadius: 26, padding: "0 34px", display: "flex", alignItems: "center", gap: 26, ...apparition(t, K(p.cle) - 0.35, 0.55) }}>
            <Icone nom={p.icone} taille={60} couleur={p.couleur} />
            <div>
              <div style={titre(38)}>{p.nom}</div>
              <div style={texte(26)}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
      {payeurs.map((p, i) => {
        const pr = prog(t, K(p.cle) - 0.1, K(p.cle) + 0.5);
        const x0 = 780, y0 = 375 + i * 176, x1 = 1020, y1 = 560;
        const long = Math.hypot(x1 - x0, y1 - y0), angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
        return <div key={i} style={{ position: "absolute", left: x0, top: y0 - 3, width: long * pr, height: 6, borderRadius: 3, background: p.couleur, rotate: `${angle}deg`, transformOrigin: "0 50%" }} />;
      })}
      <div style={{ position: "absolute", left: 1030, top: 430, width: 260, height: 260, borderRadius: 40, background: C.encre, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, ...apparition(t, K("institutions") - 0.3, 0.6) }}>
        <Logo taille={110} />
        <div style={titre(36, C.papier)}>Boussole</div>
      </div>
      <div style={{ position: "absolute", left: 1350, top: 360, width: 460, textAlign: "center", ...apparition(t, K("jamais") - 0.35, 0.6) }}>
        <div style={texte(32)}>Pour la victime</div>
        <div style={{ ...titre(190, C.sauge), lineHeight: 1 }}>0 $</div>
        <div style={texte(28)}>toujours. Sans publicité, sans revente de données.</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Un pilote de six centres coûte cent onze mille dollars, sous le seuil des appels d'offres. »
// ---------------------------------------------------------------------------
export const Pilote: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.pilote;
  const o = env(t, a, b, 0.4, 0.35);
  const L = 1500, X = 210, max = 160000;
  const rempli = prog(t, K("cent_onze") - 0.6, K("cent_onze") + 0.6);
  const montant = Math.round((111000 * rempli) / 1000);
  const seuil = prog(t, K("seuil") - 0.4, K("seuil") + 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Le pilote" couleur={C.ambre}>Six centres désignés, dix-huit mois</Entete>
      <div style={{ position: "absolute", left: X, top: 330, ...titre(150, C.violet), ...monte(t, K("cent_onze") - 0.6, 20) }}>{montant} 000 $</div>
      <div style={{ position: "absolute", left: X, top: 560, width: L, height: 90, borderRadius: 45, background: C.panneau }} />
      <div style={{ position: "absolute", left: X, top: 560, width: (L * 111000 * rempli) / max, height: 90, borderRadius: 45, background: C.violet }} />
      <div style={{ position: "absolute", left: X + (L * 139000) / max - 4, top: 520, width: 8, height: 170 * seuil, borderRadius: 4, background: C.corailEncre }} />
      <div style={{ position: "absolute", left: X + (L * 139000) / max - 520, top: 700, width: 520, textAlign: "right", ...texte(30, C.corailEncre), fontWeight: 800, opacity: seuil }}>Seuil d’appel d’offres : 139 000 $</div>
      <div style={{ position: "absolute", left: X, top: 790, width: 1300, ...texte(32), ...monte(t, K("seuil") + 0.3, 14) }}>Sous le seuil : un établissement peut l’acheter de gré à gré.</div>
      <Source t={t} a={a} b={b} sombre={false} texte="Hypothèses de prix à confirmer pendant le pilote. Seuil : Secrétariat du Conseil du trésor, 2026-2027." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Rentable en deux mille vingt-neuf. Puis tout le Québec, l'Ontario, et le Canada. »
// ---------------------------------------------------------------------------
const REVENUS = [116, 495, 922, 1193, 1471];
const COUTS = [306, 517, 799, 1066, 1313];
export const Croissance: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.croissance;
  const o = env(t, a, b, 0.4, 0.35);
  const versCarte = K("quebec") - 0.9;
  const courbe = 1 - prog(t, versCarte, versCarte + 0.5);
  const X = (i: number) => 260 + i * 340;
  const Y = (v: number) => 860 - v * 0.38;
  const trace = prog(t, a + 0.2, K("rentable") + 1.6, (x) => x);
  const chemin = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  const cles = [
    { t: versCarte, x: 960, y: 540, z: 1 },
    { t: K("quebec") + 0.2, x: 1210, y: 560, z: 1.8 },
    { t: K("ontario") - 0.1, x: 1210, y: 560, z: 1.8 },
    { t: K("ontario") + 0.6, x: 1060, y: 620, z: 1.7 },
    { t: K("canada") + 0.5, x: 960, y: 540, z: 1 },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ opacity: courbe }}>
        <Entete t={t} a={a} sur="Projections, scénario de base" couleur={C.ambre}>Rentable en 2029</Entete>
        <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
          {[0, 500, 1000, 1500].map((v) => <line key={v} x1={200} x2={1680} y1={Y(v)} y2={Y(v)} stroke={C.filet} strokeWidth={2} />)}
          <path d={chemin(COUTS)} fill="none" stroke={C.corailEncre} strokeWidth={5} strokeDasharray="14 10" pathLength={1} style={{ strokeDashoffset: 0, clipPath: `inset(0 ${(1 - trace) * 100}% 0 0)` }} />
          <path d={chemin(REVENUS)} fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ clipPath: `inset(0 ${(1 - trace) * 100}% 0 0)` }} />
          {REVENUS.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r={11} fill={C.violet} opacity={prog(t, a + 0.2 + i * 0.45, a + 0.5 + i * 0.45)} />)}
          <line x1={X(2)} x2={X(2)} y1={250} y2={880} stroke={C.sauge} strokeWidth={4} strokeDasharray="8 10" opacity={prog(t, K("rentable"), K("rentable") + 0.4)} />
        </svg>
        {[2027, 2028, 2029, 2030, 2031].map((an, i) => <div key={an} style={{ position: "absolute", left: X(i) - 60, top: 900, width: 120, textAlign: "center", ...titre(30) }}>{an}</div>)}
        <div style={{ position: "absolute", left: X(2) + 20, top: 260, ...texte(30, C.sauge), fontWeight: 800, opacity: prog(t, K("rentable") + 0.1, K("rentable") + 0.5) }}>Les revenus dépassent les coûts</div>
        <div style={{ position: "absolute", left: X(4) - 120, top: Y(1471) - 80, ...titre(40, C.violet), opacity: prog(t, a + 2, a + 2.4) }}>1,47 M$</div>
        <div style={{ position: "absolute", left: 1450, top: 160, display: "flex", flexDirection: "column", gap: 10, ...monte(t, a + 0.5, 10) }}>
          <div style={{ ...texte(24, C.violet), fontWeight: 800 }}>— Revenus</div>
          <div style={{ ...texte(24, C.corailEncre), fontWeight: 800 }}>- - Coûts</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: prog(t, versCarte, versCarte + 0.5) }}>
        <Camera t={t} cles={cles}>
          <Image src="carte-canada.png" style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }} />
        </Camera>
        <div style={{ position: "absolute", left: 120, top: 80, display: "flex", gap: 16 }}>
          <div style={apparition(t, K("quebec") - 0.2)}><Pastille texte="2027-2029 · Québec" couleur={C.violet} fond={C.blanc} taille={28} /></div>
          <div style={apparition(t, K("ontario") - 0.2)}><Pastille texte="2030 · Ontario" couleur={C.sauge} fond={C.blanc} taille={28} /></div>
          <div style={apparition(t, K("canada") - 0.2)}><Pastille texte="2031 et après · Canada" couleur={C.ambre} fond={C.blanc} taille={28} /></div>
        </div>
      </AbsoluteFill>
      <Source t={t} a={a} b={versCarte} sombre={false} texte="Projections, pas des promesses : clients × prix de la grille, en milliers de dollars." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Boussole est portée par Samuel Halimi, étudiant à Polytechnique Montréal. »
// ---------------------------------------------------------------------------
export const Equipe: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.equipe;
  const o = env(t, a, b, 0.4, 0.35);
  const zoom = tw(t, a, b, 1.06, 1, (x) => x);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 200, top: 150, width: 560, height: 700, borderRadius: 44, overflow: "hidden", boxShadow: "0 40px 90px -40px rgba(45,36,64,.6)", ...apparition(t, a + 0.1, 0.8) }}>
        <Img src={staticFile("img/samuel.jpg")} style={{ width: 560, height: 700, objectFit: "cover", objectPosition: "center 40%", scale: String(zoom) }} />
      </div>
      <div style={{ position: "absolute", left: 880, top: 260, width: 900 }}>
        <div style={{ ...surtitre(C.violet), ...monte(t, a + 0.2, 14) }}>Qui porte Boussole</div>
        <div style={{ ...titre(104), marginTop: 16, ...monte(t, K("samuel") - 0.3, 24) }}>Samuel Halimi</div>
        <div style={{ ...texte(40, C.encre), marginTop: 26, ...monte(t, K("polytechnique") - 0.4, 16) }}>Étudiant à Polytechnique Montréal</div>
        <div style={{ ...texte(34), marginTop: 14, ...monte(t, K("polytechnique") + 0.2, 16) }}>Fondateur de Catalyst : sites web et applications</div>
        <div style={{ marginTop: 40, ...apparition(t, K("polytechnique") + 0.6) }}>
          <Pastille texte="Conçu pour le hackathon AMD Challenge" couleur={C.violet} fond={C.violetPale} taille={28} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Nous cherchons un établissement pilote, un partenaire de recherche, et deux cent cinquante mille dollars. »
// ---------------------------------------------------------------------------
export const Demande: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.demande;
  const o = env(t, a, b, 0.4, 0.35);
  const items: { cle: keyof typeof M.cles; n: string; titre: string; detail: string; icone: string; couleur: string; fond: string }[] = [
    { cle: "etablissement", n: "1", titre: "Un établissement pilote", detail: "4 à 6 centres désignés, 18 mois", icone: "hopital", couleur: C.ciel, fond: C.cielPale },
    { cle: "partenaire", n: "2", titre: "Un partenaire de recherche", detail: "Tests éthiques, évaluation publiée", icone: "livre", couleur: C.sauge, fond: C.saugePale },
    { cle: "deux_cent_cinquante", n: "3", titre: "250 000 $", detail: "D’abord non dilutifs", icone: "argent", couleur: C.ambre, fond: C.ambrePale },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Ce que nous demandons">Trois choses, pour commencer</Entete>
      <div style={{ position: "absolute", left: 120, top: 340, width: 1680, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
        {items.map((i) => (
          <div key={i.n} style={{ height: 470, background: i.fond, borderRadius: 34, padding: 44, display: "flex", flexDirection: "column", gap: 22, ...apparition(t, K(i.cle) - 0.35, 0.6) }}>
            <Icone nom={i.icone} taille={84} couleur={i.couleur} trait={1.8} />
            <div style={titre(i.n === "3" ? 80 : 48)}>{i.titre}</div>
            <div style={texte(30)}>{i.detail}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « On ne remplace pas l'humain auprès de la victime. On lui rend le temps de l'être. »
// ---------------------------------------------------------------------------
export const Humain: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.humain;
  const o = env(t, a, b, 0.4, 0.4);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, padding: "0 160px" }}>
      <Mots texte="On ne remplace pas l’humain auprès de la victime." t={t} debut={P(36) - 0.1} ecart={0.07} style={titre(76)} />
      <Mots texte="On lui rend le temps de l’être." t={t} debut={K("temps") - 1.2} ecart={0.09} style={titre(76, C.violet)} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « Boussole. Pour qu'aucune victime ne cherche seule quoi faire. »
// ---------------------------------------------------------------------------
export const Final: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.final;
  const o = env(t, a, b, 0.4, 0.35);
  const p = prog(t, a, a + 0.9, RESSORT);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, scale: String(0.9 + 0.1 * p) }}>
        <Logo taille={150} lueur={1.2 - p * 0.8} rotation={tw(t, a, a + 1.4, -60, 0, RESSORT)} />
        <div style={{ ...titre(150), fontWeight: 900, letterSpacing: "-0.035em" }}>Boussole</div>
      </div>
      <Mots texte="Pour qu’aucune victime ne cherche seule quoi faire." t={t} debut={K("aucune_victime") - 0.4} ecart={0.07} style={{ ...titre(56, C.encre2), fontWeight: 700, marginTop: 40 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 70, ...monte(t, P(37) + 2.6, 20) }}>
        <div style={{ background: C.blanc, padding: 14, borderRadius: 20, boxShadow: "0 20px 40px -26px rgba(45,36,64,.5)" }}>
          <Img src={staticFile("img/qr.svg")} style={{ width: 150, height: 150, display: "block" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Pastille texte="boussole-ux-v2.vercel.app" couleur={C.violet} fond={C.violetPale} taille={30} />
          <Pastille icone="courriel" texte="boussole.app@gmail.com" couleur={C.encre2} fond={C.blanc} taille={26} bordure={C.filet} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Carton de fin, musique seule.
// ---------------------------------------------------------------------------
export const Carton: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.carton;
  const o = env(t, a, b, 0.4, 0.5);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ ...surtitre(C.nuitDoux), ...monte(t, a + 0.1, 12) }}>réalisé par</div>
      <div style={{ ...titre(96, C.nuitTexte), ...monte(t, a + 0.25, 18) }}>Samuel Halimi</div>
      <div style={{ ...texte(30, C.nuitDoux), ...monte(t, a + 0.45, 12) }}>AMD Challenge · Montréal · 2026</div>
      <div style={{ marginTop: 26, ...apparition(t, a + 0.7) }}><Logo taille={64} /></div>
      <div style={{ ...texte(20, C.nuitDoux), marginTop: 30, opacity: 0.8 * prog(t, a + 0.8, a + 1.2) }}>Démo avec données fictives. Faits de l’affaire de Cornell : allégations, aucune condamnation.</div>
    </AbsoluteFill>
  );
};

