// Act 1 (English): the Cornell case (alleged facts, press sources), then the Canadian numbers. Night background.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F } from "../theme";
import { alea, Cle, ENTREE, env, K, P, prog, SCENES, SORTIE, tw } from "../temps";
import { Camera, Image, Mots, apparition, monte, secousse, useFormat } from "../ui";
import etudes from "../etudes.json";

type Props = { t: number };
type Etude = { url: string; titre: string; phrase: string; taille: { w: number; h: number }; lignes: { x: number; y: number; w: number; h: number }[] };
const ETUDES = etudes as unknown as Record<string, Etude>;

const titre = (taille: number, couleur: string = C.nuitTexte): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "-0.02em", lineHeight: 1.08 });
const petit = (taille: number, couleur: string = C.nuitDoux): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 800, fontSize: taille, color: couleur, letterSpacing: "0.18em", textTransform: "uppercase" });
const texte = (taille: number, couleur: string = C.nuitDoux): React.CSSProperties => ({ fontFamily: F.texte, fontWeight: 600, fontSize: taille, color: couleur, lineHeight: 1.35 });

/** Source line, bottom left, discreet. */
export const Source: React.FC<{ t: number; a: number; b: number; texte: string; sombre?: boolean }> = ({ t, a, b, texte: s, sombre = true }) => (
  <div style={{ position: "absolute", left: 96, bottom: 48, width: 1700, opacity: env(t, a + 0.3, b, 0.4, 0.25) * 0.9, fontFamily: F.texte, fontWeight: 600, fontSize: 21, color: sombre ? C.nuitDoux : C.encre3 }}>{s}</div>
);

/**
 * Study zoom: the real PubMed abstract, the camera moves in on the exact English sentence,
 * a marker sweeps across it line by line. No translation, no retyping.
 */
export const EtudeZoom: React.FC<{ t: number; a: number; b: number; nom: string; surligne: number; zoom?: number; legende: string; sombre?: boolean }> = ({ t, a, b, nom, surligne, zoom = 1.9, legende, sombre = true }) => {
  const e = ETUDES[nom];
  const L = 1180; // card width on screen
  const s = L / e.taille.w;
  const X = 960 - L / 2, Y = 90;
  const l0 = e.lignes[0], ln = e.lignes[e.lignes.length - 1];
  // Centre of the quoted sentence, on screen.
  const gauche = Math.min(...e.lignes.map((q) => q.x)), droite = Math.max(...e.lignes.map((q) => q.x + q.w));
  const cx = X + ((gauche + droite) / 2) * s;
  const cy = Y + ((l0.y + ln.y + ln.h) / 2) * s;
  const o = env(t, a, b, 0.35, 0.3);
  const cles: Cle[] = [
    { t: a, x: 960, y: Y + (e.taille.h * s) / 2 - 80, z: 0.78 },
    { t: surligne - 0.7, x: 960, y: cy, z: 1.05 },
    { t: surligne + 0.1, x: cx, y: cy, z: zoom },
    { t: b, x: cx, y: cy, z: zoom * 1.04 },
  ];
  // Total length of the highlighted lines, so the marker sweeps at constant speed.
  const total = e.lignes.reduce((acc, q) => acc + q.w, 0);
  const avance = prog(t, surligne - 0.05, surligne + 1.4, (x) => x) * total;
  let cumul = 0;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Camera t={t} cles={cles}>
        <div style={{ position: "absolute", left: X - 24, top: Y - 24, width: L + 48, height: e.taille.h * s + 48, background: "#FFFFFF", borderRadius: 18, boxShadow: "0 40px 90px -30px rgba(0,0,0,.6)" }} />
        {e.lignes.map((q, i) => {
          const w = Math.max(0, Math.min(q.w, avance - cumul));
          cumul += q.w;
          return <div key={i} style={{ position: "absolute", left: X + q.x * s - 3, top: Y + q.y * s, width: w * s + 6, height: q.h * s, background: "rgba(255,214,90,.75)", borderRadius: 4 }} />;
        })}
        <Img src={staticFile(`etudes/${nom}.png`)} style={{ position: "absolute", left: X, top: Y, width: L, height: e.taille.h * s, mixBlendMode: "multiply" }} />
      </Camera>
      <div style={{ position: "absolute", left: 96, bottom: 40, maxWidth: 1500, display: "flex", ...monte(t, surligne + 0.3, 14) }}>
        <div style={{ background: "rgba(13,9,20,.86)", padding: "14px 22px", borderRadius: 14, boxShadow: sombre ? undefined : "0 18px 40px -20px rgba(45,36,64,.7)", fontFamily: F.texte, fontWeight: 700, fontSize: 24, color: C.nuitTexte }}>{legende}</div>
      </div>
    </AbsoluteFill>
  );
};

// 1. “October 2024. Cornell University.”
export const Ouverture: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.ouverture;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: env(t, a, b, 0.4, 0.3), flexDirection: "column", gap: 24 }}>
      <div style={{ ...petit(30, C.corail), ...monte(t, P(0) - 0.1, 20, 0.5) }}>October 2024</div>
      <Mots texte="Cornell University" t={t} debut={K("cornell") - 0.45} ecart={0.08} duree={0.5} style={titre(130)} />
    </AbsoluteFill>
  );
};

// 2. “A student says she was drugged and raped by members of a fraternity.”
export const Presse: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.presse;
  const pousse = tw(t, a, b, 1, 1.06, (x) => x);
  const carte = (src: string, debut: number, x: number, y: number, w: number, rot: number, ratio: number) => {
    const p = prog(t, debut, debut + 0.6);
    return (
      <div style={{ position: "absolute", left: x, top: y + (1 - p) * 50, width: w, height: w * ratio, opacity: p, rotate: `${rot}deg`, borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.7)", filter: `brightness(${1 - 0.4 * prog(t, K("drugged") - 0.2, K("drugged") + 0.3)})` }}>
        <Image src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: env(t, a, b, 0.3, 0.3) }}>
      <AbsoluteFill style={{ scale: String(pousse) }}>
        {carte("nbc-c.png", a + 0.05, 150, 110, 940, -1.5, 540 / 1940)}
        {carte("npr-c.png", a + 0.35, 1010, 150, 770, 1.2, 820 / 1820)}
        {carte("cbs-c.png", a + 0.65, 1260, 470, 520, -1, 1180 / 1440)}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 580, width: 1080 }}>
        <div style={{ ...texte(40, C.nuitTexte), ...monte(t, P(1) - 0.05, 20, 0.4) }}>A student says she was</div>
        <div style={{ display: "flex", gap: 28, marginTop: 6 }}>
          <span style={{ ...titre(104, C.corail), ...apparition(t, K("drugged") - 0.12, 0.45) }}>drugged</span>
          <span style={{ ...titre(104, C.corail), ...apparition(t, K("raped") - 0.15, 0.45) }}>and raped.</span>
        </div>
        <div style={{ ...texte(34, C.nuitTexte), ...monte(t, K("fraternity") - 0.5, 16, 0.4), marginTop: 16 }}>By members of a fraternity, she alleges.</div>
      </div>
      <Source t={t} a={a} b={b} texte="Screenshots: NBC News, NPR (Sept. 29, 2026), CBS News (Oct. 6, 2026). Alleged facts, no conviction." />
    </AbsoluteFill>
  );
};

// 3. Timeline: no kit, DNA gone, a reflection essay, no charges.
const NOEUDS = [
  { x: 380, date: "2 days later", texte: "Campus health: no forensic kit offered, her lawyer says.", debut: () => K("kit") - 0.6, couleur: C.corail },
  { x: 1060, date: "3 weeks later", texte: "She asks for the kit herself.", debut: () => K("weeks") - 0.35, couleur: C.corail },
  { x: 1740, date: "May 2025", texte: "University sanctions: for some, a reflection essay.", debut: () => K("essay") - 0.9, couleur: C.nuitTexte },
];
export const Frise: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.frise;
  const y = 330;
  const cles: Cle[] = [
    { t: a, x: 720, y: 540, z: 1 },
    { t: K("weeks") - 0.5, x: 720, y: 540, z: 1 },
    { t: K("weeks") + 0.3, x: 1060, y: 560, z: 1 },
    { t: K("essay") - 0.9, x: 1060, y: 560, z: 1 },
    { t: K("essay") - 0.2, x: 1500, y: 600, z: 0.98 },
    { t: b, x: 1520, y: 610, z: 0.96 },
  ];
  const adn = prog(t, K("dna") + 0.1, K("dna") + 1.3, ENTREE);
  const tampon = prog(t, K("charges") - 0.15, K("charges") + 0.12, ENTREE);
  const s = secousse(t, K("charges") + 0.1, 10);
  return (
    <AbsoluteFill style={{ opacity: env(t, a, b, 0.3, 0.3) }}>
      <Camera t={t} cles={cles}>
        {NOEUDS.slice(0, -1).map((n, i) => {
          const suivant = NOEUDS[i + 1];
          const p = prog(t, suivant.debut() - 0.4, suivant.debut() + 0.2);
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
              <div style={{ position: "absolute", left: 270, top: 0, width: 44, height: 44, borderRadius: 22, background: n.couleur, ...apparition(t, d, 0.4), boxShadow: `0 0 30px ${n.couleur}` }} />
              <div style={{ position: "absolute", top: -130, width: 580, textAlign: "center", ...monte(t, d + 0.05, 16, 0.4) }}>
                <div style={petit(28, n.couleur)}>{n.date}</div>
              </div>
              <div style={{ position: "absolute", top: 90, width: 580, textAlign: "center", ...monte(t, d + 0.15, 20, 0.4) }}>
                <div style={texte(40, C.nuitTexte)}>{n.texte}</div>
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 1060 - 300, top: y + 270, width: 600, textAlign: "center", opacity: Math.min(prog(t, K("dna") - 0.2, K("dna") + 0.1), 1 - prog(t, K("essay") - 1.0, K("essay") - 0.6)) }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6 + adn * 60 }}>
            {"DNA".split("").map((l, i) => (
              <span key={i} style={{ ...titre(150, C.corail), opacity: 1 - prog(t, K("dna") + 0.15 + i * 0.15, K("dna") + 1.0 + i * 0.15, ENTREE), filter: `blur(${adn * 16}px)`, translate: `0 ${-adn * (30 + i * 20)}px` }}>{l}</span>
            ))}
          </div>
          <div style={{ ...texte(36, C.nuitTexte), ...monte(t, K("dna") + 0.35, 14, 0.4) }}>was gone.</div>
        </div>
        <div style={{ position: "absolute", left: 1740 - 560, top: y + 250, width: 1120, ...monte(t, K("essay") - 0.6, 36, 0.6) }}>
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 30px 70px -20px rgba(0,0,0,.7)", outline: `4px solid ${C.corail}` }}>
            <Image src="essays-c.png" style={{ width: 1120, height: 1120 * (550 / 1900), display: "block" }} />
          </div>
        </div>
      </Camera>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150 }}>
        <div style={{ ...titre(110, C.nuitTexte), opacity: tampon, scale: String(1.5 - 0.5 * tampon), translate: `${s.x}px ${s.y}px`, background: "rgba(13,9,20,.85)", padding: "10px 40px", borderRadius: 20 }}>No charges.</div>
      </AbsoluteFill>
      <Source t={t} a={a} b={b} texte="Alleged facts. Sources: CBS (Oct. 2 and 6, 2026), Cornell Daily Sun based on New York Times records, FOX19 / Gray News (Sept. 28, 2026), AP (Oct. 14, 2026)." />
    </AbsoluteFill>
  );
};

// 4. “This isn't just an American story.” then 6% reported to police.
export const Canada: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.canada;
  const sort = prog(t, P(5) - 0.35, P(5) + 0.3, SORTIE);
  const lit = (i: number) => prog(t, K("six") - 0.15 + i * 0.07, K("six") + 0.15 + i * 0.07);
  const compteur = Math.round(6 * prog(t, K("six") - 0.15, K("six") + 0.4, (x) => x));
  return (
    <AbsoluteFill style={{ opacity: env(t, a, b, 0.3, 0.3) }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: `0 ${-sort * 380}px`, scale: String(1 - 0.45 * sort), opacity: 1 - 0.4 * sort }}>
        <Mots texte="This isn’t just an American story." t={t} debut={P(4) - 0.1} ecart={0.06} duree={0.45} style={titre(92)} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 230, top: 300, display: "grid", gridTemplateColumns: "repeat(10, 54px)", gap: 16, opacity: prog(t, P(5) - 0.2, P(5) + 0.4) }}>
        {Array.from({ length: 100 }, (_, i) => {
          const allume = i < 6 ? lit(i) : 0;
          return <div key={i} style={{ width: 54, height: 54, borderRadius: 27, background: allume > 0 ? `rgba(255,138,101,${0.25 + 0.75 * allume})` : "rgba(239,234,247,.13)", boxShadow: allume > 0.5 ? `0 0 24px ${C.corail}` : undefined, opacity: prog(t, P(5) - 0.1 + alea(i) * 0.4, P(5) + 0.2 + alea(i) * 0.4) }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 1010, top: 330, width: 780 }}>
        <div style={{ ...petit(26), ...monte(t, P(5), 14, 0.4) }}>In Canada</div>
        <div style={{ ...titre(220, C.corail), lineHeight: 1, marginTop: 10, ...monte(t, K("six") - 0.15, 26, 0.4) }}>{compteur}%</div>
        <div style={{ ...texte(40, C.nuitTexte), marginTop: 18, ...monte(t, K("six") + 0.25, 18, 0.4) }}>of sexual assaults are reported to police.</div>
        <div style={{ ...texte(30), marginTop: 22, ...monte(t, K("police") - 0.1, 12, 0.4) }}>Versus 36% of physical assaults.</div>
      </div>
      <Source t={t} a={P(5)} b={b} texte="Statistics Canada, General Social Survey 2019 (Cotter, 2021)." />
    </AbsoluteFill>
  );
};

// 5. “The evidence has an expiry date: twelve hours for some drugs, seventy-two for DNA.”
export const Delais: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.delais;
  const X0 = 520, L = 1060;
  const barre = (heures: number, debut: number, couleur: string, y: number, label: string, valeur: string) => {
    const p = prog(t, debut - 0.15, debut + 0.7);
    return (
      <div style={{ position: "absolute", left: 150, top: y, width: 1700, opacity: prog(t, debut - 0.35, debut) }}>
        <div style={{ position: "absolute", left: 0, top: 18, width: 340, ...texte(36, C.nuitTexte) }}>{label}</div>
        <div style={{ position: "absolute", left: X0 - 150, top: 0, width: (heures / 72) * L * p, height: 92, borderRadius: 16, background: couleur, boxShadow: `0 0 34px ${couleur}66` }} />
        <div style={{ position: "absolute", left: X0 - 150 + (heures / 72) * L * p + 26, top: 8, ...titre(64, couleur), whiteSpace: "nowrap", opacity: p }}>{valeur}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: env(t, a, b, 0.3, 0.3) }}>
      <div style={{ position: "absolute", left: 150, top: 120 }}>
        <Mots texte="The evidence has an expiry date." t={t} debut={P(6) - 0.1} ecart={0.06} duree={0.45} style={{ ...titre(84), justifyContent: "flex-start" }} />
      </div>
      {[0, 12, 24, 48, 72].map((h) => (
        <div key={h} style={{ position: "absolute", left: X0 + (h / 72) * L, top: 330, height: 520, borderLeft: "2px dashed rgba(239,234,247,.18)", opacity: prog(t, P(6) + 0.2, P(6) + 0.8) }}>
          <div style={{ ...texte(26), position: "absolute", top: 530, left: -30, width: 80, textAlign: "center" }}>{h} h</div>
        </div>
      ))}
      {barre(12, K("twelve"), C.corail, 400, "Some drugs", "12 h")}
      {barre(72, K("seventytwo"), C.violet, 600, "DNA", "72 h")}
      <Source t={t} a={a} b={b} texte="Sources: ASB 121 (2021); Canadian guideline, CMAJ (2025); WHO (2024)." />
    </AbsoluteFill>
  );
};

// 6. “A month later, three in four survivors have post-traumatic stress.” Zoom on the exact line of Dworkin et al.
export const Dworkin: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.dworkin;
  return <EtudeZoom t={t} a={a} b={b} nom="dworkin" surligne={K("three") - 0.2} zoom={1.75} legende="Dworkin et al., “PTSD in the Year Following Sexual Assault: A Meta-Analysis of Prospective Studies”, Trauma, Violence & Abuse, 2023" />;
};

// 7. “And no one tells them what to do, or in what order.”
const QUESTIONS = ["Hospital?", "Police?", "Kit?", "Who do I call?", "72 h?", "Report?", "Compensation?", "Lawyer?", "Support centre?", "Medication?", "Alone?", "Deadline?"];
export const Personne: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.personne;
  return (
    <AbsoluteFill style={{ opacity: env(t, a, b, 0.3, 0.25) }}>
      {QUESTIONS.map((q, i) => {
        const ang = (i / QUESTIONS.length) * Math.PI * 2 + 0.3;
        const r = 360 + alea(i) * 140;
        const d = a + 0.1 + i * 0.12;
        const tr = t > K("order") - 0.2 ? secousse(t, K("order") - 0.2 + (i % 3) * 0.05, 8, 0.7) : { x: 0, y: 0 };
        return (
          <div key={i} style={{ position: "absolute", left: 960 + Math.cos(ang) * r * 1.6 - 130 + tr.x, top: 520 + Math.sin(ang) * r - 30 + tr.y - (t - d) * 14, width: 260, textAlign: "center", ...texte(34 + (i % 3) * 6, i % 4 === 0 ? C.corail : C.nuitDoux), opacity: prog(t, d, d + 0.4) * 0.85 }}>
            {q}
          </div>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
        <Mots texte="No one tells them what to do," t={t} debut={P(8) - 0.05} ecart={0.06} duree={0.45} style={titre(76)} />
        <Mots texte="or in what order." t={t} debut={K("order") - 0.5} ecart={0.07} duree={0.45} style={titre(76, C.corail)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 8. “What if someone guided them, step by step?” The paper opens as a circle.
export const Guide: React.FC<Props> = ({ t }) => {
  const { W, H } = useFormat();
  const [a, b] = SCENES.guide;
  const rayon = prog(t, K("step") - 0.3, b + 0.05, SORTIE) * Math.hypot(W, H) * 0.62;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(prog(t, a, a + 0.25), 1 - prog(t, K("step") - 0.2, K("step") + 0.15)) }}>
        <Mots texte="What if someone guided them…" t={t} debut={P(9) - 0.1} ecart={0.07} duree={0.45} style={titre(96)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${rayon}px at 50% 50%)`, background: C.papier, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: i === 4 ? C.violet : C.filet, ...apparition(t, K("step") + i * 0.1, 0.35) }} />
          ))}
        </div>
        <div style={{ ...titre(96, C.encre), marginTop: 50, ...monte(t, K("step") - 0.05, 18, 0.4) }}>step by step?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

