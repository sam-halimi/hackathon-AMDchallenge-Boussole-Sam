// Acte 2 : Boussole se dévoile, puis le parcours dans l'application réelle (captures HD, curseur, zooms).
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../theme";
import { Cle, env, K, P, prog, RESSORT, SCENES, tw, VA_ET_VIENT } from "../temps";
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
        texte="L’application qui guide les victimes de violences sexuelles."
        t={t}
        debut={K("boussole") + 0.7}
        ecart={0.07}
        style={{ fontFamily: F.texte, fontWeight: 700, fontSize: 54, color: C.encre2, marginTop: 50, maxWidth: 1500 }}
        motStyle={(_, m) => (m === "guide" ? { color: C.violet } : undefined)}
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
// « Dès le premier écran, l'aide est là : la ligne d'écoute, et le 911. Pas besoin de créer un compte. »
// ---------------------------------------------------------------------------
export const Arrivee: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.arrivee;
  const cles = [
    { ...VUE, t: K("ecoute") - 1.1 },
    vise(K("ecoute") - 0.2, "arrivee", { x: 48, y: 2280, w: 1074, h: 228 }, 1.85),
    vise(K("neuf_un_un") + 0.9, "arrivee", { x: 48, y: 2280, w: 1074, h: 228 }, 1.85),
    { ...VUE, t: P(16) + 0.4 },
  ];
  return (
    <ScenePhone
      t={t}
      nom="arrivee"
      ecrans={[{ nom: "arrivee", de: a }]}
      cles={cles}
      dessus={
        <>
          <AnneauCap t={t} cap="arrivee" cle="ecoute" debut={K("ecoute") - 0.1} fin={P(16)} couleur={C.corailEncre} />
          <AnneauCap t={t} cap="arrivee" cle="danger" debut={K("neuf_un_un") - 0.15} fin={P(16)} couleur={C.corailEncre} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Premier écran" titre="L’aide, avant toute chose" texte="La ligne d’écoute Info-aide, 24 h sur 24, et le 911 en cas de danger." texteDebut={K("ecoute") - 0.3}>
          <div style={apparition(t, K("compte") - 0.3)}>
            <Pastille icone="telephone" texte="Sans créer de compte" couleur={C.sauge} fond={C.saugePale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « Un bouton « Quitter » ferme tout, en un geste, vers une simple page météo. »
// ---------------------------------------------------------------------------
export const Quitter: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.quitter;
  const q = centre("accueil", "quitter");
  const meteo = prog(t, K("geste") - 0.2, K("geste") + 0.5);
  const cles = [
    { ...VUE, t: K("quitter") - 1.2 },
    vise(K("quitter") - 0.35, "accueil", "quitter", 2.0),
    vise(K("geste") - 0.4, "accueil", "quitter", 2.0),
    { ...VUE, t: K("geste") + 0.6, z: 1.05 },
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
            <Icone nom="recherche" taille={22} couleur={C.encre3} /> météo Montréal
          </div>
          <Icone nom="soleil" taille={120} couleur="#E8A33A" trait={1.6} style={{ marginTop: 60 }} />
          <div style={{ fontFamily: F.texte, fontWeight: 700, fontSize: 30, color: C.encre2 }}>Météo · Montréal</div>
        </div>
      }
      dessus={<CurseurVers t={t} de={{ x: 900, y: 760 }} vers={{ x: q.x - 10, y: q.y + 4 }} depart={K("quitter") - 1.3} clic={K("quitter")} fin={K("geste") + 0.2} />}
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Sécurité" couleur={C.corailEncre} titre={<>« Quitter » ferme tout, en un geste</>} texte="Sur chaque écran. La page laisse place à une simple recherche météo." texteDebut={K("geste") - 0.4}>
          <div style={apparition(t, K("meteo") - 0.3)}>
            <Pastille icone="bouclier" texte="Page neutre, sans trace" couleur={C.violet} fond={C.violetPale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « Ensuite, les étapes. Une à la fois, avec leurs délais, et leurs sources. »
// ---------------------------------------------------------------------------
export const Etapes: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.etapes;
  const suiv = centre("etape-1", "suivant");
  const changement = K("une_a_la_fois") + 0.05;
  const cles = [
    { ...VUE, t: K("delais") - 0.9 },
    vise(K("delais") - 0.1, "etape-4", "delai", 1.75),
    vise(K("sources") - 0.5, "etape-4", "delai", 1.75),
    vise(K("sources") + 0.2, "etape-4", "source", 1.75),
  ];
  return (
    <ScenePhone
      t={t}
      nom="etapes"
      ecrans={[{ nom: "etape-1", de: a }, { nom: "etape-4", de: changement }]}
      cles={cles}
      dessus={
        <>
          <CurseurVers t={t} de={{ x: 860, y: 700 }} vers={{ x: suiv.x, y: suiv.y }} depart={P(18) + 0.3} clic={changement - 0.1} fin={changement + 0.5} />
          <AnneauCap t={t} cap="etape-4" cle="delai" debut={K("delais") - 0.05} couleur={C.ambre} />
          <AnneauCap t={t} cap="etape-4" cle="source" debut={K("sources") - 0.05} couleur={C.violet} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Les étapes" titre="Une à la fois, dans l’ordre" texte="Chaque étape dit quoi faire, dans quel délai, et d’où vient l’information." texteDebut={K("delais") - 0.4}>
          <div style={{ display: "flex", gap: 14 }}>
            <div style={apparition(t, K("delais") - 0.1)}><Pastille icone="horloge" texte="Délais" couleur={C.ambre} fond={C.ambrePale} taille={28} /></div>
            <div style={apparition(t, K("sources") - 0.1)}><Pastille icone="livre" texte="Sources officielles" couleur={C.violet} fond={C.violetPale} taille={28} /></div>
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « Son récit, elle l'écrit une seule fois. Il reste chiffré, sur son téléphone. « Je ne sais pas » est toujours une réponse. »
// ---------------------------------------------------------------------------
export const Recit: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.recit;
  const jsp = centre("recit-substance", "jsp");
  const versSubstance = P(20) - 0.25;
  const cles = [
    { ...VUE, t: K("recit") - 0.6 },
    vise(K("recit") + 0.4, "recit-souvenirs", "champ", 1.55),
    vise(K("chiffre") - 0.6, "recit-souvenirs", "champ", 1.55),
    { ...VUE, t: versSubstance + 0.1 },
    vise(K("jsp") - 0.2, "recit-substance", "jsp", 1.8),
    vise(b, "recit-substance", "jsp", 1.8),
  ];
  return (
    <ScenePhone
      t={t}
      nom="recit"
      ecrans={[{ nom: "recit-souvenirs", de: a }, { nom: "recit-substance", de: versSubstance }, { nom: "recit-substance-ok", de: K("jsp") + 0.05 }]}
      cles={cles}
      dessus={
        <>
          <AnneauCap t={t} cap="recit-souvenirs" cle="champ" debut={K("recit") + 0.1} fin={versSubstance - 0.3} />
          <CurseurVers t={t} de={{ x: 820, y: 860 }} vers={{ x: jsp.x - 60, y: jsp.y + 6 }} depart={versSubstance + 0.3} clic={K("jsp")} />
        </>
      }
      colonne={
        <Colonne
          t={t}
          a={a}
          b={b}
          surtitre="Son récit"
          titre="Écrit une seule fois"
          texte={
            <>
              <div>Une question à la fois. Le récit reste chiffré, sur son téléphone.</div>
              <div style={{ marginTop: 22, color: C.encre, fontWeight: 800, ...monte(t, P(20) - 0.1, 14) }}>« Je ne sais pas » est toujours une réponse.</div>
            </>
          }
          texteDebut={K("une_seule") - 0.2}
        >
          <div style={apparition(t, K("chiffre") - 0.25)}>
            <Pastille icone="verrou" texte="Chiffré sur ce téléphone" couleur={C.violet} fond={C.violetPale} taille={30} />
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « La carte montre où aller à Montréal : examen médical, soutien, aide juridique. »
// ---------------------------------------------------------------------------
const LEGENDE = {
  examens: { x: 24, y: 1791, w: 546, h: 99 },
  soutien: { x: 54, y: 1923, w: 576, h: 96 },
  juridique: { x: 666, y: 1923, w: 324, h: 96 },
};
export const Carte: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.carte;
  const cles = [
    { ...VUE, t: K("carte") - 0.3 },
    vise(K("carte") + 0.9, "carte", "carte", 1.45),
    vise(K("examen") - 0.6, "carte", "carte", 1.45),
    vise(K("examen") + 0.1, "carte", { x: 24, y: 1791, w: 966, h: 228 }, 1.6),
  ];
  return (
    <ScenePhone
      t={t}
      nom="carte"
      ecrans={[{ nom: "carte", de: a }]}
      cles={cles}
      dessus={
        <>
          <AnneauCap t={t} cap="carte" cle={LEGENDE.examens} debut={K("examen") - 0.05} couleur={C.ciel} />
          <AnneauCap t={t} cap="carte" cle={LEGENDE.soutien} debut={K("soutien") - 0.05} couleur={C.sauge} />
          <AnneauCap t={t} cap="carte" cle={LEGENDE.juridique} debut={K("juridique") - 0.05} couleur={C.ambre} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Où aller" titre="Les bons lieux, à Montréal" texte="Adresses, horaires et téléphones vérifiés, avec la date de vérification." texteDebut={K("carte") + 0.3}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={apparition(t, K("examen") - 0.1)}><Pastille texte="Examen médical" couleur={C.ciel} fond={C.cielPale} taille={28} /></div>
            <div style={apparition(t, K("soutien") - 0.1)}><Pastille texte="Soutien" couleur={C.sauge} fond={C.saugePale} taille={28} /></div>
            <div style={apparition(t, K("juridique") - 0.1)}><Pastille texte="Aide juridique" couleur={C.ambre} fond={C.ambrePale} taille={28} /></div>
          </div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « Si elle le décide, son dossier est prêt pour un service juridique. Rien ne part sans son accord, et elle choisit quand être rappelée. »
// ---------------------------------------------------------------------------
export const Dossier: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.dossier;
  const versConsent = K("service_juridique") - 0.2;
  const versRappel = K("rappelee") - 1.0;
  const cons = centre("dossier-consent", "consentement");
  const cles = [
    { ...VUE, t: versConsent + 0.2 },
    vise(K("accord") - 0.3, "dossier-consent", { x: 108, y: 1335, w: 954, h: 402 }, 1.6),
    vise(versRappel - 0.2, "dossier-consent", { x: 108, y: 1335, w: 954, h: 402 }, 1.6),
    { ...VUE, t: versRappel + 0.4 },
    vise(K("rappelee") + 0.3, "rappel-pret", "confirmer", 1.5),
  ];
  return (
    <ScenePhone
      t={t}
      nom="dossier"
      ecrans={[{ nom: "dossier", de: a }, { nom: "dossier-consent", de: versConsent }, { nom: "dossier-pret", de: K("accord") + 0.05 }, { nom: "rappel-pret", de: versRappel }]}
      cles={cles}
      dessus={
        <>
          <CurseurVers t={t} de={{ x: 840, y: 900 }} vers={{ x: cons.gx + 40, y: cons.y - 10 }} depart={versConsent + 0.3} clic={K("accord")} fin={versRappel - 0.3} />
          <AnneauCap t={t} cap="rappel-pret" cle="confirmer" debut={K("rappelee") + 0.1} couleur={C.violet} />
        </>
      }
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Ses droits" couleur={C.ambre} titre="Un dossier prêt, si elle le décide" texte="Pour un service juridique comme Rebâtir. Rien ne part sans son double accord." texteDebut={K("service_juridique") - 0.4}>
          <div style={apparition(t, K("rappelee") - 0.4)}>
            <Pastille icone="telephone" texte="Elle choisit quand être rappelée" couleur={C.violet} fond={C.violetPale} taille={28} />
          </div>
          <div style={{ ...apparition(t, K("rappelee") + 0.3), fontFamily: F.texte, fontWeight: 700, fontSize: 22, color: C.encre3 }}>Version de test : envoi simulé.</div>
        </Colonne>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// « Pour les soignants, chaque prélèvement est classé selon son délai. Chaque note est horodatée. Rien ne se perd, la première nuit. »
// ---------------------------------------------------------------------------
const FEN = { x: 80, y: 170, l: 1200 };
const S_FEN = FEN.l / 2880;
const BARRE = Math.round(FEN.l * 0.026);
const fenPt = (x: number, y: number) => ({ x: FEN.x + x * S_FEN, y: FEN.y + BARRE + y * S_FEN });
export const Soignant: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.soignant;
  const centreFen = fenPt(1440, 900);
  const versChrono = K("note") - 0.35;
  const liste = fenPt(1150, 1250);
  const chrono = fenPt(1950, 1250);
  const src = B["soignant-chronologie"].source;
  const cles = [
    { t: a, x: centreFen.x, y: centreFen.y, z: 1 },
    { t: K("prelevement") - 0.6, x: centreFen.x, y: centreFen.y, z: 1 },
    { t: K("prelevement") + 0.4, x: liste.x, y: liste.y, z: 1.75 },
    { t: versChrono - 0.2, x: liste.x, y: liste.y + 40, z: 1.75 },
    { t: versChrono + 0.6, x: chrono.x, y: chrono.y, z: 1.6 },
    { t: b, x: chrono.x, y: chrono.y + 30, z: 1.6 },
  ];
  const entree = prog(t, a, a + 0.6);
  const sortie = prog(t, b - 0.35, b);
  const s0 = fenPt(src.x, src.y);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: Math.min(entree, 1 - sortie) }}>
        <Camera t={t} cles={cles} ancre={{ x: FEN.x + FEN.l / 2, y: 540 }}>
          <Fenetre largeur={FEN.l} hauteur={1800 * S_FEN} style={{ left: FEN.x, top: FEN.y }}>
            <Capture nom="soignant-prelevements" s={S_FEN} />
            {t >= versChrono ? <Capture nom="soignant-chronologie" s={S_FEN} style={{ opacity: prog(t, versChrono, versChrono + 0.35) }} /> : null}
          </Fenetre>
          <Anneau x={s0.x} y={s0.y} w={src.w * S_FEN} h={src.h * S_FEN} t={t} debut={K("horodatee") - 0.1} couleur={C.violet} epaisseur={2.5} marge={4} rayon={8} />
        </Camera>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 1290, top: 0, width: 630, height: 1080, padding: "250px 60px 0 60px", background: `linear-gradient(90deg, rgba(255,249,243,0) 0px, ${C.papier} 60px)`, opacity: env(t, a, b, 0.4, 0.3) }}>
        <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ciel, ...monte(t, a + 0.1, 14) }}>Pour les soignants</div>
        <div style={{ fontFamily: F.texte, fontWeight: 800, fontSize: 58, lineHeight: 1.08, color: C.encre, marginTop: 16, ...monte(t, a + 0.2, 24) }}>La première nuit, sans rien perdre</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, marginTop: 34 }}>
          <div style={apparition(t, K("delai") - 0.2)}><Pastille icone="horloge" texte="Prélèvements classés par délai" couleur={C.ciel} fond={C.cielPale} taille={26} /></div>
          <div style={apparition(t, K("horodatee") - 0.2)}><Pastille icone="coche" texte="Chaque note horodatée" couleur={C.violet} fond={C.violetPale} taille={26} /></div>
          <div style={apparition(t, K("premiere_nuit") - 0.4)}><Pastille icone="bouclier" texte="Journal infalsifiable" couleur={C.sauge} fond={C.saugePale} taille={26} /></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// « L'application est gratuite. Elle fonctionne même hors ligne. »
// ---------------------------------------------------------------------------
export const HorsLigne: React.FC<Props> = ({ t }) => {
  const [a, b] = SCENES.horsLigne;
  return (
    <ScenePhone
      t={t}
      nom="horsLigne"
      ecrans={[{ nom: "accueil-hors-ligne", de: a }]}
      cles={[{ ...VUE, t: K("hors_ligne") - 0.7 }, vise(K("hors_ligne") + 0.3, "accueil-hors-ligne", { x: 0, y: 0, w: 1170, h: 420 }, 1.6)]}
      colonne={
        <Colonne t={t} a={a} b={b} surtitre="Pour tout le monde" couleur={C.sauge} titre="Gratuite. Même hors ligne.">
          <div style={apparition(t, K("gratuite") - 0.3)}><Pastille icone="coeur" texte="Gratuite, toujours" couleur={C.sauge} fond={C.saugePale} taille={30} /></div>
          <div style={apparition(t, K("hors_ligne") - 0.3)}><Pastille icone="horsLigne" texte="Fonctionne sans réseau" couleur={C.violet} fond={C.violetPale} taille={30} /></div>
        </Colonne>
      }
    />
  );
};
