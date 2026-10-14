import { AlertTriangle, ChevronRight, ListOrdered } from 'lucide-react'
import { Care, Choice, Folder, Talk } from './Illustrations'
import { InstallCard } from './Pwa'
import { LigneAide } from './ui'
import type { Fiche, Kind, Tab } from '../lib/fiche'

const NB = '\u00A0'

/* ───────────── Accueil de l'espace ───────────── */

// L'appel d'abord, puis quatre accès. Chaque accès ouvre directement ce qu'il annonce :
// « Trouver un examen » et « Parler à quelqu'un » arrivent sur la liste déjà filtrée.
export default function Accueil({ fiche, hoursSince, go, onIntro }: { fiche: Fiche; hoursSince: number | null; go: (t: Tab, kind?: Kind) => void; onIntro: () => void }) {
  const h = new Date().getHours()
  const hello = h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour'
  const actions: { tab: Tab; kind?: Kind; bg: string; Art: typeof Choice; title: string; text: string }[] = [
    { tab: 'recit', bg: 'bg-north-soft', Art: Choice, title: 'Écrire mon récit', text: fiche.souvenirs ? 'Reprendre là où vous en étiez.' : 'Une seule fois, à votre rythme.' },
    { tab: 'aller', kind: 'exam', bg: 'bg-sky-soft', Art: Care, title: 'Trouver un examen', text: hoursSince !== null && hoursSince <= 120 ? `Il y a ${hoursSince}${NB}h : des examens sont encore possibles.` : 'Les centres désignés de Montréal.' },
    { tab: 'aller', kind: 'support', bg: 'bg-sage-soft', Art: Talk, title: 'Parler à quelqu’un', text: 'Écoute et soutien psychologique, gratuits.' },
    { tab: 'dossier', bg: 'bg-sun-soft', Art: Folder, title: 'Mon dossier', text: 'Si vous le décidez, on le prépare pour un service juridique.' },
  ]
  return (
    <div>
      <h1 className="display text-[2rem] sm:text-5xl">{hello}{fiche.prenom ? ` ${fiche.prenom}` : ''}.</h1>
      <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink-2 sm:mt-3 sm:text-lg">Prenez le temps qu’il vous faut. Voici ce que vous pouvez faire, dans l’ordre que vous voulez.</p>

      <div className="mt-5 sm:mt-7"><LigneAide id="call-ligne" detail={`Info-aide violence sexuelle · gratuit, 24${NB}h/24`} /></div>

      <h2 className="sr-only">Ce que vous pouvez faire</h2>
      <ul className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2 sm:gap-4">
        {actions.map((a) => (
          <li key={a.title}>
            <button onClick={() => go(a.tab, a.kind)} className={`press flex h-full w-full items-center gap-3 rounded-[24px] p-3 text-left sm:gap-4 sm:rounded-[28px] sm:p-5 ${a.bg}`}>
              <a.Art className="h-16 w-16 shrink-0 sm:h-28 sm:w-28" />
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-extrabold leading-snug sm:text-xl">{a.title}</span>
                <span className="mt-0.5 block text-base leading-snug text-ink-2">{a.text}</span>
              </span>
              <ChevronRight size={22} strokeWidth={2.25} className="shrink-0 text-ink-2" />
            </button>
          </li>
        ))}
      </ul>
      <p id="pas-avis-medical" className="mt-4 flex items-start gap-2 rounded-2xl bg-panel px-4 py-3 text-base leading-snug text-ink-2 sm:mt-6">
        <AlertTriangle size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-warn" />
        <span>Boussole donne des repères, pas d’avis médical ni juridique. Les délais sont indicatifs. En cas de doute : Info-aide violence sexuelle ou le 811. En danger : 911.</span>
      </p>
      <InstallCard />
      <button onClick={onIntro} className="btn btn-quiet -ml-3 mt-3 text-left sm:mt-6"><ListOrdered size={18} strokeWidth={2} className="shrink-0" /> Revoir les étapes de la prise en charge</button>
    </div>
  )
}
