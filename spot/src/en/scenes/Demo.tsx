// Act 2 (English): Boussole is revealed, then the journey through the real app (HD captures, cursor, zooms).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Cle, env, K, prog, RESSORT, SCENES, tw, VA_ET_VIENT } from "../temps";
import { Anneau, B, Camera, Capture, Curseur, Fenetre, Icone, Logo, Mots, Pastille, apparition, monte } from "../ui";

type Props = { t: number };
type Pt = { x: number; y: number };

// ---------------------------------------------------------------------------
// Logo : « Voici Boussole : l'application qui guide les victimes de violences sexuelles. »
// ---------------------------------------------------------------------------
export const LogoScene: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.logo;
  const o = env(t, a, b, 0.2, 0.4);
  const pLogo = prog(t, K("boussole") - 0.45, K("boussole") + 0.5, RESSORT);
  const aiguille = tw(t, K("boussole") - 0.4, K("boussole") + 1.4, -140, 0, RESSORT);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ scale: String(pLogo) }}>
          <Logo taille={190} lueur={1.6 - pLogo} rotation={aiguille} />
        </div>
        <div style={{ fontFamily: F.texte, fontWeight: 900, fontSize: 170, color: C.encre, letterSpacing: "-0.035em", clipPath: `inset(-10% ${(1 - prog(t, K("boussole") - 0.1, K("boussole") + 0.6)) * 100}% -10% 0)` }}>Boussole</div>
      </div>
      <Mots
        texte="The app that guides survivors of sexual violence."
        t={t}
        debut={K("boussole") + 0.55}
        ecart={0.07}
        style={{ fontFamily: F.texte, fontWeight: 700, fontSize: 54, color: C.encre2, marginTop: 50, maxWidth: 1500 }}
        motStyle={(_, m) => (m === "guides" ? { color: C.violet } : undefined)}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Mise en page commune : le téléphone à gauche, la colonne de texte à droite.
// ---------------------------------------------------------------------------
const TEL = { x: 352, y: 90, h: 900 };
const S_TEL = TEL.h / 2532;
const CENTRE_TEL: Pt = { x: TEL.x + (1170 * S_TEL) / 2, y: TEL.y + TEL.h / 2 };
const VUE: Cle = { t: 0, x: CENTRE_TEL.x, y: CENTRE_TEL.y, z: 1 };

/** Centre (monde) d'une boîte de capture du téléphone, ou d'une boîte donnée en pixels d'image. */
function centre(cap: string, cle: string | { x: number; y: number; w: number; h: number }) {
  const b = typeof cle === "string" ? B[cap][cle] : cle;
  return { x: TEL.x + (b.x + b.w / 2) * S_TEL, y: TEL.y + (b.y + b.h / 2) * S_TEL, w: b.w * S_TEL, h: b.h * S_TEL, gx: TEL.x + b.x * S_TEL, gy: TEL.y + b.y * S_TEL };
}
const vise = (t: number, cap: string, cle: string | { x: number; y: number; w: number; h: number }, z: number): Cle => {
  const c = centre(cap, cle);
  return { t, x: c.x, y: c.y, z };
};

/** Curseur qui va d'un point à un autre puis clique. */
const CurseurVers: React.FC<{ t: number; de: Pt; vers: Pt; depart: number; clic: number; fin?: number }> = ({ t, de, vers, depart, clic, fin }) => {
  if (t < depart - 0.3 || (fin !== undefined && t > fin + 0.3)) return null;
  const p = VA_ET_VIENT(Math.min(1, Math.max(0, (t - depart) / Math.max(0.01, clic - 0.12 - depart))));
  const o = Math.min(prog(t, depart - 0.3, depart), fin !== undefined ? 1 - prog(t, fin, fin + 0.3) : 1);
  return <Curseur x={de.x + (vers.x - de.x) * p} y={de.y + (vers.y - de.y) * p} taille={34} t={t} clic={clic} opacite={o} />;
};

/** Colonne de droite : surtitre, titre, texte, puis pastilles. */
const Colonne: React.FC<{ t: number; a: number; b: number; surtitre: string; couleur?: string; titre: React.ReactNode; texte?: React.ReactNode; texteDebut?: number; children?: React.ReactNode }> = ({ t, a, b, surtitre, couleur = C.violet, titre, texte, texteDebut, children }) => (
  <div style={{ position: "absolute", left: 980, top: 0, width: 940, height: 1080, padding: "250px 100px 0 60px", background: `linear-gradient(90deg, rgba(255,249,243,0) 0px, ${C.papier} 60px)`, opacity: env(t, a, b, 0.4, 0.3) }}>
    <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: couleur, ...monte(t, a + 0.1, 14) }}>{surtitre}</div>
    <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 64, lineHeight: 1.08, letterSpacing: "-0.02em", color: C.encre, marginTop: 16, ...monte(t, a + 0.2, 24) }}>{titre}</div>
    {texte ? <div style={{ fontFamily: F.texte, fontWeight: 600, fontSize: 34, lineHeight: 1.4, color: C.encre2, marginTop: 24, ...monte(t, texteDebut ?? a + 0.5, 18) }}>{texte}</div> : null}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18, marginTop: 34 }}>{children}</div>
  </div>
);

/** Téléphone dans le monde de la caméra, avec ses écrans successifs et ce qu'on dessine par-dessus. */
const ScenePhone: React.FC<{ t: number; nom: keyof typeof SCENES; ecrans: { nom: string; de: number }[]; cles: Cle[]; dessus?: React.ReactNode; ecranDessus?: React.ReactNode; colonne: React.ReactNode }> = ({ t, nom, ecrans, cles, dessus, ecranDessus, colonne }) => {
  const [a, b] = SCENES[nom];
  const entree = prog(t, a, a + 0.6);
  const sortie = prog(t, b - 0.35, b);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: Math.min(entree, 1 - sortie), translate: `0 ${(1 - entree) * 40}px` }}>
        <Camera t={t} cles={[{ ...VUE, t: a }, ...cles]} ancre={CENTRE_TEL}>
          <div style={{ position: "absolute", left: TEL.x - 16, top: TEL.y - 16, width: 1170 * S_TEL + 32, height: TEL.h + 32, borderRadius: 64, background: "#17111F", boxShadow: "0 2px 6px rgba(45,36,64,.12), 0 60px 120px -40px rgba(45,36,64,.6)" }} />
          <div style={{ position: "absolute", left: TEL.x, top: TEL.y, width: 1170 * S_TEL, height: TEL.h, borderRadius: 50, overflow: "hidden", background: C.papier }}>
            {ecrans.map((e, i) => (i > 0 && t < e.de ? null : <Capture key={e.nom + i} nom={e.nom} s={S_TEL} style={{ opacity: i === 0 ? 1 : prog(t, e.de, e.de + 0.35) }} />))}
            {ecranDessus}
          </div>
          {dessus}
        </Camera>
      </AbsoluteFill>
      {colonne}
    </AbsoluteFill>
  );
};

/** Anneau autour d'une boîte de capture (coordonnées monde). */
const AnneauCap: React.FC<{ t: number; cap: string; cle: string | { x: number; y: number; w: number; h: number }; debut: number; fin?: number; couleur?: string }> = ({ t, cap, cle, debut, fin, couleur }) => {
  const c = centre(cap, cle);
  return <Anneau x={c.gx} y={c.gy} w={c.w} h={c.h} t={t} debut={debut} fin={fin} couleur={couleur} epaisseur={3} marge={5} rayon={12} />;
};

// ---------------------------------------------------------------------------
// “Help comes first: a support line and nine-one-one, no account needed.”
// ---------------------------------------------------------------------------
export const Arrivee: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.arrivee;
  const bas = { x: 48, y: 2280, w: 1074, h: 228 };
  const cles = [
    { ...VUE, t: K("support") - 0.8 },
    vise(K("support") - 0.1, "arrivee", bas, 1.85),
    vise(K("account") - 0.5, "arrivee", bas, 1.85),
    { ...VUE, t: K("account") + 0.2 },
  ];
  return (
    <ScenePhone
      t={t}
      nom="arrivee"
      ecrans={[{ nom: "arrivee", de: a }]}
      cles={cles}
      dessus={
        <>
          <AnneauCap t={t} cap="arrivee" cle="ecoute" debut={K("support") - 0.05} fin={K("account")} couleur={C.corailEncre} />
          <AnneauCap t={t} cap="arrivee" cle="danger" debut={K("nine") - 0.1} fin={K("account")} couleur={C.corailEncre} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="First screen" titre="Help comes first" texte="Quebec’s 24/7 support line, and 911 in an emergency." texteDebut={K("support") - 0.2}>
          <div style={apparition(t, K("account") - 0.3)}>
            <Pastille icone="telephone" texte="No account needed" couleur={C.sauge} fond={C.saugePale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// “One tap on Exit, and it's gone. Just a weather page.”
// ---------------------------------------------------------------------------
export const Quitter: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.quitter;
  const q = centre("accueil", "quitter");
  const meteo = prog(t, K("gone") - 0.25, K("gone") + 0.3);
  const cles = [
    { ...VUE, t: a + 0.2 },
    vise(K("exit") - 0.2, "accueil", "quitter", 2.0),
    vise(K("gone") - 0.3, "accueil", "quitter", 2.0),
    { ...VUE, t: K("gone") + 0.4, z: 1.05 },
  ];
  return (
    <ScenePhone
      t={t}
      nom="quitter"
      ecrans={[{ nom: "accueil", de: a }]}
      cles={cles}
      ecranDessus={
        <div style={{ position: "absolute", inset: 0, background: C.blanc, opacity: meteo, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 70, gap: 30 }}>
          <div style={{ width: 340, height: 54, borderRadius: 27, border: `2px solid ${C.filet}`, display: "flex", alignItems: "center", gap: 12, padding: "0 20px", fontFamily: F.texte, fontWeight: 600, fontSize: 22, color: C.encre2 }}>
            <Icone nom="recherche" taille={22} couleur={C.encre3} /> weather Montreal
          </div>
          <Icone nom="soleil" taille={120} couleur="#E8A33A" trait={1.6} style={{ marginTop: 60 }} />
          <div style={{ fontFamily: F.texte, fontWeight: 700, fontSize: 30, color: C.encre2 }}>Weather · Montreal</div>
        </div>
      }
      dessus={<CurseurVers t={t} de={{ x: 900, y: 760 }} vers={{ x: q.x - 10, y: q.y + 4 }} depart={K("exit") - 0.9} clic={K("exit") + 0.05} fin={K("gone") + 0.2} />}
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Safety" couleur={C.corailEncre} titre="One tap on “Exit”, and it’s gone" texte="On every screen. The page is replaced by a plain weather search." texteDebut={K("gone") - 0.2}>
          <div style={apparition(t, K("weather") - 0.25)}>
            <Pastille icone="bouclier" texte="Neutral page, no trace" couleur={C.violet} fond={C.violetPale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// “Then the steps, one at a time, each with its deadline and its source.”
// ---------------------------------------------------------------------------
export const Etapes: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.etapes;
  const suiv = centre("etape-1", "suivant");
  const changement = K("steps") + 0.45;
  const cles = [
    { ...VUE, t: K("deadline") - 0.7 },
    vise(K("deadline") - 0.05, "etape-4", "delai", 1.7),
    vise(K("source") - 0.4, "etape-4", "delai", 1.7),
    vise(K("source") + 0.15, "etape-4", "source", 1.7),
  ];
  return (
    <ScenePhone
      t={t}
      nom="etapes"
      ecrans={[{ nom: "etape-1", de: a }, { nom: "etape-4", de: changement }]}
      cles={cles}
      dessus={
        <>
          <CurseurVers t={t} de={{ x: 860, y: 700 }} vers={{ x: suiv.x, y: suiv.y }} depart={a + 0.1} clic={changement - 0.1} fin={changement + 0.4} />
          <AnneauCap t={t} cap="etape-4" cle="delai" debut={K("deadline") - 0.05} couleur={C.ambre} />
          <AnneauCap t={t} cap="etape-4" cle="source" debut={K("source") - 0.05} couleur={C.violet} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="The steps" titre="One at a time, in order" texte="Each step says what to do, by when, and where the information comes from." texteDebut={K("deadline") - 0.3}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={apparition(t, K("deadline") - 0.1)}><Pastille icone="horloge" texte="Deadlines" couleur={C.ambre} fond={C.ambrePale} taille={28} /></div>
            <div style={apparition(t, K("source") - 0.1)}><Pastille icone="livre" texte="Official sources" couleur={C.violet} fond={C.violetPale} taille={28} /></div>
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// “Their story, written once, and encrypted on their phone.”
// ---------------------------------------------------------------------------
export const Recit: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.recit;
  const cles = [
    { ...VUE, t: K("story") - 0.4 },
    vise(K("story") + 0.3, "recit-souvenirs", "champ", 1.55),
    vise(b, "recit-souvenirs", "champ", 1.6),
  ];
  return (
    <ScenePhone
      t={t}
      nom="recit"
      ecrans={[{ nom: "recit-souvenirs", de: a }]}
      cles={cles}
      dessus={<AnneauCap t={t} cap="recit-souvenirs" cle="champ" debut={K("once") - 0.1} />}
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Their story" titre="Written once" texte="One question at a time. “I don’t know” is always an answer." texteDebut={K("once") - 0.2}>
          <div style={apparition(t, K("encrypted") - 0.2)}>
            <Pastille icone="verrou" texte="Encrypted on this phone" couleur={C.violet} fond={C.violetPale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// “Where to go in Montreal, and a file ready for a lawyer, only if they choose.”
// ---------------------------------------------------------------------------
const LEGENDE = { x: 48, y: 1788, w: 1044, h: 240 };
export const Carte: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.carte;
  const versDossier = K("lawyer2") - 0.5;
  const cons = centre("dossier-consent", "consentement");
  const cles = [
    { ...VUE, t: a + 0.2 },
    vise(K("montreal") + 0.2, "carte", "carte", 1.4),
    vise(versDossier - 0.15, "carte", "carte", 1.4),
    { ...VUE, t: versDossier + 0.3 },
    vise(K("choose") - 0.1, "dossier-consent", { x: 108, y: 1491, w: 954, h: 312 }, 1.6),
    vise(b, "dossier-consent", { x: 108, y: 1491, w: 954, h: 312 }, 1.6),
  ];
  return (
    <ScenePhone
      t={t}
      nom="carte"
      ecrans={[{ nom: "carte", de: a }, { nom: "dossier-consent", de: versDossier }, { nom: "dossier-pret", de: K("choose") + 0.1 }]}
      cles={cles}
      dessus={
        <>
          <AnneauCap t={t} cap="carte" cle={LEGENDE} debut={K("montreal") + 0.1} fin={versDossier - 0.1} couleur={C.ciel} />
          <CurseurVers t={t} de={{ x: 840, y: 900 }} vers={{ x: cons.gx + 40, y: cons.y - 10 }} depart={versDossier + 0.3} clic={K("choose")} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Where to go, and their rights" couleur={C.ciel} titre="The right places, and a file if they want one" texte="Verified addresses and hours. Nothing is sent without double consent." texteDebut={K("montreal") - 0.1}>
          <div style={apparition(t, K("choose") - 0.2)}>
            <Pastille icone="balance" texte="Only if they choose" couleur={C.ambre} fond={C.ambrePale} taille={28} />
          </div>
          <div style={{ ...apparition(t, K("choose") + 0.3), fontFamily: F.texte, fontWeight: 700, fontSize: 22, color: C.encre3 }}>Test version: sending is simulated.</div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// “For nurses, every sample is sorted by deadline. Nothing gets lost on the first night.”
// ---------------------------------------------------------------------------
const FEN = { x: 80, y: 170, l: 1200 };
const S_FEN = FEN.l / 2880;
const BARRE = Math.round(FEN.l * 0.026);
const fenPt = (x: number, y: number) => ({ x: FEN.x + x * S_FEN, y: FEN.y + BARRE + y * S_FEN });
export const Soignant: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.soignant;
  const centreFen = fenPt(1440, 900);
  const liste = fenPt(1150, 1250);
  // Second move: onto the deadline badges ("Urgent · 18 h"), everything on screen in English.
  const versDelais = (K("sorted") + K("night")) / 2;
  const delais = fenPt(2250, 1150);
  const cles = [
    { t: a, x: centreFen.x, y: centreFen.y, z: 1 },
    { t: K("sorted") - 0.5, x: centreFen.x, y: centreFen.y, z: 1 },
    { t: K("sorted") + 0.3, x: liste.x, y: liste.y, z: 1.7 },
    { t: versDelais - 0.1, x: liste.x, y: liste.y + 30, z: 1.7 },
    { t: versDelais + 0.5, x: delais.x, y: delais.y, z: 1.6 },
    { t: b, x: delais.x, y: delais.y + 20, z: 1.6 },
  ];
  const entree = prog(t, a, a + 0.4);
  const sortie = prog(t, b - 0.3, b);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: Math.min(entree, 1 - sortie) }}>
        <Camera t={t} cles={cles} ancre={{ x: FEN.x + FEN.l / 2, y: 540 }}>
          <Fenetre largeur={FEN.l} hauteur={1800 * S_FEN} style={{ left: FEN.x, top: FEN.y }}>
            <Capture nom="soignant-prelevements" s={S_FEN} />
          </Fenetre>
        </Camera>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 1290, top: 0, width: 630, height: 1080, padding: "250px 60px 0 60px", background: `linear-gradient(90deg, rgba(255,249,243,0) 0px, ${C.papier} 60px)`, opacity: env(t, a, b, 0.35, 0.3) }}>
        <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ciel, ...monte(t, a + 0.1, 14, 0.4) }}>For nurses</div>
        <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 58, lineHeight: 1.08, color: C.encre, marginTop: 16, ...monte(t, a + 0.2, 22, 0.4) }}>The first night, nothing lost</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, marginTop: 34 }}>
          <div style={apparition(t, K("sorted") - 0.2)}><Pastille icone="horloge" texte="Samples sorted by deadline" couleur={C.ciel} fond={C.cielPale} taille={26} /></div>
          <div style={apparition(t, versDelais + 0.2)}><Pastille icone="coche" texte="Rules engine, no AI" couleur={C.sauge} fond={C.saugePale} taille={26} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
