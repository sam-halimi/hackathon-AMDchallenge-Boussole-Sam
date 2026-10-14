import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight, List, Lock, Trash2 } from 'lucide-react'
import { Check2, OptionList } from './ui'
import { BESOINS, SYMPTOMES, TRI, VETEMENTS, type Fiche, type Tri } from '../lib/fiche'
import { useLang, type Lang } from '../lib/i18n'
import { option } from '../lib/en'

const NB = ' '

/* ───────────── Fiche « Mon récit » : une question à la fois ───────────── */

type T = (fr: string, en: string) => string
type Ctx = { fiche: Fiche; update: (p: Partial<Fiche>) => void; hoursSince: number | null; t: T; lang: Lang }
type Question = { id: string; title: [string, string]; summary: (f: Fiche, c: Pick<Ctx, 't' | 'lang'> & { locale: string }) => string; body: (c: Ctx) => React.ReactNode }

const triLabel = (v: Tri) => TRI.find(([k]) => k === v)?.[1] ?? ''
const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

// Les réponses restent enregistrées en français (comme dans la V1) ; seul l'affichage est traduit.
function TriChoice({ label, value, onChange, lang }: { label: string; value: Tri; onChange: (v: Tri) => void; lang: Lang }) {
  return <OptionList single label={label} options={TRI.map(([, l]) => l)} display={(l) => option(lang, l)} value={value ? [triLabel(value)] : []} onToggle={(l) => { const v = TRI.find(([, x]) => x === l)![0]; onChange(value === v ? '' : v) }} />
}

// Les dix questions, dans l'ordre et avec les mots de la fiche d'origine. Aucune n'est obligatoire.
const QUESTIONS: Question[] = [
  { id: 'quand', title: ['Quand ?', 'When?'],
    summary: (f, { t, locale }) => (f.quandInconnu ? t('Je ne sais pas exactement', 'I don’t know exactly') : f.quand ? new Date(f.quand).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' }) : ''),
    body: ({ fiche, update, hoursSince, t }) => (
      <>
        <input id="q-quand" aria-label={t('Date et heure', 'Date and time')} type="datetime-local" value={fiche.quand} disabled={fiche.quandInconnu} onChange={(e) => update({ quand: e.target.value })} className="input disabled:bg-panel disabled:text-ink-3" />
        <div className="mt-2"><Check2 label={t('Je ne sais pas exactement', 'I don’t know exactly')} checked={fiche.quandInconnu} onChange={(v) => update({ quandInconnu: v })} /></div>
        {hoursSince !== null && <p className="fade-in mt-2 text-base text-ink-2">{t('Il y a environ', 'About')} <b className="text-ink">{hoursSince}{NB}h</b>{t('.', ' ago.')}</p>}
      </>
    ) },
  { id: 'ou', title: ['Où ?', 'Where?'], summary: (f) => f.ou,
    body: ({ fiche, update, t }) => <input id="q-ou" aria-label={t('Où ?', 'Where?')} value={fiche.ou} onChange={(e) => update({ ou: e.target.value })} className="input" placeholder={t('Un lieu, un quartier, ou rien', 'A place, a neighbourhood, or nothing')} /> },
  { id: 'souvenirs', title: ['Ce dont je me souviens', 'What I remember'], summary: (f) => f.souvenirs,
    body: ({ fiche, update, t }) => <textarea id="q-souvenirs" aria-label={t('Ce dont je me souviens', 'What I remember')} value={fiche.souvenirs} onChange={(e) => update({ souvenirs: e.target.value })} rows={7} className="input resize-y" placeholder={t('Avec vos mots. Il n’y a pas de bonne façon de raconter.', 'In your own words. There is no right way to tell it.')} /> },
  { id: 'oublis', title: ['Ce dont je ne me souviens pas', 'What I don’t remember'], summary: (f) => f.oublis,
    body: ({ fiche, update, t }) => <textarea id="q-oublis" aria-label={t('Ce dont je ne me souviens pas', 'What I don’t remember')} value={fiche.oublis} onChange={(e) => update({ oublis: e.target.value })} rows={5} className="input resize-y" placeholder={t('Des moments flous ou absents. C’est fréquent, ce n’est pas un problème de fiabilité.', 'Moments that are blurry or missing. This is common; it is not a question of reliability.')} /> },
  { id: 'symptomes', title: ['Symptômes', 'Symptoms'], summary: (f, { lang }) => f.symptomes.map((x) => option(lang, x)).join(', '),
    body: ({ fiche, update, t, lang }) => <OptionList label={t('Symptômes', 'Symptoms')} options={SYMPTOMES} display={(o) => option(lang, o)} value={fiche.symptomes} onToggle={(v) => update({ symptomes: toggleIn(fiche.symptomes, v) })} /> },
  { id: 'substance', title: ['Une substance est soupçonnée ?', 'Is a substance suspected?'], summary: (f, { lang }) => option(lang, triLabel(f.substance)),
    body: ({ fiche, update, t, lang }) => <TriChoice lang={lang} label={t('Une substance est soupçonnée ?', 'Is a substance suspected?')} value={fiche.substance} onChange={(v) => update({ substance: v })} /> },
  { id: 'douche', title: ['Douche ou bain depuis ?', 'Shower or bath since?'], summary: (f, { lang }) => option(lang, triLabel(f.douche)),
    body: ({ fiche, update, t, lang }) => <TriChoice lang={lang} label={t('Douche ou bain depuis ?', 'Shower or bath since?')} value={fiche.douche} onChange={(v) => update({ douche: v })} /> },
  { id: 'vetements', title: ['Vêtements', 'Clothing'], summary: (f, { lang }) => option(lang, f.vetements),
    body: ({ fiche, update, t, lang }) => (
      <>
        <OptionList single label={t('Vêtements', 'Clothing')} options={VETEMENTS} display={(o) => option(lang, o)} value={fiche.vetements ? [fiche.vetements] : []} onToggle={(v) => update({ vetements: fiche.vetements === v ? '' : v })} />
        <p className="mt-3 text-base text-ink-2">{t('Si possible, gardez-les dans un sac en papier.', 'If possible, keep them in a paper bag.')}</p>
      </>
    ) },
  { id: 'besoins', title: ['Ce dont j’ai besoin maintenant', 'What I need right now'], summary: (f, { lang }) => f.besoins.map((x) => option(lang, x)).join(', '),
    body: ({ fiche, update, t, lang }) => <OptionList label={t('Ce dont j’ai besoin maintenant', 'What I need right now')} options={BESOINS} display={(o) => option(lang, o)} value={fiche.besoins} onToggle={(v) => update({ besoins: toggleIn(fiche.besoins, v) })} /> },
  { id: 'temoins', title: ['Personnes présentes ou témoins (facultatif)', 'People present or witnesses (optional)'], summary: (f) => f.temoins,
    body: ({ fiche, update, t }) => <textarea id="q-temoins" aria-label={t('Personnes présentes ou témoins', 'People present or witnesses')} value={fiche.temoins} onChange={(e) => update({ temoins: e.target.value })} rows={3} className="input resize-y" placeholder={t('Prénoms, rôles, ou rien', 'First names, roles, or nothing')} /> },
]

export default function Recit({ fiche, update, savedAt, hoursSince, onWipe, onNext }: {
  fiche: Fiche; update: (p: Partial<Fiche>) => void; savedAt: string | null; hoursSince: number | null; onWipe: () => void; onNext: () => void
}) {
  // null : la vue d'ensemble ; sinon l'indice de la question affichée.
  const [at, setAt] = useState<number | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const { t, lang, locale } = useLang()
  const k = lang === 'fr' ? 0 : 1
  useEffect(() => { window.scrollTo(0, 0); if (at !== null) heading.current?.focus() }, [at])

  const answers = QUESTIONS.map((q) => q.summary(fiche, { t, lang, locale }))
  const done = answers.filter(Boolean).length
  const saved = (
    <span id="saved" className="inline-flex items-center gap-2 rounded-full bg-north-soft px-3.5 py-2 text-sm font-bold text-north">
      <Lock size={15} strokeWidth={2} /> {savedAt ? `${t('Chiffré', 'Encrypted')} · ${new Date(savedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}` : t('Chiffré', 'Encrypted')}
    </span>
  )

  if (at === null) {
    const next = answers.findIndex((a) => !a)
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="display text-[2rem] sm:text-5xl">{t('À votre rythme.', 'At your own pace.')}</h1>
        <p className="mt-2 text-[17px] leading-relaxed text-ink-2 sm:mt-3">{t('Remplissez ce que vous pouvez, quand vous voulez. « Je ne sais pas » est une réponse. Tout est enregistré et chiffré automatiquement.', 'Fill in what you can, whenever you want. “I don’t know” is an answer. Everything is saved and encrypted automatically.')}</p>
        <div className="mt-3">{saved}</div>
        <button id="recit-start" onClick={() => setAt(next < 0 ? 0 : next)} className="btn btn-primary btn-lg mt-5 w-full sm:w-auto">
          {done === 0 ? t('Commencer', 'Start') : next < 0 ? t('Relire mes réponses', 'Review my answers') : t('Continuer mon récit', 'Continue my story')} <ArrowRight size={20} strokeWidth={2.25} />
        </button>

        <h2 className="mt-8 text-lg font-extrabold">{t('Vos réponses', 'Your answers')} <span className="font-normal text-ink-2">· {done} {t('sur', 'of')} {QUESTIONS.length}</span></h2>
        <ol className="card-soft mt-3 divide-y divide-rule overflow-hidden">
          {QUESTIONS.map((q, n) => (
            <li key={q.id}>
              <button onClick={() => setAt(n)} className="press flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-panel">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-extrabold ${answers[n] ? 'bg-north text-white' : 'bg-panel text-ink-2'}`}>
                  {answers[n] ? <Check size={15} strokeWidth={3} /> : n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold leading-snug">{q.title[k]}</span>
                  <span className="block truncate text-[15px] text-ink-2">{answers[n] || t('Pas encore rempli', 'Not filled in yet')}</span>
                </span>
                <ChevronRight size={20} strokeWidth={2.25} className="shrink-0 text-ink-2" />
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Wipe onWipe={onWipe} />
          <button onClick={onNext} className="btn btn-soft">{t('Où aller maintenant', 'Where to go now')} <ArrowRight size={18} strokeWidth={2.25} /></button>
        </div>
      </div>
    )
  }

  const q = QUESTIONS[at]
  const last = at === QUESTIONS.length - 1
  return (
    <div className="mx-auto max-w-2xl pb-20">
      <div className="flex items-center justify-between gap-2">
        <button id="recit-all" onClick={() => setAt(null)} className="btn btn-quiet -ml-3"><List size={18} strokeWidth={2.25} /> {t('Tout voir', 'See all')}</button>
        {saved}
      </div>
      <p className="mt-3 text-sm font-extrabold text-ink-2">{t('Question', 'Question')} {at + 1} {t('sur', 'of')} {QUESTIONS.length}</p>
      <div aria-hidden className="mt-2 flex gap-1">
        {QUESTIONS.map((x, n) => <span key={x.id} className={`h-1.5 flex-1 rounded-full ${n <= at ? 'bg-north' : 'bg-rule'}`} />)}
      </div>
      <div key={q.id} className="fade-in">
        <h1 ref={heading} tabIndex={-1} className="display mt-5 text-[1.75rem] outline-none sm:text-4xl">{q.title[k]}</h1>
        <div className="mt-4">{q.body({ fiche, update, hoursSince, t, lang })}</div>
      </div>
      <p className="mt-5 text-[15px] text-ink-2">{t('Rien n’est obligatoire : vous pouvez passer cette question.', 'Nothing is mandatory: you can skip this question.')}</p>
      {/* Précédent et Suivant sont fixés en bas, au-dessus de la barre d'onglets : même place à chaque question. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-rule bg-paper sm:bottom-0">
        <div className="mx-auto flex max-w-2xl gap-2 px-4 py-2 sm:py-3">
          <button id="recit-prev" onClick={() => setAt(at - 1)} disabled={at === 0} aria-label={t('Question précédente', 'Previous question')} className="btn btn-plain btn-icon h-14 w-14"><ArrowLeft size={20} strokeWidth={2.25} /></button>
          <button id="recit-next" onClick={() => (last ? onNext() : setAt(at + 1))} className="btn btn-primary btn-lg flex-1">
            {last ? t('Où aller maintenant', 'Where to go now') : t('Suivant', 'Next')} <ArrowRight size={20} strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* « Tout effacer » supprime le compte et la fiche de l'appareil : toujours en deux temps. */
export function Wipe({ onWipe, plain }: { onWipe: () => void; plain?: boolean }) {
  const [confirm, setConfirm] = useState(false)
  const { t } = useLang()
  if (!confirm) return <button id="wipe" onClick={() => setConfirm(true)} className={`btn ${plain ? 'btn-plain' : 'btn-quiet -ml-3'}`}><Trash2 size={18} strokeWidth={2} /> {t('Tout effacer', 'Erase everything')}</button>
  return (
    <div role="alertdialog" aria-label={t('Confirmer l’effacement', 'Confirm erasing')} className="fade-in w-full rounded-2xl bg-alert-soft p-4">
      <p className="text-base font-bold text-alert">{t('Tout effacer définitivement de cet appareil ?', 'Permanently erase everything from this device?')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button id="wipe-confirm" onClick={onWipe} className="btn btn-danger">{t('Effacer', 'Erase')}</button>
        <button onClick={() => setConfirm(false)} className="btn btn-plain">{t('Annuler', 'Cancel')}</button>
      </div>
    </div>
  )
}
