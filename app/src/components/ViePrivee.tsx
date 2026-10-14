import { AlertTriangle, EyeOff, Fingerprint, Lock, ServerOff, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import { Wipe } from './Recit'

/* ───────────── Vie privée ───────────── */

const PROMISES = [
  { icon: ServerOff, t: 'Vos données restent sur votre appareil', d: 'En bêta, la fiche est stockée uniquement dans votre navigateur. Aucun serveur Boussole ne la reçoit.' },
  { icon: Fingerprint, t: 'Chiffrement avec votre mot de passe', d: 'AES-256-GCM, clé dérivée de votre mot de passe par PBKDF2 (310 000 itérations). Sans lui, la fiche est illisible, y compris pour nous.' },
  { icon: ShieldCheck, t: 'Rien ne part sans vous', d: 'Chaque transmission demande un consentement explicite et une double confirmation. Vous choisissez les sections.' },
  { icon: EyeOff, t: 'Votre nom n’est jamais montré à l’IA', d: 'Côté soignant, les identifiants sont masqués avant tout traitement par l’IA, et c’est visible à l’écran.' },
  { icon: Trash2, t: 'Effacement en un clic', d: '«\u00A0Tout effacer\u00A0» supprime la fiche de l’appareil immédiatement et définitivement.' },
  { icon: X, t: 'Aucun pistage', d: 'Pas de cookie publicitaire, pas d’outil d’analyse, pas de revente. Le fond de carte OpenStreetMap est le seul appel externe.' },
  { icon: Sparkles, t: 'L’IA guide, l’humain décide', d: 'L’IA ne pose aucun diagnostic, ne juge pas votre récit et ne désigne personne. Elle range des notes pour l’équipe soignante, qui valide chaque ligne.' },
  { icon: AlertTriangle, t: 'Ce qui reste à confirmer est signalé', d: 'Une information qu’aucune source officielle n’a confirmée porte la mention «\u00A0À confirmer\u00A0». Les délais médicaux sont indicatifs.' },
]

// Les promesses en liste simple, puis les gestes qu'elles annoncent : verrouiller et tout effacer sont ici aussi.
export default function ViePrivee({ onLock, onWipe, children }: { onLock: () => void; onWipe: () => void; children?: React.ReactNode }) {
  return (
    <div>
      <h1 className="display max-w-3xl text-[1.75rem] sm:text-5xl">Des données parmi les plus sensibles qui soient. On les traite comme telles.</h1>
      <ul className="card-soft mt-6 divide-y divide-rule lg:grid lg:grid-cols-2 lg:gap-x-6 lg:divide-y-0 lg:p-3">
        {PROMISES.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-3 p-4 sm:p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-north-soft text-north"><Icon size={20} strokeWidth={2} /></span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-extrabold leading-snug">{t}</h2>
              <p className="mt-1 text-base leading-normal text-ink-2">{d}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-7" aria-labelledby="vp-gestes">
        <h2 id="vp-gestes" className="text-lg font-extrabold">Vos gestes de protection</h2>
        <div className="mt-3 flex flex-wrap items-start gap-2">
          <button onClick={onLock} className="btn btn-soft"><Lock size={18} strokeWidth={2.25} /> Verrouiller mon espace</button>
          <Wipe onWipe={onWipe} plain />
        </div>
        {children}
      </section>

      <div className="mt-7 rounded-[24px] bg-warn-soft p-5 text-warn">
        <h2 className="flex items-center gap-2 text-base font-extrabold"><AlertTriangle size={18} strokeWidth={2} /> Bêta de test</h2>
        <p className="mt-2 text-base leading-relaxed">Cette version sert à tester le parcours. N’y entrez pas de vraies données. En production : hébergement au Canada, évaluation des facteurs relatifs à la vie privée (Loi 25), audit de sécurité indépendant, transmission chiffrée de bout en bout.</p>
      </div>
    </div>
  )
}
