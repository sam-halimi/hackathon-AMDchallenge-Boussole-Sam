import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Wordmark } from './Logo'
import { Care, Choice, Space, Talk, Welcome } from './Illustrations'
import { AideDiscrete, LangSwitch } from './ui'
import { useLang } from '../lib/i18n'

/* ───────────── Les diapos d'arrivée ───────────── */

const SLIDES = [
  { bg: 'bg-coral-soft', Art: Welcome, title: ['Vous êtes au bon endroit.', 'You’re in the right place.'], text: ['Boussole vous accompagne après une agression sexuelle, pas à pas, à votre rythme. Vous n’avez rien à décider maintenant.', 'Boussole walks with you after a sexual assault, step by step, at your own pace. You don’t have to decide anything right now.'] },
  { bg: 'bg-north-soft', Art: Choice, title: ['Vous décidez de tout.', 'You decide everything.'], text: ['Chaque étape est un choix : vous pouvez dire non, faire une pause, revenir plus tard. Rien ne se fait sans vous.', 'Every step is a choice: you can say no, take a break, come back later. Nothing happens without you.'] },
  { bg: 'bg-sky-soft', Art: Care, title: ['Des soins près de chez vous.', 'Care close to you.'], text: ['On vous montre où aller à Montréal pour un examen, et ce qui est encore possible selon le temps écoulé.', 'We show you where to go in Montréal for an exam, and what is still possible depending on how much time has passed.'] },
  { bg: 'bg-sage-soft', Art: Talk, title: ['Quelqu’un pour vous écouter.', 'Someone to listen to you.'], text: ['Des intervenantes et des psychologues formés, gratuits et confidentiels, à quelques minutes de vous.', 'Trained support workers and psychologists, free and confidential, a few minutes away.'] },
  { bg: 'bg-sun-soft', Art: Space, title: ['Un espace rien qu’à vous.', 'A space just for you.'], text: ['Votre récit est chiffré avec votre mot de passe. Personne d’autre ne peut le lire, pas même nous.', 'Your story is encrypted with your password. No one else can read it, not even us.'] },
] as const

// Une diapo tient dans l'écran, bouton compris : l'illustration cède la place quand la hauteur manque,
// et la rangée du bouton reste collée en bas si le contenu dépasse malgré tout.
export default function Intro({ onDone, onHave, exit }: { onDone: () => void; onHave: () => void; exit?: React.ReactNode }) {
  const [i, setI] = useState(0)
  const { t, lang } = useLang()
  const k = lang === 'fr' ? 0 : 1
  const s = SLIDES[i]
  const last = i === SLIDES.length - 1
  const go = (n: number) => setI(Math.max(0, Math.min(SLIDES.length - 1, n)))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') { if (last) onDone(); else go(i + 1) } if (e.key === 'ArrowLeft') go(i - 1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  // Une seule page, sans défilement : tout tient dans la hauteur de l'écran (h-dvh). L'illustration prend
  // la place qui reste et rétrécit la première ; titre et texte se resserrent sur les écrans bas. Le bouton
  // « Suivant » reste au même endroit d'une diapo à l'autre. Sous 480 px de haut seulement, la page défile.
  const low = '[@media(max-height:600px)]'
  return (
    <div className={`flex h-dvh flex-col overflow-hidden transition-colors duration-300 ease-[var(--ease-out-soft)] [@media(max-height:479px)]:h-auto [@media(max-height:479px)]:min-h-dvh [@media(max-height:479px)]:overflow-visible ${s.bg}`}>
      <header className="mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between gap-2 px-4 py-2 sm:px-5 sm:py-4">
        <span className="inline-flex min-h-12 items-center"><Wordmark animate /></span>
        <div className="flex items-center gap-2">
          <button onClick={onHave} className="btn btn-plain hidden sm:inline-flex">{t('J’ai déjà un espace', 'I already have a space')}</button>
          <LangSwitch />
          {exit}
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col justify-center gap-3 px-4 pb-2 sm:px-5 md:grid md:grid-cols-2 md:items-center md:gap-8">
        <div key={`art-${i}`} className="fade-in flex min-h-0 flex-1 items-center justify-center md:h-full [@media(max-height:580px)]:hidden">
          <s.Art className="h-full max-h-[220px] w-auto max-w-full md:h-auto md:max-h-none md:w-full md:max-w-[420px]" />
        </div>
        <div key={`txt-${i}`} className="fade-in shrink-0">
          <p className="flex items-center gap-3 text-base font-extrabold text-ink-2">
            <span>{i + 1} {t('sur', 'of')} {SLIDES.length}</span>
            <span aria-hidden className="flex gap-1.5">
              {SLIDES.map((_, n) => <span key={n} className={`h-2 rounded-full ${n === i ? 'w-6 bg-ink' : 'w-2 bg-ink/25'}`} />)}
            </span>
          </p>
          <h1 className={`display mt-2 text-[2rem] ${low}:text-[1.65rem] sm:text-6xl`}>{s.title[k]}</h1>
          <p className={`mt-3 max-w-md text-[17px] leading-relaxed text-ink-2 ${low}:mt-2 ${low}:text-base ${low}:leading-snug sm:mt-5 sm:text-lg`}>{s.text[k]}</p>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl shrink-0 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-6">
        {/* « Passer » et « Suivant » sur la même ligne ; « Suivant » ne bouge pas verticalement. */}
        <div className="flex items-center gap-2 pt-2 sm:justify-end">
          {i > 0 && (
            <button onClick={() => go(i - 1)} aria-label={t('Précédent', 'Back')} className="btn btn-plain btn-icon h-14 w-14"><ArrowLeft size={20} strokeWidth={2.25} /></button>
          )}
          {!last && <button id="intro-skip" onClick={onDone} className="btn btn-quiet btn-lg px-4">{t('Passer', 'Skip')}</button>}
          <button id="intro-next" onClick={() => (last ? onDone() : go(i + 1))} className="btn btn-primary btn-lg flex-1 sm:flex-none">
            {last ? t('Créer mon espace', 'Create my space') : t('Suivant', 'Next')} <ArrowRight size={20} strokeWidth={2.25} />
          </button>
        </div>
        <div className="flex justify-center sm:hidden">
          <button onClick={onHave} className="btn btn-quiet">{t('J’ai déjà un espace', 'I already have a space')}</button>
        </div>
        <AideDiscrete className="mt-1 sm:mx-auto sm:mt-4 sm:max-w-md" />
      </footer>
    </div>
  )
}
