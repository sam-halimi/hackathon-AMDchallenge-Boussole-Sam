import { AlertTriangle, ChevronRight, ListOrdered } from 'lucide-react'
import { Care, Choice, Folder, Talk } from './Illustrations'
import { InstallCard } from './Pwa'
import { LigneAide } from './ui'
import type { Fiche, Kind, Tab } from '../lib/fiche'
import { useLang } from '../lib/i18n'

const NB = '\u00A0'

/* ───────────── Accueil de l'espace ───────────── */

// L'appel d'abord, puis quatre accès. Chaque accès ouvre directement ce qu'il annonce :
// « Trouver un examen » et « Parler à quelqu'un » arrivent sur la liste déjà filtrée.
export default function Accueil({ fiche, hoursSince, go, onIntro }: { fiche: Fiche; hoursSince: number | null; go: (t: Tab, kind?: Kind) => void; onIntro: () => void }) {
  const { t } = useLang()
  const h = new Date().getHours()
  const hello = h < 5 || h >= 18 ? t('Bonsoir', 'Good evening') : t('Bonjour', 'Hello')
  const actions: { tab: Tab; kind?: Kind; bg: string; Art: typeof Choice; title: string; text: string }[] = [
    { tab: 'recit', bg: 'bg-north-soft', Art: Choice, title: t('Écrire mon récit', 'Write my story'), text: fiche.souvenirs ? t('Reprendre là où vous en étiez.', 'Pick up where you left off.') : t('Une seule fois, à votre rythme.', 'Once, at your own pace.') },
    { tab: 'aller', kind: 'exam', bg: 'bg-sky-soft', Art: Care, title: t('Trouver un examen', 'Find an exam'), text: hoursSince !== null && hoursSince <= 120 ? t(`Il y a ${hoursSince}${NB}h : des examens sont encore possibles.`, `${hoursSince}${NB}h ago: exams are still possible.`) : t('Les centres désignés de Montréal.', 'Designated centres in Montréal.') },
    { tab: 'aller', kind: 'support', bg: 'bg-sage-soft', Art: Talk, title: t('Parler à quelqu’un', 'Talk to someone'), text: t('Écoute et soutien psychologique, gratuits.', 'Listening and psychological support, free.') },
    { tab: 'dossier', bg: 'bg-sun-soft', Art: Folder, title: t('Mon dossier', 'My file'), text: t('Si vous le décidez, on le prépare pour un service juridique.', 'If you decide to, we prepare it for a legal service.') },
  ]
  return (
    <div>
      <h1 className="display text-[2rem] sm:text-5xl">{hello}{fiche.prenom ? ` ${fiche.prenom}` : ''}.</h1>
      <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink-2 sm:mt-3 sm:text-lg">{t('Prenez le temps qu’il vous faut. Voici ce que vous pouvez faire, dans l’ordre que vous voulez.', 'Take all the time you need. Here is what you can do, in whatever order you want.')}</p>

      <div className="mt-5 sm:mt-7"><LigneAide id="call-ligne" detail={t(`Info-aide violence sexuelle · gratuit, 24${NB}h/24`, 'Info-aide violence sexuelle · free, 24/7')} /></div>

      <h2 className="sr-only">{t('Ce que vous pouvez faire', 'What you can do')}</h2>
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
        <span>{t('Boussole donne des repères, pas d’avis médical ni juridique. Les délais sont indicatifs. En cas de doute : Info-aide violence sexuelle ou le 811. En danger : 911.', 'Boussole gives guidance, not medical or legal advice. Time frames are approximate. If in doubt: Info-aide violence sexuelle or 811. In danger: 911.')}</span>
      </p>
      <InstallCard />
      <button onClick={onIntro} className="btn btn-quiet -ml-3 mt-3 text-left sm:mt-6"><ListOrdered size={18} strokeWidth={2} className="shrink-0" /> {t('Revoir les étapes de la prise en charge', 'Review the care steps')}</button>
    </div>
  )
}
