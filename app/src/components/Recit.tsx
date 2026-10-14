import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, List, Lock, Trash2 } from 'lucide-react'
import { Check2, OptionList } from './ui'
import { BESOINS, SYMPTOMES, TRI, VETEMENTS, type Fiche, type Tri } from '../lib/fiche'

const NB = '\u00A0'

/* ───────────── Fiche « Mon récit » : une question à la fois ───────────── */

type Ctx = { fiche: Fiche; update: (p: Partial<Fiche>) => void; hoursSince: number | null }
type Question = { id: string; title: string; summary: (f: Fiche) => string; body: (c: Ctx) => React.ReactNode }

const triLabel = (v: Tri) => TRI.find(([k]) => k === v)?.[1] ?? ''
const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

function TriChoice({ label, value, onChange }: { label: string; value: Tri; onChange: (v: Tri) => void }) {
  return <OptionList single label={label} options={TRI.map(([, l]) => l)} value={value ? [triLabel(value)] : []} onToggle={(l) => { const v = TRI.find(([, x]) => x === l)![0]; onChange(value === v ? '' : v) }} />
}

// Les dix questions, dans l'ordre et avec les mots de la fiche d'origine. Aucune n'est obligatoire.
const QUESTIONS: Question[] = [
  { id: 'quand', title: 'Quand ?',
    summary: (f) => (f.quandInconnu ? 'Je ne sais pas exactement' : f.quand ? new Date(f.quand).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }) : ''),
    body: ({ fiche, update, hoursSince }) => (
      <>
        <input id="q-quand" aria-label="Date et heure" type="datetime-local" value={fiche.quand} disabled={fiche.quandInconnu} onChange={(e) => update({ quand: e.target.value })} className="input disabled:bg-panel disabled:text-ink-3" />
        <div className="mt-2"><Check2 label="Je ne sais pas exactement" checked={fiche.quandInconnu} onChange={(v) => update({ quandInconnu: v })} /></div>
        {hoursSince !== null && <p className="fade-in mt-2 text-base text-ink-2">Il y a environ <b className="text-ink">{hoursSince}{NB}h</b>.</p>}
      </>
    ) },
  { id: 'ou', title: 'Où ?', summary: (f) => f.ou,
    body: ({ fiche, update }) => <input id="q-ou" aria-label="Où ?" value={fiche.ou} onChange={(e) => update({ ou: e.target.value })} className="input" placeholder="Un lieu, un quartier, ou rien" /> },
  { id: 'souvenirs', title: 'Ce dont je me souviens', summary: (f) => f.souvenirs,
    body: ({ fiche, update }) => <textarea id="q-souvenirs" aria-label="Ce dont je me souviens" value={fiche.souvenirs} onChange={(e) => update({ souvenirs: e.target.value })} rows={7} className="input resize-y" placeholder="Avec vos mots. Il n’y a pas de bonne façon de raconter." /> },
  { id: 'oublis', title: 'Ce dont je ne me souviens pas', summary: (f) => f.oublis,
    body: ({ fiche, update }) => <textarea id="q-oublis" aria-label="Ce dont je ne me souviens pas" value={fiche.oublis} onChange={(e) => update({ oublis: e.target.value })} rows={5} className="input resize-y" placeholder="Des moments flous ou absents. C’est fréquent, ce n’est pas un problème de fiabilité." /> },
  { id: 'symptomes', title: 'Symptômes', summary: (f) => f.symptomes.join(', '),
    body: ({ fiche, update }) => <OptionList label="Symptômes" options={SYMPTOMES} value={fiche.symptomes} onToggle={(v) => update({ symptomes: toggleIn(fiche.symptomes, v) })} /> },
  { id: 'substance', title: 'Une substance est soupçonnée ?', summary: (f) => triLabel(f.substance),
    body: ({ fiche, update }) => <TriChoice label="Une substance est soupçonnée ?" value={fiche.substance} onChange={(v) => update({ substance: v })} /> },
  { id: 'douche', title: 'Douche ou bain depuis ?', summary: (f) => triLabel(f.douche),
    body: ({ fiche, update }) => <TriChoice label="Douche ou bain depuis ?" value={fiche.douche} onChange={(v) => update({ douche: v })} /> },
  { id: 'vetements', title: 'Vêtements', summary: (f) => f.vetements,
    body: ({ fiche, update }) => (
      <>
        <OptionList single label="Vêtements" options={VETEMENTS} value={fiche.vetements ? [fiche.vetements] : []} onToggle={(v) => update({ vetements: fiche.vetements === v ? '' : v })} />
        <p className="mt-3 text-base text-ink-2">Si possible, gardez-les dans un sac en papier.</p>
      </>
    ) },
  { id: 'besoins', title: 'Ce dont j’ai besoin maintenant', summary: (f) => f.besoins.join(', '),
    body: ({ fiche, update }) => <OptionList label="Ce dont j’ai besoin maintenant" options={BESOINS} value={fiche.besoins} onToggle={(v) => update({ besoins: toggleIn(fiche.besoins, v) })} /> },
  { id: 'temoins', title: 'Personnes présentes ou témoins (facultatif)', summary: (f) => f.temoins,
    body: ({ fiche, update }) => <textarea id="q-temoins" aria-label="Personnes présentes ou témoins" value={fiche.temoins} onChange={(e) => update({ temoins: e.target.value })} rows={3} className="input resize-y" placeholder="Prénoms, rôles, ou rien" /> },
]

export default function Recit({ fiche, update, savedAt, hoursSince, onWipe, onNext }: {
  fiche: Fiche; update: (p: Partial<Fiche>) => void; savedAt: string | null; hoursSince: number | null; onWipe: () => void; onNext: () => void
}) {
  // null : la vue d'ensemble ; sinon l'indice de la question affichée.
  const [at, setAt] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { window.scrollTo(0, 0); if (at !== null) heading.current?.focus() }, [at])

  const answers = QUESTIONS.map((q) => q.summary(fiche))
  const done = answers.filter(Boolean).length
  const saved = (
    <span id="saved" className="inline-flex items-center gap-2 rounded-full bg-north-soft px-3.5 py-2 text-sm font-bold text-north">
      <Lock size={15} strokeWidth={2} /> {savedAt ? `Chiffré · ${new Date(savedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}` : 'Chiffré'}
    </span>
  )

  if (at === null) {
    const next = answers.findIndex((a) => !a)
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="display text-[2rem] sm:text-5xl">À votre rythme.</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-ink-2 sm:mt-3">Remplissez ce que vous pouvez, quand vous voulez. « Je ne sais pas » est une réponse. Tout est enregistré et chiffré automatiquement.</p>
        <div className="mt-3">{saved}</div>
        <button id="recit-start" onClick={() => setAt(next < 0 ? 0 : next)} className="btn btn-primary btn-lg mt-5 w-full sm:w-auto">
          {done === 0 ? 'Commencer' : next < 0 ? 'Relire mes réponses' : 'Continuer mon récit'} <ArrowRight size={20} strokeWidth={2.25} />
        </button>

        <h2 className="mt-8 text-lg font-extrabold">Vos réponses <span className="font-normal text-ink-2">· {done} sur {QUESTIONS.length}</span></h2>
        <ol className="card-soft mt-3 divide-y divide-rule overflow-hidden">
          {QUESTIONS.map((q, n) => (
            <li key={q.id}>
              <button onClick={() => setAt(n)} className="press flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-panel">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold ${answers[n] ? 'bg-north text-white' : 'bg-panel text-ink-2'}`}>
                  {answers[n] ? <Check size={15} strokeWidth={3} /> : n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold leading-snug">{q.title}</span>
                  <span className="block truncate text-[15px] text-ink-2">{answers[n] || 'Pas encore rempli'}</span>
                </span>
                <ChevronRight size={20} strokeWidth={2.25} className="shrink-0 text-ink-2" />
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Wipe onWipe={onWipe} />
          <button onClick={onNext} className="btn btn-soft">Où aller maintenant <ArrowRight size={18} strokeWidth={2.25} /></button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[at]
  const last = at === QUESTIONS.length - 1
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-2">
        <button id="recit-all" onClick={() => setAt(null)} className="btn btn-quiet -ml-3"><List size={18} strokeWidth={2.25} /> Tout voir</button>
        {saved}
      </div>
      <p className="mt-3 text-sm font-extrabold text-ink-2">Question {at + 1} sur {QUESTIONS.length}</p>
      <div aria-hidden className="mt-2 flex gap-1">
        {QUESTIONS.map((x, n) => <span key={x.id} className={`h-1.5 flex-1 rounded-full ${n <= at ? 'bg-north' : 'bg-rule'}`} />)}
      </div>
      <div key={q.id} className="fade-in">
        <h1 ref={heading} tabIndex={-1} className="display mt-5 text-[1.75rem] outline-none sm:text-4xl">{q.title}</h1>
        <div className="mt-4">{q.body({ fiche, update, hoursSince })}</div>
      </div>
      <p className="mt-5 text-[15px] text-ink-2">Rien n’est obligatoire : vous pouvez passer cette question.</p>
      {/* Précédent et Suivant restent à l'écran, au-dessus de la barre d'onglets, même quand la liste est longue. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 mt-2 flex gap-2 bg-paper px-4 py-2 sm:bottom-0 sm:mx-0 sm:px-0 sm:py-3">
        <button id="recit-prev" onClick={() => setAt(at - 1)} disabled={at === 0} aria-label="Question précédente" className="btn btn-plain btn-icon h-14 w-14"><ArrowLeft size={20} strokeWidth={2.25} /></button>
        <button id="recit-next" onClick={() => (last ? onNext() : setAt(at + 1))} className="btn btn-primary btn-lg flex-1">
          {last ? 'Où aller maintenant' : 'Suivant'} <ArrowRight size={20} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}

/* « Tout effacer » supprime le compte et la fiche de l'appareil : toujours en deux temps. */
export function Wipe({ onWipe, plain }: { onWipe: () => void; plain?: boolean }) {
  const [confirm, setConfirm] = useState(false)
  if (!confirm) return <button id="wipe" onClick={() => setConfirm(true)} className={`btn ${plain ? 'btn-plain' : 'btn-quiet -ml-3'}`}><Trash2 size={18} strokeWidth={2} /> Tout effacer</button>
  return (
    <div role="alertdialog" aria-label="Confirmer l’effacement" className="fade-in w-full rounded-2xl bg-alert-soft p-4">
      <p className="text-base font-bold text-alert">Tout effacer définitivement de cet appareil ?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button id="wipe-confirm" onClick={onWipe} className="btn btn-danger">Effacer</button>
        <button onClick={() => setConfirm(false)} className="btn btn-plain">Annuler</button>
      </div>
    </div>
  )
}
