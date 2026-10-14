import { ArrowLeft } from 'lucide-react'
import { Wordmark } from './Logo'
import { LangSwitch } from './ui'
import { useLang } from '../lib/i18n'
import { CONTACT, POLICY_UPDATED } from '../lib/site'

/* ───────────── Pages d'information : qui sommes-nous, confidentialité ───────────── */
// Publiées seulement quand CONTACT est renseigné (lib/site.ts).

function Page({ title, children }: { title: string; children: React.ReactNode }) {
  const { t, locale } = useLang()
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2 sm:px-5">
          <a href="#/" className="btn btn-quiet -ml-3"><ArrowLeft size={18} strokeWidth={2.25} /> <Wordmark /></a>
          <span className="sr-only">{t('Retour à Boussole', 'Back to Boussole')}</span>
          <LangSwitch className="ml-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-5 sm:pt-10">
        <h1 className="display text-[2rem] sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-2">{t('Mis à jour le', 'Updated on')} {new Date(`${POLICY_UPDATED}T12:00:00`).toLocaleDateString(locale, { dateStyle: 'long' })}</p>
        <div className="prose-boussole mt-6 space-y-6">{children}</div>
      </main>
    </div>
  )
}

function Bloc({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-2 space-y-2 text-base leading-relaxed text-ink-2">{children}</div>
    </section>
  )
}

const Mail = () => <a href={`mailto:${CONTACT}`} translate="no" className="font-bold text-north underline decoration-2 underline-offset-4">{CONTACT}</a>

export function APropos() {
  const { t, lang } = useLang()
  const fr = lang === 'fr'
  return (
    <Page title={t('Qui sommes-nous', 'About us')}>
      <Bloc title={t('Ce qu’est Boussole', 'What Boussole is')}>
        <p>{fr
          ? 'Boussole accompagne pas à pas une personne après une agression sexuelle à Montréal : qui appeler, où aller, dans quel ordre, et comment garder une trace de son récit sans qu’il quitte son téléphone. Un outil séparé aide l’équipe soignante d’un centre désigné à préparer le dossier.'
          : 'Boussole walks a person through what to do after a sexual assault in Montréal: who to call, where to go, in what order, and how to keep a record of their story without it leaving their phone. A separate tool helps the care team of a designated centre prepare the file.'}</p>
      </Bloc>
      <Bloc title={t('Où en est le projet', 'Where the project stands')}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('Bêta de test, créée à Montréal en 2026. Données fictives uniquement.', 'Test beta, created in Montréal in 2026. Fictional data only.')}</li>
          <li>{t('Les délais médicaux affichés ne sont pas encore validés par une équipe clinique.', 'The medical time frames shown have not yet been validated by a clinical team.')}</li>
          <li>{t('Boussole est un projet indépendant : les organismes cités ne l’ont ni créé, ni approuvé.', 'Boussole is an independent project: the organizations listed did not create or endorse it.')}</li>
          <li>{t('Boussole ne remplace ni le 911, ni Info-aide violence sexuelle, ni une équipe médicale.', 'Boussole does not replace 911, Info-aide violence sexuelle or a medical team.')}</li>
        </ul>
      </Bloc>
      <Bloc title={t('Ce que nous cherchons', 'What we are looking for')}>
        <p>{t('Faire relire chaque contenu par les personnes du terrain (centres désignés, CALACS, intervenantes, juristes) et former un comité aviseur qui inclut des personnes ayant vécu des violences sexuelles, rémunérées pour leur temps.', 'To have every piece of content reviewed by people in the field (designated centres, CALACS, support workers, lawyers), and to form an advisory committee that includes people with lived experience of sexual violence, paid for their time.')}</p>
      </Bloc>
      <Bloc title={t('Nos sources', 'Our sources')}>
        <p>{t('Info-aide violence sexuelle et CVASM, CIUSSS de Montréal (2026), dépliant du SPVM (mai 2026), quebec.ca, IVAC, sites officiels des organismes. Ce qu’aucune source officielle n’a confirmé porte la mention « À confirmer ».', 'Info-aide violence sexuelle and CVASM, CIUSSS de Montréal (2026), SPVM leaflet (May 2026), quebec.ca, IVAC, official websites of the organizations. Anything no official source has confirmed is marked “To be confirmed”.')}</p>
      </Bloc>
      <Bloc title={t('Nous écrire', 'Contact us')}>
        <p>{t('Organisme, soignant, juriste, ou personne concernée qui souhaite contribuer :', 'Organization, health professional, lawyer, or person with lived experience who would like to contribute:')} <Mail />.</p>
        <p className="rounded-2xl bg-warn-soft px-4 py-3 font-bold text-warn">{t('Cette adresse n’est pas un service d’aide et n’est pas lue en continu. Pour parler à quelqu’un maintenant : Info-aide violence sexuelle, +1 888 933-9007. En danger : 911.', 'This address is not a support service and is not monitored around the clock. To talk to someone now: Info-aide violence sexuelle, +1 888 933-9007. In danger: 911.')}</p>
      </Bloc>
      <p><a href="#/confidentialite" className="btn btn-soft">{t('Politique de confidentialité', 'Privacy policy')}</a></p>
    </Page>
  )
}

export function Confidentialite() {
  const { t, lang } = useLang()
  const fr = lang === 'fr'
  return (
    <Page title={t('Politique de confidentialité', 'Privacy policy')}>
      <p className="rounded-2xl bg-panel px-4 py-3 text-base leading-relaxed text-ink-2">{t('Cette politique décrit la bêta de test. Elle sera revue par un juriste avant tout lancement public.', 'This policy describes the test beta. It will be reviewed by a lawyer before any public launch.')}</p>
      <Bloc title={t('Personne responsable', 'Person in charge')}>
        <p>{t('Responsable de la protection des renseignements personnels du projet Boussole :', 'Person in charge of the protection of personal information for the Boussole project:')} <Mail />.</p>
      </Bloc>
      <Bloc title={t('Ce que Boussole conserve, et où', 'What Boussole keeps, and where')}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('Votre récit, vos réponses et votre journal : uniquement dans le navigateur de votre appareil, chiffrés avec votre mot de passe (AES-256-GCM, PBKDF2). Aucun serveur Boussole ne les reçoit.', 'Your story, your answers and your log: only in your device’s browser, encrypted with your password (AES-256-GCM, PBKDF2). No Boussole server receives them.')}</li>
          <li>{t('Votre adresse courriel sert seulement de clé pour retrouver votre espace sur cet appareil ; elle n’est envoyée nulle part.', 'Your email address is only used as a key to find your space on this device; it is never sent anywhere.')}</li>
          <li>{t('Votre choix de langue est gardé sur l’appareil, sans chiffrement : il ne dit rien de vous.', 'Your language choice is kept on the device, unencrypted: it says nothing about you.')}</li>
          <li>{t('Aucun cookie publicitaire, aucun outil de mesure d’audience, aucune revente.', 'No advertising cookies, no audience measurement, no resale.')}</li>
        </ul>
      </Bloc>
      <Bloc title={t('Ce qui sort de votre appareil', 'What leaves your device')}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t('La carte charge ses images depuis OpenStreetMap, qui voit votre adresse IP, comme pour tout site.', 'The map loads its images from OpenStreetMap, which sees your IP address, as with any website.')}</li>
          <li>{t('Le site est hébergé par Vercel, qui voit votre adresse IP et la page demandée. En production : hébergement au Canada.', 'The site is hosted by Vercel, which sees your IP address and the page requested. In production: hosting in Canada.')}</li>
          <li>{t('« Itinéraire Google Maps » et « Quitter » ouvrent des pages de Google, seulement si vous touchez ces boutons.', '“Directions (Google Maps)” and “Exit” open Google pages, only if you tap those buttons.')}</li>
          <li>{fr
            ? 'L’envoi du dossier à Rebâtir est simulé : rien ne part. Dans l’outil soignant, les notes sont pseudonymisées avant tout traitement par l’IA ; dans cette démonstration en ligne, aucune IA n’est branchée.'
            : 'Sending the file to Rebâtir is simulated: nothing is sent. In the care-team tool, notes are pseudonymized before any AI processing; in this online demo, no AI is connected.'}</li>
        </ul>
      </Bloc>
      <Bloc title={t('Combien de temps', 'How long')}>
        <p>{t('Vos données restent sur votre appareil jusqu’à ce que vous les effaciez (« Tout effacer », dans Vie privée) ou que vous vidiez les données de votre navigateur.', 'Your data stays on your device until you erase it (“Erase everything”, in Privacy) or clear your browser data.')}</p>
      </Bloc>
      <Bloc title={t('Vos droits', 'Your rights')}>
        <p>{t('Vous gardez le contrôle complet de vos données sur l’appareil : les consulter, les corriger, les effacer. Pour toute question ou plainte, écrivez-nous. Vous pouvez aussi vous adresser à la Commission d’accès à l’information du Québec.', 'You keep full control of your data on the device: view it, correct it, erase it. For any question or complaint, write to us. You can also contact the Commission d’accès à l’information du Québec.')}</p>
      </Bloc>
    </Page>
  )
}
