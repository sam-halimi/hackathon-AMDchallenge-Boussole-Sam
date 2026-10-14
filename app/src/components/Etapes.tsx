import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock, FileLock2, HeartHandshake, Phone, Scale, ShieldAlert, Shirt, Stethoscope, ToggleRight, X } from 'lucide-react'
import { CARE_STEPS } from '../lib/careSteps'
import { useDialog } from '../lib/useDialog'

const ICONS = { danger: ShieldAlert, phone: Phone, shirt: Shirt, exam: Stethoscope, choice: ToggleRight, support: HeartHandshake, legal: Scale, file: FileLock2 }
const TINT: Record<string, string> = {
  coral: 'bg-coral-soft text-coral-ink', north: 'bg-north-soft text-north', sky: 'bg-sky-soft text-sky-ink', sage: 'bg-sage-soft text-sage-ink', sun: 'bg-sun-soft text-warn',
}

// Fenêtre des étapes de prise en charge. Une étape par vue, sans défilement interne : le contenu le plus
// long tient dans 360×640. La fenêtre a une hauteur fixe (plein écran sur téléphone) : « Suivant » reste
// au même endroit d'une étape à l'autre. Sur téléphone, une barre de progression ; à partir de 640 px,
// des numéros cliquables.
export default function Etapes({ open, onClose, prenom, go }: { open: boolean; onClose: () => void; prenom?: string; go: (tab: string, filter?: 'exam' | 'support') => void }) {
  const [i, setI] = useState(0)
  const dialog = useRef<HTMLDivElement>(null)
  const steps = CARE_STEPS
  const move = useCallback((n: number) => setI(Math.max(0, Math.min(steps.length - 1, n))), [steps.length])
  // La fenêtre repart de la première étape à chaque ouverture.
  const close = useCallback(() => { setI(0); onClose() }, [onClose])
  useDialog(dialog, open, close)

  // Une étape ne défile jamais : si son contenu dépasse la place disponible (téléphone bas, barre du
  // navigateur affichée), elle se resserre par paliers (data-fit = 1 puis 2, voir index.css).
  const body = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!open) return
    const fit = () => {
      const el = body.current
      if (!el) return
      el.dataset.fit = '0'
      for (const level of ['1', '2']) {
        if (el.scrollHeight <= el.clientHeight + 1) break
        el.dataset.fit = level
      }
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [open, i])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') move(i + 1)
      if (e.key === 'ArrowLeft') move(i - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, i, move])

  if (!open) return null
  const s = steps[i]
  const Icon = ICONS[s.icon]
  const last = i === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={close} />
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="etape-titre" id="etapes"
        className="sheet-in relative flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-paper shadow-[0_40px_90px_-30px_rgba(45,36,64,.6)] outline-none sm:h-[min(660px,92dvh)] sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 px-4 pt-3 sm:px-6 sm:pt-5">
          <div className="min-w-0 pt-1">
            <p className="text-base font-extrabold leading-snug text-north">{prenom ? `${prenom}, voici` : 'Voici'} les étapes, dans l’ordre</p>
            <p className="mt-0.5 text-sm leading-snug text-ink-2 [@media(max-height:620px)]:hidden">Vous pouvez vous arrêter à tout moment. Rien n’est obligatoire.</p>
          </div>
          <button onClick={close} aria-label="Fermer" className="btn btn-plain btn-icon"><X size={20} strokeWidth={2.25} /></button>
        </div>

        <div aria-hidden className="mt-3 flex gap-1 px-4 sm:hidden">
          {steps.map((st, n) => <span key={st.title} className={`h-1.5 flex-1 rounded-full ${n <= i ? 'bg-north' : 'bg-rule'}`} />)}
        </div>
        <ol className="mt-4 hidden gap-1.5 px-6 sm:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((st, n) => (
            <li key={st.title}>
              <button onClick={() => move(n)} aria-label={`Étape ${n + 1} : ${st.title}`} aria-current={n === i ? 'step' : undefined}
                className={`press grid h-12 w-full place-items-center rounded-full text-base font-extrabold ${n === i ? 'bg-ink text-white' : n < i ? TINT[st.tint] : 'bg-panel text-ink-2'}`}>
                {n + 1}
              </button>
            </li>
          ))}
        </ol>

        <div key={i} ref={body} className="etape fade-in min-h-0 flex-1 overflow-hidden px-4 pb-2 pt-3 sm:px-6 sm:pt-5">
          <div className="flex items-center gap-3">
            <span className={`etape-icone grid h-12 w-12 shrink-0 place-items-center rounded-2xl sm:h-14 sm:w-14 ${TINT[s.tint]}`}><Icon size={26} strokeWidth={1.9} /></span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-ink-2">Étape {i + 1} sur {steps.length}</p>
              <h2 id="etape-titre" className="display text-2xl sm:text-4xl">{s.title}</h2>
            </div>
          </div>
          <p className="mt-3 text-base leading-normal text-ink-2 sm:text-[17px] sm:leading-relaxed">{s.text}</p>
          {s.timing && (
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-sun-soft px-4 py-3 text-base font-bold leading-snug text-warn"><Clock size={18} strokeWidth={2} className="mt-0.5 shrink-0" /> <span>{s.timing}</span></p>
          )}
          {s.tips && (
            <ul className="mt-3 space-y-1.5">
              {s.tips.map((t) => <li key={t} className="flex gap-2.5 rounded-2xl bg-white px-4 py-2.5 text-base leading-snug shadow-[0_10px_24px_-22px_rgba(45,36,64,.6)]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-north" /> {t}</li>)}
            </ul>
          )}
          {s.action && (
            s.action.href ? (
              <a href={s.action.href} className="btn btn-call mt-3"><Phone size={18} strokeWidth={2.25} /> {s.action.label}</a>
            ) : (
              <button onClick={() => go(s.action!.tab!, s.action!.filter)} className="btn btn-soft mt-3">{s.action.label} <ArrowRight size={18} strokeWidth={2.25} /></button>
            )
          )}
          {s.source && <p className="mt-3 text-sm text-ink-2">Source : {s.source}</p>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-rule px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-3 sm:pb-3">
          <button onClick={close} className="btn btn-quiet -ml-3">Plus tard</button>
          <div className="flex gap-2">
            <button onClick={() => move(i - 1)} disabled={i === 0} aria-label="Étape précédente" className="btn btn-plain btn-icon"><ArrowLeft size={20} strokeWidth={2.25} /></button>
            <button id="etape-next" onClick={() => (last ? close() : move(i + 1))} className="btn btn-primary">
              {last ? 'C’est compris' : 'Suivant'} <ArrowRight size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
