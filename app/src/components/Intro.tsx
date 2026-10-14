import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Wordmark } from './Logo'
import { Care, Choice, Space, Talk, Welcome } from './Illustrations'
import { AideDiscrete } from './ui'

/* ───────────── Les diapos d'arrivée ───────────── */

const SLIDES = [
  { bg: 'bg-coral-soft', Art: Welcome, title: 'Vous êtes au bon endroit.', text: 'Boussole vous accompagne après une agression sexuelle, pas à pas, à votre rythme. Vous n’avez rien à décider maintenant.' },
  { bg: 'bg-north-soft', Art: Choice, title: 'Vous décidez de tout.', text: 'Chaque étape est un choix : vous pouvez dire non, faire une pause, revenir plus tard. Rien ne se fait sans vous.' },
  { bg: 'bg-sky-soft', Art: Care, title: 'Des soins près de chez vous.', text: 'On vous montre où aller à Montréal pour un examen, et ce qui est encore possible selon le temps écoulé.' },
  { bg: 'bg-sage-soft', Art: Talk, title: 'Quelqu’un pour vous écouter.', text: 'Des intervenantes et des psychologues formés, gratuits et confidentiels, à quelques minutes de vous.' },
  { bg: 'bg-sun-soft', Art: Space, title: 'Un espace rien qu’à vous.', text: 'Votre récit est chiffré avec votre mot de passe. Personne d’autre ne peut le lire, pas même nous.' },
]

// Une diapo tient dans l'écran, bouton compris : l'illustration cède la place quand la hauteur manque,
// et la rangée du bouton reste collée en bas si le contenu dépasse malgré tout.
export default function Intro({ onDone, onHave, exit }: { onDone: () => void; onHave: () => void; exit?: React.ReactNode }) {
  const [i, setI] = useState(0)
  const s = SLIDES[i]
  const last = i === SLIDES.length - 1
  const go = (n: number) => setI(Math.max(0, Math.min(SLIDES.length - 1, n)))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') { if (last) onDone(); else go(i + 1) } if (e.key === 'ArrowLeft') go(i - 1) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <div className={`flex min-h-dvh flex-col transition-colors duration-300 ease-[var(--ease-out-soft)] ${s.bg}`}>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2 sm:px-5 sm:py-4">
        <span className="inline-flex min-h-12 items-center"><Wordmark animate /></span>
        <div className="flex items-center gap-2">
          <button onClick={onHave} className="btn btn-plain hidden sm:inline-flex">J’ai déjà un espace</button>
          {exit}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 content-center items-center gap-4 px-4 sm:px-5 md:grid-cols-2 md:gap-8">
        <div key={`art-${i}`} className="fade-in">
          <s.Art className="mx-auto h-[clamp(80px,20dvh,220px)] w-auto md:h-auto md:w-full md:max-w-[420px]" />
        </div>
        <div key={`txt-${i}`} className="fade-in">
          <p className="flex items-center gap-3 text-base font-extrabold text-ink-2">
            <span>{i + 1} sur {SLIDES.length}</span>
            <span aria-hidden className="flex gap-1.5">
              {SLIDES.map((_, n) => <span key={n} className={`h-2 rounded-full ${n === i ? 'w-6 bg-ink' : 'w-2 bg-ink/25'}`} />)}
            </span>
          </p>
          <h1 className="display mt-2 text-[2rem] sm:text-6xl">{s.title}</h1>
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-ink-2 sm:mt-5 sm:text-lg">{s.text}</p>
        </div>
      </main>

      <div className={`sticky bottom-0 z-10 transition-colors duration-300 ease-[var(--ease-out-soft)] ${s.bg}`}>
        <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 pb-1 pt-3 sm:px-5">
          {i > 0 && (
            <button onClick={() => go(i - 1)} aria-label="Précédent" className="btn btn-plain btn-icon h-14 w-14"><ArrowLeft size={20} strokeWidth={2.25} /></button>
          )}
          <button id="intro-next" onClick={() => (last ? onDone() : go(i + 1))} className="btn btn-primary btn-lg flex-1 sm:ml-auto sm:flex-none">
            {last ? 'Créer mon espace' : 'Suivant'} <ArrowRight size={20} strokeWidth={2.25} />
          </button>
        </div>
      </div>
      <footer className="mx-auto w-full max-w-5xl px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-6">
        <div className="flex items-center justify-between">
          <button onClick={onHave} className="btn btn-quiet -ml-3 sm:invisible">J’ai déjà un espace</button>
          {!last && <button id="intro-skip" onClick={onDone} className="btn btn-quiet -mr-3">Passer</button>}
        </div>
        <AideDiscrete />
      </footer>
    </div>
  )
}
