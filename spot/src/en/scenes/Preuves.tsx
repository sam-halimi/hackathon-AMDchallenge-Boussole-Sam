// Act 3: the evidence on nurses' time, who reviews it, the model, the team, the ask, the end.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F } from "../theme";
import { env, K, M, prog, RESSORT, SCENES, tw } from "../temps";
import { Camera, Icone, Image, Logo, Mots, Pastille, apparition, monte } from "../ui";
import { EtudeZoom, Source } from "./Probleme";

type Props = { t: number };

const titre = (taille: number, couleur: string = C.encre): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "-0.02em", lineHeight: 1.08 });
const texte = (taille: number, couleur: string = C.encre2): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 600, fontSize: taille, color: couleur, lineHeight: 1.35 });
const surtitre = (couleur: string): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: couleur });

/** Scene header: kicker and title, top left. */
const Entete: React.FC<{ t: number; a: number; sur: string; couleur?: string; children: React.ReactNode }> = ({ t, a, sur, couleur = C.violet, children }) => (
  <div style={{ position: "absolute", left: 120, top: 90, width: 1680 }}>
    <div style={{ ...surtitre(couleur), ...monte(t, a + 0.1, 14, 0.45) }}>{sur}</div>
    <div style={{ ...titre(66), marginTop: 14, ...monte(t, a + 0.15, 22, 0.45) }}>{children}</div>
  </div>
);

// ---------------------------------------------------------------------------
// “Nurses spend a third of their time on paperwork. A structured record cuts that by a quarter.”
// Two real abstracts, the exact English line highlighted.
// ---------------------------------------------------------------------------
export const EtudesTemps: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.etudesTemps;
  const coupe = K("paperwork") + 0.5;
  return (
    <AbsoluteFill>
      {t < coupe + 0.05 ? (
        <EtudeZoom t={t} a={a} b={coupe} nom="hendrich" surligne={K("third") - 0.15} zoom={1.45} sombre={false} legende="Hendrich et al., “A 36-hospital time and motion study: how do medical-surgical nurses spend their time?”, The Permanente Journal, 2008" />
      ) : null}
      {t >= coupe - 0.35 ? (
        <EtudeZoom t={t} a={coupe - 0.35} b={b} nom="poissant" surligne={K("quarter") - 0.6} zoom={1.7} sombre={false} legende="Poissant et al., “The impact of electronic health records on time efficiency of physicians and nurses: a systematic review”, JAMIA, 2005" />
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “We're submitting Boussole to the people on the ground: survivor centres, legal clinics, and researchers.”
// ---------------------------------------------------------------------------
const ORGS: { cle: keyof typeof M.cles; nom: string; role: string; logo: string; couleur: string }[] = [
  { cle: "centres", nom: "CVASM", role: "Runs the sexual violence helpline, supports survivors in Montreal", logo: "cvasm.png", couleur: C.corailEncre },
  { cle: "centres", nom: "RQCALACS", role: "Network of Quebec’s sexual assault centres", logo: "rqcalacs.png", couleur: C.sauge },
  { cle: "clinics", nom: "Rebâtir", role: "Free legal advice for survivors", logo: "rebatir-logo.png", couleur: C.ambre },
  { cle: "clinics", nom: "CAVAC", role: "Court support for victims of crime", logo: "cavac-logo.png", couleur: C.sauge },
  { cle: "researchers", nom: "Chaire VSSMES, UQAM", role: "Research on sexual violence in higher education", logo: "chaire.png", couleur: C.ciel },
];
export const Organismes: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.organismes;
  const o = env(t, a, b, 0.35, 0.3);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Reviewed by the field" couleur={C.ciel}>Submitted to the people on the ground</Entete>
      <div style={{ position: "absolute", left: 120, top: 330, width: 1680, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 26 }}>
        {ORGS.map((g, i) => (
          <div key={g.nom} style={{ height: 430, background: C.blanc, borderRadius: 28, padding: 30, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 24px 50px -32px rgba(45,36,64,.5)", ...apparition(t, K(g.cle) - 0.35 + (i % 2) * 0.12, 0.5) }}>
            <div style={{ height: 120, display: "flex", alignItems: "center" }}>
              <Image src={g.logo} style={{ maxWidth: 250, maxHeight: 110, objectFit: "contain" }} />
            </div>
            <div style={titre(32)}>{g.nom}</div>
            <div style={texte(24)}>{g.role}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, top: 810, ...apparition(t, K("researchers") + 0.2) }}>
        <Pastille icone="courriel" texte="First emails sent October 16, 2026: a one-hour review requested" couleur={C.ciel} fond={C.cielPale} taille={26} />
      </div>
      <Source t={t} a={a} b={b} sombre={false} texte="Logos identify the organizations contacted. None has endorsed Boussole to date." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “Survivors never pay. Institutions do, about eighty dollars per survivor, roughly fifteen percent of what it saves.”
// ---------------------------------------------------------------------------
export const Prix: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.prix;
  const o = env(t, a, b, 0.35, 0.3);
  const H = 520, BAS = 900, max = 541;
  const economie = prog(t, K("eighty") - 0.5, K("eighty") + 0.4, RESSORT);
  const prix = prog(t, K("eighty") - 0.1, K("eighty") + 0.5, RESSORT);
  const part = prog(t, K("fifteen") - 0.2, K("fifteen") + 0.3);
  const barre = (x: number, v: number, p: number, couleur: string, etiquette: string, sous: string) => (
    <>
      <div style={{ position: "absolute", left: x, top: BAS - (H * v * p) / max, width: 220, height: (H * v * p) / max, borderRadius: "22px 22px 6px 6px", background: couleur }} />
      <div style={{ position: "absolute", left: x - 40, top: BAS - (H * v) / max - 80, width: 300, textAlign: "center", ...titre(58, couleur), opacity: p }}>{etiquette}</div>
      <div style={{ position: "absolute", left: x - 60, top: BAS + 20, width: 340, textAlign: "center", ...texte(26), opacity: p }}>{sous}</div>
    </>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="Business model" couleur={C.ambre}>Institutions pay. Survivors never do.</Entete>
      <div style={{ position: "absolute", left: 160, top: 330, width: 520, height: 560, borderRadius: 40, background: C.saugePale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, ...apparition(t, K("never") - 0.35, 0.5) }}>
        <div style={texte(34)}>For survivors</div>
        <div style={{ ...titre(200, C.sauge), lineHeight: 1 }}>$0</div>
        <div style={{ ...texte(28), textAlign: "center", padding: "0 40px" }}>Always. No ads, no data resale.</div>
      </div>
      {barre(900, 541, economie, C.violet, "$541", "saved per survivor")}
      {barre(1240, 81, prix, C.ambre, "$81", "paid by the institution")}
      <div style={{ position: "absolute", left: 1500, top: 470, width: 340, ...apparition(t, K("fifteen") - 0.2, 0.45) }}>
        <div style={{ ...titre(120, C.violet), lineHeight: 1 }}>{Math.round(15 * part)}%</div>
        <div style={texte(28)}>of what it saves</div>
      </div>
      <Source t={t} a={a} b={b} sombre={false} texte="Base-case model: nurse time, legal preparation and avoided follow-ups. Savings to be measured during the pilot." />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “In our base case, it's profitable from year one. Boussole already works in French and English.
//  We start small, in Montreal, and we do it right. Then all of Canada, and then the world, to reach every survivor who needs it.”
// ---------------------------------------------------------------------------
const REVENUS = [116, 447, 857, 903, 1174];
const COUTS = [97, 246, 430, 635, 862];
/** Montreal's dot on each map image (1920×1080 space). */
const MTL = { montreal: { x: 1012, y: 584 }, canada: { x: 1494, y: 711 }, monde: { x: 568, y: 406 } };
const Telephone2: React.FC<{ src: string; x: number; y: number; h: number; style?: React.CSSProperties }> = ({ src, x, y, h, style }) => {
  const w = (h * 1170) / 2532;
  return (
    <div style={{ position: "absolute", left: x - 14, top: y - 14, width: w + 28, height: h + 28, borderRadius: 56, background: "#17111F", boxShadow: "0 50px 100px -40px rgba(45,36,64,.6)", ...style }}>
      <Img src={staticFile(src)} style={{ position: "absolute", left: 14, top: 14, width: w, height: h, borderRadius: 44 }} />
    </div>
  );
};
export const Croissance: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.croissance;
  const o = env(t, a, b, 0.35, 0.3);
  const versLangues = K("french") - 0.7;
  const versCarte = K("small") - 0.7;
  const versCanada = K("canada") - 0.45;
  const versMonde = K("world") - 0.45;
  const courbe = 1 - prog(t, versLangues, versLangues + 0.4);
  const langues = Math.min(prog(t, versLangues, versLangues + 0.4), 1 - prog(t, versCarte, versCarte + 0.4));
  const X = (i: number) => 260 + i * 340;
  const Y = (v: number) => 860 - v * 0.45;
  const trace = prog(t, a + 0.1, K("profitable") + 0.9, (x) => x);
  const chemin = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  const carte = (src: string, c: { x: number; y: number }, de: number, jusque: number, z0: number) => (
    <AbsoluteFill style={{ opacity: Math.min(prog(t, de, de + 0.45), jusque < b ? 1 - prog(t, jusque, jusque + 0.45) : 1) }}>
      <Camera t={t} cles={[{ t: de, x: c.x, y: c.y, z: z0 }, { t: (jusque < b ? jusque : b) + 0.4, x: (c.x + 960) / 2, y: (c.y + 540) / 2, z: 1.02 }]}>
        <Image src={src} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }} />
      </Camera>
    </AbsoluteFill>
  );
  const etiquette = (texte: string, debut: number, fin: number, couleur: string) => (
    <div style={{ position: "absolute", left: 120, top: 90, opacity: Math.min(prog(t, debut, debut + 0.3), 1 - prog(t, fin, fin + 0.25)), translate: `0 ${(1 - prog(t, debut, debut + 0.35, RESSORT)) * 16}px` }}>
      <div style={{ background: C.papier, borderRadius: 26, padding: "18px 30px", boxShadow: "0 24px 50px -28px rgba(45,36,64,.6)", ...titre(52, couleur) }}>{texte}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ opacity: courbe }}>
        <Entete t={t} a={a} sur="Projections, base case" couleur={C.ambre}>Profitable from year one</Entete>
        <svg style={{ position: "absolute", inset: 0 }} width={1920} height={1080}>
          {[0, 500, 1000].map((v) => <line key={v} x1={200} x2={1680} y1={Y(v)} y2={Y(v)} stroke={C.filet} strokeWidth={2} />)}
          <path d={chemin(COUTS)} fill="none" stroke={C.corailEncre} strokeWidth={5} strokeDasharray="14 10" style={{ clipPath: `inset(0 ${(1 - trace) * 100}% 0 0)` }} />
          <path d={chemin(REVENUS)} fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ clipPath: `inset(0 ${(1 - trace) * 100}% 0 0)` }} />
          {REVENUS.map((v, i) => <circle key={i} cx={X(i)} cy={Y(v)} r={11} fill={C.violet} opacity={prog(t, a + 0.1 + i * 0.3, a + 0.35 + i * 0.3)} />)}
          <line x1={X(0)} x2={X(0)} y1={300} y2={880} stroke={C.sauge} strokeWidth={4} strokeDasharray="8 10" opacity={prog(t, K("profitable") - 0.2, K("profitable") + 0.2)} />
        </svg>
        {[2027, 2028, 2029, 2030, 2031].map((an, i) => <div key={an} style={{ position: "absolute", left: X(i) - 60, top: 900, width: 120, textAlign: "center", ...titre(30) }}>{an}</div>)}
        <div style={{ position: "absolute", left: X(0) + 24, top: 300, ...texte(30, C.sauge), fontWeight: 800, opacity: prog(t, K("profitable") - 0.1, K("profitable") + 0.3) }}>Revenue above costs in 2027</div>
        <div style={{ position: "absolute", left: X(4) - 130, top: Y(1174) - 80, ...titre(40, C.violet), opacity: prog(t, K("profitable") + 0.4, K("profitable") + 0.8) }}>$1.17M</div>
        <div style={{ position: "absolute", left: 1450, top: 160, display: "flex", flexDirection: "column", gap: 10, ...monte(t, a + 0.3, 10) }}>
          <div style={{ ...texte(24, C.violet), fontWeight: 800 }}>— Revenue</div>
          <div style={{ ...texte(24, C.corailEncre), fontWeight: 800 }}>- - Costs</div>
        </div>
        <Source t={t} a={a} b={versLangues} sombre={false} texte="Projections, not promises: clients × price list, in thousands of Canadian dollars." />
      </AbsoluteFill>
      {t >= versLangues - 0.05 && t < versCarte + 0.5 ? (
        <AbsoluteFill style={{ opacity: langues }}>
          <div style={{ position: "absolute", left: 120, top: 90, width: 700 }}>
            <div style={{ ...surtitre(C.violet), ...monte(t, versLangues + 0.1, 14, 0.4) }}>Already bilingual</div>
            <div style={{ ...titre(76), marginTop: 16, ...monte(t, versLangues + 0.2, 22, 0.45) }}>French and English, from day one</div>
            <div style={{ ...texte(32), marginTop: 26, ...monte(t, K("english") + 0.1, 14, 0.4) }}>The language follows the phone. Every step, deadline and source exists in both.</div>
          </div>
          <div style={{ ...apparition(t, K("french") - 0.25, 0.45) }}>
            <Telephone2 src="captures/accueil.png" x={930} y={150} h={780} style={{ rotate: "-3deg" }} />
            <div style={{ position: "absolute", left: 1000, top: 960, ...titre(34, C.encre2) }}>Français</div>
          </div>
          <div style={{ ...apparition(t, K("english") - 0.25, 0.45) }}>
            <Telephone2 src="captures-en/accueil.png" x={1360} y={130} h={780} style={{ rotate: "3deg" }} />
            <div style={{ position: "absolute", left: 1460, top: 950, ...titre(34, C.violet) }}>English</div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= versCarte - 0.05 ? (
        <AbsoluteFill>
          {carte("carte-montreal.png", MTL.montreal, versCarte, versCanada, 1.25)}
          {t >= versCanada - 0.05 ? carte("carte-canada-en.png", MTL.canada, versCanada, versMonde, 1.9) : null}
          {t >= versMonde - 0.05 ? carte("carte-monde.png", MTL.monde, versMonde, b + 1, 2.6) : null}
          {etiquette("We start small: Montréal", K("small") - 0.3, versCanada, C.violet)}
          <div style={{ position: "absolute", left: 120, top: 200, opacity: Math.min(prog(t, K("right") - 0.3, K("right")), 1 - prog(t, versCanada, versCanada + 0.25)) }}>
            <Pastille icone="coche" texte="Done right: reviewed with the field first" couleur={C.sauge} fond={C.papier} taille={30} />
          </div>
          {etiquette("Then all of Canada", K("canada") - 0.3, versMonde, C.ciel)}
          {etiquette("Then the world", K("world") - 0.3, b + 1, C.ambre)}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, display: "flex", justifyContent: "center", ...monte(t, K("reach") - 0.2, 18, 0.45) }}>
            <div style={{ background: C.encre, color: C.papier, borderRadius: 30, padding: "22px 44px", ...titre(46, C.papier) }}>To reach every survivor who needs it.</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “Boussole is built by Samuel Halimi, a student at Polytechnique Montreal, and an entrepreneur, founder of Catalyst.”
// ---------------------------------------------------------------------------
export const Equipe: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.equipe;
  const o = env(t, a, b, 0.35, 0.3);
  const zoom = tw(t, a, b, 1.06, 1, (x) => x);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: 200, top: 150, width: 560, height: 700, borderRadius: 44, overflow: "hidden", boxShadow: "0 40px 90px -40px rgba(45,36,64,.6)", ...apparition(t, a + 0.05, 0.6) }}>
        <Img src={staticFile("img/samuel.jpg")} style={{ width: 560, height: 700, objectFit: "cover", objectPosition: "center 40%", scale: String(zoom) }} />
      </div>
      <div style={{ position: "absolute", left: 880, top: 260, width: 900 }}>
        <div style={{ ...surtitre(C.violet), ...monte(t, a + 0.1, 14, 0.45) }}>Who is behind Boussole</div>
        <div style={{ ...titre(104), marginTop: 16, ...monte(t, K("samuel") - 0.3, 24, 0.5) }}>Samuel Halimi</div>
        <div style={{ ...texte(40, C.encre), marginTop: 26, ...monte(t, K("polytechnique") - 0.35, 16, 0.45) }}>Student at Polytechnique Montréal</div>
        <div style={{ ...texte(40, C.encre), marginTop: 14, ...monte(t, K("entrepreneur") - 0.2, 16, 0.45) }}>Entrepreneur, founder of <span style={{ color: C.violet, fontWeight: 800, ...apparition(t, K("catalyst") - 0.2, 0.4) }}>Catalyst</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “We're looking for a pilot hospital, a research partner, and our first hundred thousand dollars.”
// ---------------------------------------------------------------------------
export const Demande: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.demande;
  const o = env(t, a, b, 0.35, 0.3);
  const items: { cle: keyof typeof M.cles; n: string; titre: string; detail: string; icone: string; couleur: string; fond: string; logo?: string }[] = [
    { cle: "pilot", n: "1", titre: "A pilot hospital", detail: "4 to 6 designated centres, 18 months", icone: "hopital", couleur: C.ciel, fond: C.cielPale },
    { cle: "research", n: "2", titre: "A research partner", detail: "Ethical testing, a published evaluation", icone: "livre", couleur: C.sauge, fond: C.saugePale },
    { cle: "hundred", n: "3", titre: "$100,000", detail: "Seed funding, non-dilutive first", icone: "argent", couleur: C.ambre, fond: C.ambrePale },
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Entete t={t} a={a} sur="What we are asking for">Three things, to start</Entete>
      <div style={{ position: "absolute", left: 120, top: 330, width: 1680, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 30 }}>
        {items.map((i) => (
          <div key={i.n} style={{ height: 500, background: i.fond, borderRadius: 34, padding: 44, display: "flex", flexDirection: "column", gap: 22, ...apparition(t, K(i.cle) - 0.35, 0.5) }}>
            <Icone nom={i.icone} taille={84} couleur={i.couleur} trait={1.8} />
            <div style={titre(i.n === "3" ? 80 : 48)}>{i.titre}</div>
            <div style={texte(30)}>{i.detail}</div>
            {i.logo ? (
              <div style={{ marginTop: "auto", background: C.blanc, borderRadius: 14, padding: "10px 16px", alignSelf: "flex-start" }}>
                <Image src={i.logo} style={{ height: 56, maxWidth: 260, objectFit: "contain", display: "block" }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// “Boussole. So no survivor has to figure it out alone.”
// ---------------------------------------------------------------------------
export const Final: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.final;
  const o = env(t, a, b, 0.35, 0.35);
  const p = prog(t, a, a + 0.8, RESSORT);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34, scale: String(0.9 + 0.1 * p) }}>
        <Logo taille={150} lueur={1.2 - p * 0.8} rotation={tw(t, a, a + 1.2, -60, 0, RESSORT)} />
        <div style={{ ...titre(150), fontWeight: 900, letterSpacing: "-0.035em" }}>Boussole</div>
      </div>
      <Mots texte="So no survivor has to figure it out alone." t={t} debut={K("boussole_end") + 0.4} ecart={0.07} style={{ ...titre(56, C.encre2), fontWeight: 700, marginTop: 40 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 70, ...monte(t, K("alone") + 0.4, 20) }}>
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
// End card, music only.
// ---------------------------------------------------------------------------
export const Carton: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.carton;
  const o = env(t, a, b, 0.35, 0.5);
  return (
    <AbsoluteFill style={{ opacity: o, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ ...surtitre(C.nuitDoux), ...monte(t, a + 0.1, 12) }}>made by</div>
      <div style={{ ...titre(96, C.nuitTexte), ...monte(t, a + 0.25, 18) }}>Samuel Halimi</div>
      <div style={{ ...texte(30, C.nuitDoux), ...monte(t, a + 0.4, 12) }}>AMD Challenge · Montréal · 2026</div>
      <div style={{ marginTop: 26, ...apparition(t, a + 0.6) }}><Logo taille={64} /></div>
      <div style={{ ...texte(20, C.nuitDoux), marginTop: 30, opacity: 0.8 * prog(t, a + 0.7, a + 1.1) }}>Demo with fictional data. Cornell case: allegations only, no charges filed.</div>
    </AbsoluteFill>
  );
};
