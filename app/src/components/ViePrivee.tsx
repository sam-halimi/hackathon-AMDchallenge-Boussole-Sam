import { AlertTriangle, EyeOff, Fingerprint, Lock, ServerOff, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import { Wipe } from './Recit'
import { LangSwitch } from './ui'
import { useLang } from '../lib/i18n'

/* ───────────── Vie privée ───────────── */

const PROMISES = [
  { icon: ServerOff, t: ['Vos données restent sur votre appareil', 'Your data stays on your device'], d: ['En bêta, la fiche est stockée uniquement dans votre navigateur. Aucun serveur Boussole ne la reçoit.', 'In this beta, your file is stored only in your browser. No Boussole server receives it.'] },
  { icon: Fingerprint, t: ['Chiffrement avec votre mot de passe', 'Encryption with your password'], d: ['AES-256-GCM, clé dérivée de votre mot de passe par PBKDF2 (310 000 itérations). Sans lui, la fiche est illisible, y compris pour nous.', 'AES-256-GCM, with a key derived from your password by PBKDF2 (310,000 iterations). Without it, the file is unreadable, including to us.'] },
  { icon: ShieldCheck, t: ['Rien ne part sans vous', 'Nothing is sent without you'], d: ['Chaque transmission demande un consentement explicite et une double confirmation. Vous choisissez les sections.', 'Every transfer requires explicit consent and a double confirmation. You choose the sections.'] },
  { icon: EyeOff, t: ['Votre nom n’est jamais montré à l’IA', 'Your name is never shown to the AI'], d: ['Côté soignant, les identifiants sont masqués avant tout traitement par l’IA, et c’est visible à l’écran.', 'On the care team’s side, identifiers are masked before any AI processing, and this is visible on screen.'] },
  { icon: Trash2, t: ['Effacement en un clic', 'Erase in one click'], d: ['« Tout effacer » supprime la fiche de l’appareil immédiatement et définitivement.', '“Erase everything” deletes the file from the device immediately and permanently.'] },
  { icon: X, t: ['Aucun pistage', 'No tracking'], d: ['Pas de cookie publicitaire, pas d’outil d’analyse, pas de revente. Le fond de carte OpenStreetMap est le seul appel externe.', 'No advertising cookies, no analytics, no resale. The OpenStreetMap background map is the only external call.'] },
  { icon: Sparkles, t: ['L’IA guide, l’humain décide', 'AI guides, people decide'], d: ['L’IA ne pose aucun diagnostic, ne juge pas votre récit et ne désigne personne. Elle range des notes pour l’équipe soignante, qui valide chaque ligne.', 'The AI makes no diagnosis, doesn’t judge your story and doesn’t point to anyone. It organizes notes for the care team, which validates every line.'] },
  { icon: AlertTriangle, t: ['Ce qui reste à confirmer est signalé', 'What still needs confirming is flagged'], d: ['Une information qu’aucune source officielle n’a confirmée porte la mention « À confirmer ». Les délais médicaux sont indicatifs.', 'Information that no official source has confirmed is marked “To be confirmed”. Medical time frames are approximate.'] },
] as const

// Les promesses en liste simple, puis les gestes qu'elles annoncent : verrouiller et tout effacer sont ici aussi.
export default function ViePrivee({ onLock, onWipe, children }: { onLock: () => void; onWipe: () => void; children?: React.ReactNode }) {
  const { t, lang } = useLang()
  const k = lang === 'fr' ? 0 : 1
  return (
    <div>
      <h1 className="display max-w-3xl text-[1.75rem] sm:text-5xl">{t('Des données parmi les plus sensibles qui soient. On les traite comme telles.', 'Some of the most sensitive data there is. We treat it that way.')}</h1>
      <ul className="card-soft mt-6 divide-y divide-rule lg:grid lg:grid-cols-2 lg:gap-x-6 lg:divide-y-0 lg:p-3">
        {PROMISES.map(({ icon: Icon, t: title, d }) => (
          <li key={title[0]} className="flex gap-3 p-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-north-soft text-north"><Icon size={20} strokeWidth={2} /></span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-extrabold leading-snug">{title[k]}</h2>
              <p className="mt-1 text-base leading-normal text-ink-2">{d[k]}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-7" aria-labelledby="vp-gestes">
        <h2 id="vp-gestes" className="text-lg font-extrabold">{t('Vos gestes de protection', 'Your protective actions')}</h2>
        <div className="mt-3 flex flex-wrap items-start gap-2">
          <button onClick={onLock} className="btn btn-soft"><Lock size={18} strokeWidth={2.25} /> {t('Verrouiller mon espace', 'Lock my space')}</button>
          <Wipe onWipe={onWipe} plain />
        </div>
        {children}
      </section>

      <section className="mt-7" aria-labelledby="vp-langue">
        <h2 id="vp-langue" className="text-lg font-extrabold">{t('Langue', 'Language')}</h2>
        <p className="mt-1 text-base leading-snug text-ink-2">{t('Boussole existe en français et en anglais. Pour une autre langue, utilisez la traduction de votre navigateur : les numéros et les adresses ne seront pas modifiés.', 'Boussole is available in French and English. For another language, use your browser’s translation: phone numbers and addresses will not be changed.')}</p>
        <LangSwitch full className="mt-3" />
      </section>

      <div className="mt-7 rounded-[24px] bg-warn-soft p-5 text-warn">
        <h2 className="flex items-center gap-2 text-base font-extrabold"><AlertTriangle size={18} strokeWidth={2} /> {t('Bêta de test', 'Test beta')}</h2>
        <p className="mt-2 text-base leading-relaxed">{t('Cette version sert à tester le parcours. N’y entrez pas de vraies données. En production : hébergement au Canada, évaluation des facteurs relatifs à la vie privée (Loi 25), audit de sécurité indépendant, transmission chiffrée de bout en bout.', 'This version is for testing the journey. Don’t enter real information. In production: hosting in Canada, privacy impact assessment (Québec Law 25), independent security audit, end-to-end encrypted transfer.')}</p>
      </div>
    </div>
  )
}
