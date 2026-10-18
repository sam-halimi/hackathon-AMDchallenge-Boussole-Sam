import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Check, ClipboardList, Clock, Download, Eye, EyeOff, FileText, Fingerprint,
  Link2, Lock, Printer, ShieldAlert, ShieldCheck, Sparkles, Stethoscope, X,
} from 'lucide-react'
import { appendEntry, verifyLog, type Entry } from '../lib/custody'
import { computeChecklist, type Answer, type Intake, type Status } from '../lib/rules'
import { DEMO_NOTES } from '../lib/demoCase'
import { pseudonymize } from '../lib/pseudonymize'
import { TIMELINE_FIXTURE, type TimelineResult } from '../lib/timelineFixture'
import { API_TIMELINE, type AiMeta, type TimelineApiResponse } from '../lib/aiApi'
import { useLang, type Lang } from '../lib/i18n'
import { localizeRule, rulesVersion, rulesWarning } from '../lib/en'
import { fallbackReason, identifierLabel, removedReason, timelineFixture } from '../lib/enDemo'
import { Wordmark } from './Logo'
import { LangSwitch } from './ui'

const STEPS = [
  { label: 'Consentement', en: 'Consent', icon: ShieldCheck },
  { label: 'Dossier guidé', en: 'Guided intake', icon: Stethoscope },
  { label: 'Prélèvements', en: 'Samples', icon: Clock },
  { label: 'Chronologie', en: 'Timeline', icon: Sparkles },
  { label: 'Export', en: 'Export', icon: FileText },
] as const
const ACTOR = 'Inf. M. Roy (fictif)'
const ACTOR_EN = 'RN M. Roy (fictional)'

type Consent = { examen: boolean; prelevements: boolean; conservation: boolean; transmission: boolean }
const CONSENT_LABELS: Record<keyof Consent, [string, string]> = {
  examen: ['Examen médical', 'Soins et évaluation médicale.'],
  prelevements: ['Prélèvements médicolégaux', 'Chaque prélèvement peut être refusé individuellement.'],
  conservation: ['Conservation de la trousse', 'Les preuves sont conservées ; la décision de porter plainte peut venir plus tard.'],
  transmission: ['Transmission à la police', 'Seulement si la personne le décide. Peut être accordée plus tard.'],
}
const CONSENT_LABELS_EN: Record<keyof Consent, [string, string]> = {
  examen: ['Medical exam', 'Care and medical assessment.'],
  prelevements: ['Forensic samples', 'Each sample can be refused individually.'],
  conservation: ['Forensic kit storage', 'Evidence is kept; the decision to report to the police can come later.'],
  transmission: ['Release to the police', 'Only if the person decides to. Can be granted later.'],
}
const consentLabels = (lang: Lang) => (lang === 'en' ? CONSENT_LABELS_EN : CONSENT_LABELS)

type Decision = 'pending' | 'ok' | 'rejected'

export default function Demo() {
  const { t, lang } = useLang()
  const labels = consentLabels(lang)
  const [step, setStep] = useState(0)
  const [log, setLog] = useState<Entry[]>([])
  const [integrity, setIntegrity] = useState<{ ok: boolean; brokenAt: number | null }>({ ok: true, brokenAt: null })
  const [consent, setConsent] = useState<Consent>({ examen: false, prelevements: false, conservation: false, transmission: false })
  const [intake, setIntake] = useState<Intake>({ hoursSince: 30, substance: true, exposure: true, pregnancyRisk: true, injuries: false, showered: false })
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState(DEMO_NOTES)
  const [showAiView, setShowAiView] = useState(false)
  const [timeline, setTimeline] = useState<TimelineResult | null>(null)
  const [source, setSource] = useState<'live' | 'fixture' | 'blocked' | null>(null)
  const [aiMeta, setAiMeta] = useState<AiMeta | null>(null)
  const [loading, setLoading] = useState(false)
  // Lignes reçues au fil de la génération, déjà passées par les garde-fous (citation exacte, aucun jugement).
  const [partial, setPartial] = useState<TimelineResult['events']>([])
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  // File d'attente : chaque entrée est chaînée à la précédente, même si les clics s'enchaînent.
  const queue = useRef<Promise<Entry[]>>(Promise.resolve([]))
  const log_ = (action: string, details: string) => {
    queue.current = queue.current.then((prev) => appendEntry(prev, t(ACTOR, ACTOR_EN), action, details))
    return queue.current.then(setLog)
  }
  useEffect(() => {
    verifyLog(log).then(setIntegrity)
  }, [log])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const checklist = useMemo(() => computeChecklist(intake).map((c) => localizeRule(lang, c)), [intake, lang])
  const pseudo = useMemo(() => pseudonymize(notes), [notes])

  const toggleConsent = async (k: keyof Consent) => {
    const v = !consent[k]
    setConsent({ ...consent, [k]: v })
    await log_(v ? t('Consentement accordé', 'Consent granted') : t('Consentement retiré', 'Consent withdrawn'), labels[k][0])
  }

  const generate = async () => {
    setLoading(true)
    await log_(t('Chronologie demandée à l’IA', 'Timeline requested from the AI'), t(`Texte pseudonymisé (${pseudo.count} identifiants masqués)`, `Pseudonymized text (${pseudo.count} identifiers masked)`))
    const t0 = performance.now()
    let j: TimelineApiResponse | null = null
    setPartial([])
    try {
      const r = await fetch(API_TIMELINE, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson, application/json' }, body: JSON.stringify({ notes: pseudo.text }) })
      if (r.body && (r.headers.get('content-type') ?? '').includes('application/x-ndjson')) {
        // Affichage progressif : chaque ligne vérifiée s'affiche dès qu'elle arrive ; le résultat final fait foi.
        const reader = r.body.getReader()
        const dec = new TextDecoder()
        let buf = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buf += dec.decode(value, { stream: true })
          let i
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i).trim()
            buf = buf.slice(i + 1)
            if (!line) continue
            const m = JSON.parse(line)
            if (m.type === 'event') setPartial((p) => [...p, m.event])
            else if (m.type === 'reset') setPartial([])
            else if (m.type === 'final') j = m as TimelineApiResponse
          }
        }
      } else {
        j = (await r.json()) as TimelineApiResponse
      }
    } catch {
      j = null
    }
    setPartial([])
    if (j?.live) {
      setTimeline(j.result)
      setSource('live')
      setAiMeta({ label: j.label, model: j.model, latencyMs: j.latencyMs, removed: j.removed })
      await log_(t('Chronologie IA reçue (en direct)', 'AI timeline received (live)'), t(`${j.model} · ${j.result.events.length} événements · ${j.removed.length} retirés par les garde-fous`, `${j.model} · ${j.result.events.length} events · ${j.removed.length} removed by the guardrails`))
    } else if (j && j.error === 'identifiers') {
      // Le serveur a trouvé un identifiant direct : rien n'est envoyé au modèle, rien n'est affiché.
      setTimeline(null)
      setSource('blocked')
      setAiMeta({ found: j.found })
      await log_(t('Envoi à l’IA bloqué', 'Sending to the AI blocked'), t(`Identifiants détectés : ${(j.found ?? []).map((f) => f.label).join(', ')}`, `Identifiers detected: ${(j.found ?? []).map((f) => identifierLabel(lang, f.label)).join(', ')}`))
    } else {
      await new Promise((res) => setTimeout(res, Math.max(0, 1400 - (performance.now() - t0))))
      setTimeline(TIMELINE_FIXTURE)
      setSource('fixture')
      setAiMeta({ reason: j?.error ?? 'unreachable' })
      await log_(t('Réponse IA pré-enregistrée affichée', 'Pre-recorded AI response shown'), t(`IA indisponible (${j?.error ?? 'unreachable'})`, `AI unavailable (${j?.error ?? 'unreachable'})`))
    }
    setDecisions({})
    setLoading(false)
  }

  const decide = async (key: string, label: string, d: Decision) => {
    setDecisions((prev) => ({ ...prev, [key]: d }))
    await log_(d === 'ok' ? t('Suggestion IA validée', 'AI suggestion validated') : t('Suggestion IA rejetée', 'AI suggestion rejected'), label)
  }

  // La réponse pré-enregistrée suit la langue de l'interface ; une réponse en direct s'affiche telle quelle.
  const shown = source === 'fixture' ? timelineFixture(lang) : timeline
  const quote = (q: string) => t(`« ${q} »`, `“${q}”`)

  const canProceed = consent.examen
  const next = (label: string, onClick?: () => void | Promise<void>, disabled?: boolean) => (
    <div className="mt-10 flex items-center justify-between border-t border-rule pt-6">
      <button
        onClick={() => setStep(Math.max(0, step - 1))}
        className={`btn btn-quiet -ml-3 ${step === 0 ? 'invisible' : ''}`}
      >
        <ArrowLeft size={16} strokeWidth={1.75} /> {t('Retour', 'Back')}
      </button>
      <button
        id="next"
        disabled={disabled}
        onClick={async () => {
          await onClick?.()
          setStep(step + 1)
        }}
        className="press group inline-flex min-h-12 items-center gap-3 rounded-xl bg-ink px-5 text-left text-base font-bold text-paper hover:bg-north disabled:cursor-not-allowed disabled:bg-panel disabled:text-ink-3"
      >
        {label}
        <ArrowRight size={16} strokeWidth={1.75} className="transition-transform duration-150 ease-[var(--ease-out-soft)]" />
      </button>
    </div>
  )

  return (
    <div className="min-h-dvh">
      <div className="no-print border-b border-alert/20 bg-alert-soft px-3 py-2 text-center text-alert">
        <span className="eyebrow">{t('Données 100 % fictives · prototype · règles non validées cliniquement · ne pas utiliser en soins réels', '100% fictional data · prototype · rules not clinically validated · do not use in real care')}</span>
      </div>

      <header className="no-print sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-stretch">
          <a href="#/" className="press flex items-center border-r border-rule px-5 py-3">
            <Wordmark />
          </a>
          <div className="hidden flex-1 items-center px-5 text-sm text-ink-2 md:flex">
            {t('Dossier', 'File')} <span className="mx-1.5 text-ink">#DEMO-0042</span> {t('· cas fictif « Léa » · centre désigné (fictif)', '· fictional case “Léa” · designated centre (fictional)')}
          </div>
          <div className="flex items-center gap-2 border-l border-rule px-5">
            <span className="hidden items-center gap-1.5 rounded-full border border-rule px-2 py-1 text-sm text-ink-2 sm:inline-flex">
              <Sparkles size={13} strokeWidth={1.75} className="text-north" /> {t("L'IA suggère, l'humain valide", 'The AI suggests, a human validates')}
            </span>
            <span
              id="integrity-chip"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm transition-colors duration-150 ${integrity.ok ? 'border-north/30 bg-north-soft text-north' : 'border-alert/40 bg-alert-soft text-alert'}`}
            >
              <Link2 size={13} strokeWidth={1.75} />
              {log.length} · {integrity.ok ? t('intègre', 'intact') : t(`altéré #${integrity.brokenAt}`, `altered #${integrity.brokenAt}`)}
            </span>
            <LangSwitch full />
          </div>
        </div>
        <nav aria-label={t('Étapes', 'Steps')} className="mx-auto flex max-w-6xl border-t border-rule md:grid md:grid-cols-5">
          {STEPS.map(({ label: fr, en, icon: Icon }, i) => {
            const label = t(fr, en)
            const active = step === i
            const reached = i < step
            return (
              <button
                key={label}
                id={`tab-${i}`}
                disabled={i > 0 && !canProceed}
                aria-current={active ? 'step' : undefined}
                aria-label={t(`Étape ${i + 1} : ${label}`, `Step ${i + 1}: ${label}`)}
                onClick={() => setStep(i)}
                className={`press relative flex min-h-12 items-center gap-2 border-r border-rule px-3 text-left text-[15px] last:border-r-0 disabled:cursor-not-allowed disabled:text-ink-3 sm:px-4 ${active ? 'min-w-0 flex-1 text-ink' : 'text-ink-2 hover:bg-panel hover:text-ink'}`}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm font-bold transition-colors duration-150 ${active ? 'border-ink bg-ink text-paper' : reached ? 'border-north bg-north text-paper' : 'border-edge'}`}>
                  {reached ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className={`truncate font-bold ${active ? '' : 'hidden md:inline'}`}>{label}</span>
                <Icon size={16} strokeWidth={1.75} className="ml-auto hidden text-ink-3 lg:block" />
                <span className={`absolute inset-x-0 -bottom-px h-0.5 bg-north ${active ? '' : 'hidden'}`} />
              </button>
            )
          })}
        </nav>
      </header>

      <main key={step} className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-14">
        {step === 0 && (
          <Section n="01" title={t('Consentement, étape par étape', 'Consent, step by step')} lead={t('La personne garde le contrôle. Chaque choix est horodaté dans le journal de conservation.', 'The person stays in control. Each choice is timestamped in the chain-of-custody log.')}>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
              {(Object.keys(CONSENT_LABELS) as (keyof Consent)[]).map((k) => (
                <label
                  key={k}
                  id={`consent-${k}`}
                  className={`rise press group flex cursor-pointer gap-4 p-6 ${consent[k] ? 'bg-north-soft' : 'bg-paper hover:bg-panel'}`}
                >
                  <input type="checkbox" className="peer sr-only" checked={consent[k]} onChange={() => toggleConsent(k)} />
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-150 ease-[var(--ease-out-soft)] ${consent[k] ? 'border-north bg-north text-paper' : 'border-ink-3/50 bg-paper group-hover:border-ink'}`}>
                    <Check size={14} strokeWidth={2.5} className={`transition-all duration-150 ${consent[k] ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-medium">{labels[k][0]}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">{labels[k][1]}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-6 flex items-start gap-2 text-[15px] text-ink-2">
              <ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" />
              {t("Rappel au soignant : proposer l'intervenante psychosociale du centre désigné, le CAVAC et le CALACS. Aucune décision n'est requise ce soir.", 'Reminder for the care team: offer the designated centre’s psychosocial support worker, the CAVAC and the CALACS. No decision is needed tonight.')}
            </p>
            {next(canProceed ? t('Continuer', 'Continue') : t("Consentement à l'examen requis", 'Consent to the exam required'), undefined, !canProceed)}
          </Section>
        )}

        {step === 1 && (
          <Section n="02" title={t('Dossier guidé', 'Guided intake')} lead={t("Les questions s'adaptent aux réponses. « Je ne sais pas » est une réponse valide.", 'The questions adapt to the answers. “I don’t know” is a valid answer.')}>
            <div className="rise rounded-2xl border border-rule p-6">
              <div className="eyebrow text-ink-3">{t('Temps écoulé depuis les faits', 'Time since the events')}</div>
              <div className="mt-3 flex flex-wrap items-end gap-6">
                <span className="display text-6xl tabular-nums sm:text-7xl">{intake.hoursSince}<span className="ml-1 text-3xl text-ink-3">h</span></span>
                <input
                  id="hours"
                  type="range"
                  min={1}
                  max={168}
                  value={intake.hoursSince}
                  onChange={(e) => setIntake({ ...intake, hoursSince: +e.target.value })}
                  aria-label={t('Heures écoulées depuis les faits', 'Hours since the events')}
                  className="range mb-1 w-full max-w-md"
                />
              </div>
            </div>
            <div className="mt-6 divide-y divide-rule rounded-2xl border border-rule">
              <YesNo id="q-substance" q={t('Une substance est-elle soupçonnée (drogue, médicament, alcool à son insu) ?', 'Is a substance suspected (drug, medication, alcohol without the person’s knowledge)?')} v={intake.substance} set={(v) => setIntake({ ...intake, substance: v })} />
              <div className={`grid transition-all duration-150 ease-[var(--ease-out-soft)] ${intake.substance !== false ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="flex items-start gap-3 bg-north-soft px-6 py-4 text-[15px] text-ink-2">
                    <Sparkles size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-north" />
                    {t('Question ajoutée : symptômes observés (étourdissement, amnésie, somnolence), à noter sans interpréter. Les deux prélèvements toxicologiques entrent dans la checklist', 'Question added: observed symptoms (dizziness, amnesia, drowsiness), to be noted without interpretation. Both toxicology samples are added to the checklist')}{intake.substance === null ? t(', par prudence, marqués « à confirmer »', ', as a precaution, marked “to be confirmed”') : ''}.
                  </div>
                </div>
              </div>
              <YesNo id="q-exposure" q={t('Exposition possible à des liquides biologiques ?', 'Possible exposure to bodily fluids?')} v={intake.exposure} set={(v) => setIntake({ ...intake, exposure: v })} />
              <YesNo id="q-pregnancy" q={t('Risque de grossesse ?', 'Risk of pregnancy?')} v={intake.pregnancyRisk} set={(v) => setIntake({ ...intake, pregnancyRisk: v })} />
              <YesNo id="q-showered" q={t('Douche ou bain depuis les faits ?', 'Shower or bath since the events?')} v={intake.showered} set={(v) => setIntake({ ...intake, showered: v })} />
              <YesNo id="q-injuries" q={t('Lésions visibles ?', 'Visible injuries?')} v={intake.injuries} set={(v) => setIntake({ ...intake, injuries: v })} />
            </div>
            {next(t('Voir les prélèvements prioritaires', 'See priority samples'), () => log_(t('Dossier guidé complété', 'Guided intake completed'), t(`${intake.hoursSince} h depuis les faits · substance : ${answerLabel('fr', intake.substance)}`, `${intake.hoursSince} h since the events · substance: ${answerLabel('en', intake.substance)}`)))}
          </Section>
        )}

        {step === 2 && (
          <Section n="03" title={t(`Prélèvements prioritaires, ${intake.hoursSince}\u00A0h après les faits`, `Priority samples, ${intake.hoursSince}\u00A0h after the events`)} lead={t('Calculé par un moteur de règles, sans IA. Trié par urgence.', 'Calculated by a rules engine, without AI. Sorted by urgency.')}>
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
              <ClipboardList size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <span>
                <b>{rulesWarning(lang)}</b> {t('« Ne sait pas » inclut la règle par prudence, marquée « à confirmer ».', '“Don’t know” includes the rule as a precaution, marked “to be confirmed”.')} <span className="text-sm">{rulesVersion(lang)}</span>
              </span>
            </div>
            {!consent.prelevements && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-alert/30 bg-alert-soft px-4 py-3 text-sm text-alert">
                <Lock size={16} strokeWidth={1.75} /> {t('Consentement aux prélèvements non accordé : liste informative, rien ne peut être coché.', 'Consent to samples not granted: for information only, nothing can be checked off.')}
              </div>
            )}
            <ul className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule" id="checklist">
              {checklist.map((c) => {
                const disabled = !consent.prelevements || c.status === 'depasse'
                return (
                  <li key={c.id} className={`rise flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-150 sm:flex-nowrap sm:px-5 ${done[c.id] ? 'bg-north-soft' : 'bg-paper'}`}>
                    <button
                      disabled={disabled}
                      aria-pressed={!!done[c.id]}
                      aria-label={t(`Marquer ${c.label}`, `Mark ${c.label}`)}
                      onClick={async () => {
                        setDone((d) => ({ ...d, [c.id]: !d[c.id] }))
                        await log_(done[c.id] ? t('Prélèvement décoché', 'Sample unchecked') : t('Prélèvement effectué et scellé', 'Sample collected and sealed'), c.label)
                      }}
                      className="press grid h-11 w-11 shrink-0 place-items-center rounded-full disabled:cursor-not-allowed"
                    >
                      <span className={`grid h-7 w-7 place-items-center rounded-full border-2 ${done[c.id] ? 'border-north bg-north text-paper' : disabled ? 'border-rule' : 'border-edge'}`}>
                        {done[c.id] && <Check size={15} strokeWidth={2.75} />}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1 basis-[calc(100%-4rem)] sm:basis-auto">
                      <div className="text-base font-bold leading-snug">{c.label}</div>
                      <div className="text-[15px] leading-snug text-ink-2">{c.why}</div>
                      {c.uncertain && <div className="mt-0.5 text-sm font-bold text-warn">{t('À confirmer : incluse par prudence (réponse « ne sait pas »)', 'To be confirmed: included as a precaution (“don’t know” answer)')}</div>}
                    </div>
                    <Badge status={c.status} remaining={c.remainingH} />
                  </li>
                )
              })}
            </ul>
            {next(t('Construire la chronologie', 'Build the timeline'))}
          </Section>
        )}

        {step === 3 && (
          <Section n="04" title={t('Chronologie assistée par IA', 'AI-assisted timeline')} lead={t("L'IA range les notes. Elle ne juge pas, ne désigne personne. Chaque ligne cite sa source et attend votre validation.", 'The AI organizes the notes. It does not judge and does not name anyone. Each line cites its source and awaits your validation.')}>
            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="eyebrow text-ink-3">{t('Notes libres', 'Free-text notes')}</span>
                  <button id="ai-view" onClick={() => setShowAiView(!showAiView)} className="press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-edge px-3 text-sm font-bold text-ink-2 hover:border-north hover:text-north">
                    {showAiView ? <EyeOff size={13} strokeWidth={1.75} /> : <Eye size={13} strokeWidth={1.75} />}
                    {showAiView ? t('Notes originales', 'Original notes') : t('Ce que l’IA voit', 'What the AI sees')}
                  </button>
                </div>
                {showAiView ? (
                  <div className="rise min-h-80 rounded-2xl border border-north/40 bg-north-soft p-4 text-[15px] leading-relaxed whitespace-pre-wrap" id="ai-view-panel">
                    <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-north">
                      <Fingerprint size={14} strokeWidth={1.75} /> {t(`Texte réellement envoyé au modèle · ${pseudo.count} identifiants masqués`, `Text actually sent to the model · ${pseudo.count} identifiers masked`)}
                    </div>
                    {pseudo.text.split(/(\[[A-ZÉ ]+\])/g).map((part, i) =>
                      /^\[[A-ZÉ ]+\]$/.test(part) ? (
                        <mark key={i} className="rounded bg-north px-1 text-sm text-paper">{part}</mark>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                  </div>
                ) : (
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-sizing-content min-h-80 w-full resize-none rounded-2xl border border-rule bg-paper p-4 text-[15px] leading-relaxed outline-none transition-colors duration-150 focus:border-ink" />
                )}
                <button id="generate" onClick={generate} disabled={loading} className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[15px] font-medium text-paper hover:bg-north disabled:opacity-60">
                  <Sparkles size={16} strokeWidth={1.75} className={loading ? '' : ''} />
                  {loading ? t('Structuration en cours…', 'Structuring…') : t('Générer la chronologie', 'Generate the timeline')}
                </button>
                <p className="mt-2 text-[13px] leading-snug text-ink-2">{t('Seul le texte pseudonymisé (« Ce que l’IA voit ») part vers AMD Token Factory (modèle ouvert sur GPU AMD), qui le conserve environ 2 jours. Données fictives uniquement.', 'Only the pseudonymized text (“What the AI sees”) is sent to AMD Token Factory (open model on AMD GPUs), which keeps it for about 2 days. Fictional data only.')}</p>
              </div>
              <div id="timeline">
                {!shown && !loading && (
                  <div className="grid h-full min-h-80 place-items-center rounded-2xl border border-dashed border-rule p-6 text-center text-sm text-ink-3">
                    {t('La chronologie proposée apparaîtra ici,', 'The proposed timeline will appear here,')}<br />{t('ligne par ligne, avec ses sources.', 'line by line, with its sources.')}
                  </div>
                )}
                {loading && (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-2">
                      {partial.length
                        ? t('Lignes reçues au fil de l’eau, déjà vérifiées (citation exacte, aucun jugement). Validation possible quand tout est arrivé.', 'Lines arrive as they are generated, already checked (exact quote, no judgement). You can validate once everything has arrived.')
                        : t('Le modèle structure les notes : les lignes apparaissent au fur et à mesure (30 à 60 secondes au total).', 'The model is structuring the notes: lines appear as they come (30 to 60 seconds in total).')}
                    </p>
                    {partial.length > 0 && (
                      <ol id="timeline-partial" className="relative ml-2 space-y-2 border-l border-rule">
                        {partial.map((ev, i) => (
                          <li key={`p-${i}`} className="rise relative ml-5">
                            <span className="absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full border-2 border-paper bg-ink-3" />
                            <div className="rounded-xl border border-rule bg-paper px-4 py-3">
                              <div className="text-sm font-bold text-ink-2">{ev.time}</div>
                              <div className="text-[15px] font-medium">{ev.description}</div>
                              <div className="mt-0.5 text-sm italic text-ink-2">{quote(ev.source)} · {ev.origin}</div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                    {[0, 1].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                  </div>
                )}
                {source === 'blocked' && !loading && (
                  <div id="ai-blocked" className="rise rounded-2xl border border-alert/40 bg-alert-soft p-5 text-[15px] text-alert">
                    <div className="flex items-center gap-2 font-medium"><Lock size={16} strokeWidth={1.75} /> {t('Envoi à l’IA bloqué par le serveur', 'Sending to the AI blocked by the server')}</div>
                    <p className="mt-2 text-ink-2">
                      {t('Identifiant direct encore présent : ', 'Direct identifier still present: ')}{(aiMeta?.found ?? []).map((f) => `${identifierLabel(lang, f.label)} (${f.count})`).join(', ')}{t('. Rien n’a été envoyé au modèle. Retirez-le des notes, puis relancez.', '. Nothing was sent to the model. Remove it from the notes, then try again.')}
                    </p>
                  </div>
                )}
                {shown && !loading && (
                  <div className="space-y-4">
                    <div id="ai-source" className={`flex flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${source === 'live' ? 'border-north/30 bg-north-soft text-north' : 'border-warn/40 bg-warn-soft text-warn'}`}>
                      <Sparkles size={13} strokeWidth={1.75} />
                      {source === 'live'
                        ? t(`Réponse IA en direct · ${aiMeta?.label} · ${aiMeta?.model} · ${((aiMeta?.latencyMs ?? 0) / 1000).toFixed(1)} s`, `Live AI response · ${aiMeta?.label} · ${aiMeta?.model} · ${((aiMeta?.latencyMs ?? 0) / 1000).toFixed(1)} s`)
                        : t(`Réponse IA PRÉ-ENREGISTRÉE (${fallbackReason(lang, aiMeta?.reason ?? '') ?? 'IA indisponible'}) : même format, calculée sur le cas fictif d’origine, pas sur vos modifications`, `PRE-RECORDED AI response (${fallbackReason(lang, aiMeta?.reason ?? '') ?? 'AI unavailable'}): same format, computed on the original fictional case, not on your edits`)}
                    </div>
                    <p className="flex items-start gap-1.5 text-sm text-ink-2">
                      <ShieldCheck size={13} strokeWidth={1.75} className="mt-px shrink-0" />
                      {t('Suggestions non vérifiées : chaque citation a été retrouvée mot pour mot dans les notes, mais rien n’entre au dossier sans votre validation.', 'Unverified suggestions: each quote was found word for word in the notes, but nothing goes into the record without your validation.')}
                    </p>
                    {source === 'live' && (aiMeta?.removed?.length ?? 0) > 0 && (
                      <details id="ai-removed" className="rounded-xl border border-rule bg-panel px-3 py-2 text-sm text-ink-2">
                        <summary className="cursor-pointer font-medium">{t(`${aiMeta!.removed!.length} suggestion(s) écartée(s) automatiquement par les garde-fous`, `${aiMeta!.removed!.length} suggestion(s) automatically discarded by the guardrails`)}</summary>
                        <ul className="mt-2 space-y-1">
                          {aiMeta!.removed!.map((r, i) => <li key={i}>{t(`« ${r.text} » : ${r.reason}`, `“${r.text}”: ${removedReason(lang, r.reason)}`)}</li>)}
                        </ul>
                      </details>
                    )}
                    <ol className="relative ml-2 space-y-2 border-l border-rule">
                      {shown.events.map((ev, i) => {
                        const key = `ev-${i}`
                        const d = decisions[key] ?? 'pending'
                        return (
                          <li key={key} className="rise relative ml-5">
                            <span className={`absolute -left-[26px] top-4 h-2.5 w-2.5 rounded-full border-2 border-paper transition-colors duration-150 ${d === 'ok' ? 'bg-north' : d === 'rejected' ? 'bg-alert' : 'bg-ink-3'}`} />
                            <div className={`flex flex-col gap-2 rounded-xl border px-4 py-3 transition-all duration-150 sm:flex-row sm:justify-between sm:gap-3 ${d === 'ok' ? 'border-north/40 bg-north-soft' : d === 'rejected' ? 'border-alert/30 bg-alert-soft opacity-60' : 'border-rule bg-paper'}`}>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-ink-2">{ev.time}</div>
                                <div className={`text-[15px] font-medium ${d === 'rejected' ? 'line-through' : ''}`}>{ev.description}</div>
                                <div className="mt-0.5 text-sm italic text-ink-2">{quote(ev.source)} · {ev.origin}</div>
                              </div>
                              <Validate d={d} onOk={() => decide(key, ev.description, 'ok')} onNo={() => decide(key, ev.description, 'rejected')} />
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                    {shown.gaps.map((g, i) => (
                      <div key={`gap-${i}`} id={`gap-${i}`} className="rise rounded-xl border border-dashed border-ink-3/50 bg-panel px-4 py-3 text-[14px]">
                        <div className="flex items-center gap-1.5 font-medium"><Clock size={15} strokeWidth={1.75} /> {t('Information non disponible : ', 'Information not available: ')}{g.from} → {g.to}</div>
                        <div className="mt-1 text-ink-2">{g.note}</div>
                      </div>
                    ))}
                    {shown.inconsistencies.map((c, i) => {
                      const key = `inc-${i}`
                      const d = decisions[key] ?? 'pending'
                      return (
                        <div key={key} id={`inc-${i}`} className={`rise rounded-xl border px-4 py-3 text-[14px] transition-colors duration-150 ${d === 'ok' ? 'border-north/40 bg-north-soft' : 'border-warn/40 bg-warn-soft'}`}>
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-3">
                            <span className="flex items-center gap-1.5 font-bold text-warn"><ShieldAlert size={15} strokeWidth={1.75} /> {t('Incohérence du dossier (pas du récit)', 'Inconsistency in the record (not in the account)')}</span>
                            <Validate d={d} okLabel={t('Corrigé', 'Corrected')} onOk={() => decide(key, c.description, 'ok')} onNo={() => decide(key, c.description, 'rejected')} />
                          </div>
                          <div className="mt-1">{c.description}</div>
                          <div className="mt-1 text-ink-2">→ {c.suggestion}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            {next(t("Préparer l'export", 'Prepare the export'))}
          </Section>
        )}

        {step === 4 && (
          <ExportView
            log={log}
            integrity={integrity}
            consent={consent}
            intake={intake}
            done={done}
            timeline={shown}
            decisions={decisions}
            onExport={() => log_(t('Export du dossier', 'Record exported'), t('Résumé + journal', 'Summary + log'))}
          />
        )}
      </main>
    </div>
  )
}

function ExportView(props: {
  log: Entry[]
  integrity: { ok: boolean; brokenAt: number | null }
  consent: Consent
  intake: Intake
  done: Record<string, boolean>
  timeline: TimelineResult | null
  decisions: Record<string, Decision>
  onExport: () => void
}) {
  const { log, integrity, consent, intake, done, timeline, decisions } = props
  const { t, lang } = useLang()
  const labels = consentLabels(lang)
  const [tamper, setTamper] = useState<{ ok: boolean; brokenAt: number | null } | null>(null)
  const validated = timeline?.events.filter((_, i) => decisions[`ev-${i}`] === 'ok') ?? []
  const checklist = computeChecklist(intake).map((c) => localizeRule(lang, c))

  const download = () => {
    props.onExport()
    const blob = new Blob([JSON.stringify({ avertissement: t('DONNÉES FICTIVES', 'FICTIONAL DATA'), regles: rulesWarning(lang), versionRegles: rulesVersion(lang), consent, intake, checklist, chronologieValidee: validated, journal: log }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'dossier-DEMO-0042.json'
    a.click()
  }
  const simulateTamper = async () => {
    if (log.length < 2) return
    const copy = log.map((e) => ({ ...e }))
    copy[1].details = copy[1].details + t(' (modifié après coup)', ' (modified afterwards)')
    setTamper(await verifyLog(copy))
  }

  return (
    <Section n="05" title={t('Export du dossier', 'Record export')} lead={t("Résumé pour l'équipe et journal de chaîne de conservation. Rien n'est transmis à la police sans consentement explicite.", 'Summary for the team and chain-of-custody log. Nothing is released to the police without explicit consent.')}>
      <div id="integrity-badge" className={`rise flex items-center gap-3 rounded-2xl border px-5 py-4 ${integrity.ok ? 'border-north/40 bg-north-soft text-north' : 'border-alert/40 bg-alert-soft text-alert'}`}>
        {integrity.ok ? <ShieldCheck size={22} strokeWidth={1.75} /> : <ShieldAlert size={22} strokeWidth={1.75} />}
        <span className="text-[17px] font-medium">
          {integrity.ok ? t(`Intégrité du journal vérifiée : ${log.length} entrées chaînées par SHA-256`, `Log integrity verified: ${log.length} entries chained with SHA-256`) : t(`Journal altéré à l'entrée ${integrity.brokenAt}`, `Log altered at entry ${integrity.brokenAt}`)}
        </span>
      </div>
      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
        <div className="bg-paper p-6">
          <div className="eyebrow text-ink-3">{t('Résumé', 'Summary')}</div>
          <dl className="mt-4 space-y-3 text-[15px]">
            <Row k={t('Délai depuis les faits', 'Time since the events')} v={`${intake.hoursSince} h`} />
            <Row k={t('Consentements', 'Consents')} v={Object.entries(consent).map(([k, v]) => `${labels[k as keyof Consent][0]} ${v ? '✓' : '✗'}`).join(' · ')} />
            <Row k={t('Prélèvements effectués', 'Samples collected')} v={checklist.filter((c) => done[c.id]).map((c) => c.label).join(', ') || t('aucun', 'none')} />
            <Row k={t('Événements validés', 'Validated events')} v={`${validated.length} / ${timeline?.events.length ?? 0}`} />
            <Row k={t('Règles', 'Rules')} v={rulesVersion(lang)} />
          </dl>
          <div className={`mt-5 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${consent.transmission ? 'bg-north-soft text-north' : 'bg-alert-soft text-alert'}`}>
            <Lock size={15} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            {consent.transmission ? t('Transmission à la police autorisée par la personne.', 'Release to the police authorized by the person.') : t('Transmission à la police non autorisée : le dossier reste au centre désigné.', 'Release to the police not authorized: the record stays at the designated centre.')}
          </div>
        </div>
        <div className="min-w-0 bg-paper p-6">
          <div className="eyebrow text-ink-3">{t('Journal de conservation', 'Chain-of-custody log')}</div>
          <ol className="mt-4 space-y-2.5 text-sm" id="custody-log">
            {log.map((e) => (
              <li key={e.index} className="border-l border-rule pl-3">
                <span className="text-ink-3">#{e.index} {e.timestamp.slice(11, 19)}</span> <span className="text-ink">{e.action}</span> · {e.details}
                <div className="text-ink-3">sha256 {e.hash.slice(0, 16)}… ← {e.prevHash.slice(0, 8)}…</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="no-print mt-6 flex flex-wrap gap-2">
        <button onClick={download} className="press inline-flex min-h-12 items-center gap-2 rounded-xl bg-ink px-4 text-[15px] font-bold text-paper hover:bg-north">
          <Download size={15} strokeWidth={1.75} /> {t('Exporter (JSON)', 'Export (JSON)')}
        </button>
        <button onClick={() => { props.onExport(); window.print() }} className="press inline-flex min-h-12 items-center gap-2 rounded-xl border border-ink px-4 text-[15px] font-bold hover:bg-panel">
          <Printer size={15} strokeWidth={1.75} /> {t('Imprimer / PDF', 'Print / PDF')}
        </button>
        <button id="tamper" onClick={simulateTamper} className="press inline-flex min-h-12 items-center gap-2 rounded-xl border border-alert/50 px-4 text-[15px] font-bold text-alert hover:bg-alert-soft">
          <ShieldAlert size={15} strokeWidth={1.75} /> {t('Simuler une modification après coup', 'Simulate a later modification')}
        </button>
      </div>
      {tamper && (
        <div id="tamper-result" className="rise mt-4 flex items-start gap-2 rounded-xl border border-alert/40 bg-alert-soft px-4 py-3 text-sm text-alert">
          <ShieldAlert size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
          {tamper.ok ? t('Aucune altération détectée.', 'No alteration detected.') : t(`Altération détectée à l'entrée #${tamper.brokenAt} : la chaîne d'empreintes ne correspond plus. Le dossier original reste intact.`, `Alteration detected at entry #${tamper.brokenAt}: the hash chain no longer matches. The original record remains intact.`)}
        </div>
      )}
    </Section>
  )
}

function Section({ n, title, lead, children }: { n: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="rise eyebrow text-north">{n} / 05</div>
      <h1 className="rise rise-1 display mt-3 max-w-3xl text-4xl sm:text-5xl">{title}</h1>
      <p className="rise rise-2 mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">{lead}</p>
      <div className="mt-10">{children}</div>
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-3">
      <dt className="font-bold text-ink-2 sm:font-normal">{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

const answerLabel = (lang: Lang, v: Answer) =>
  lang === 'en' ? (v === null ? 'don’t know' : v ? 'yes' : 'no') : v === null ? 'ne sait pas' : v ? 'oui' : 'non'

// Oui / Non / Ne sait pas : trois réponses distinctes. « Ne sait pas » reste visible jusque dans la checklist.
function YesNo({ id, q, v, set }: { id: string; q: string; v: Answer; set: (v: Answer) => void }) {
  const { t } = useLang()
  const opts: [Answer, string][] = [[true, t('Oui', 'Yes')], [false, t('Non', 'No')], [null, t('Ne sait pas', 'Don’t know')]]
  const idx = opts.findIndex(([o]) => o === v)
  return (
    <div id={id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <span className="text-[16px]">{q}</span>
      <div role="radiogroup" aria-label={q} className="relative grid w-full grid-cols-3 rounded-xl border border-edge bg-panel p-0.5 text-[15px] font-bold sm:inline-grid sm:w-auto">
        <span className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded bg-ink transition-transform duration-150 ease-[var(--ease-out-soft)]" style={{ transform: `translateX(${idx * 100}%)` }} />
        {opts.map(([o, l]) => (
          <button key={l} role="radio" aria-checked={o === v} onClick={() => set(o)} className={`press relative z-10 min-h-11 px-3 transition-colors duration-150 ${o === v ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

function Badge({ status, remaining }: { status: Status; remaining: number | null }) {
  const { t } = useLang()
  const map: Record<Status, [string, string]> = {
    urgent: ['border-warn/40 bg-warn-soft text-warn', `Urgent · ${remaining} h`],
    possible: ['border-north/30 bg-north-soft text-north', `Possible · ${remaining} h`],
    depasse: ['border-rule bg-panel text-ink-3', t(`Dépassé de ${remaining !== null ? -remaining : 0} h`, `Overdue by ${remaining !== null ? -remaining : 0} h`)],
    'sans-delai': ['border-rule bg-paper text-ink-2', t('Dès que possible', 'As soon as possible')],
  }
  return <span className={`ml-14 inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-bold sm:ml-0 ${map[status][0]}`}><Clock size={12} strokeWidth={1.75} />{map[status][1]}</span>
}

function Validate({ d, onOk, onNo, okLabel: okLabelProp }: { d: Decision; onOk: () => void; onNo: () => void; okLabel?: string }) {
  const { t } = useLang()
  const okLabel = okLabelProp ?? t('Valider', 'Validate')
  if (d !== 'pending')
    return (
      <span className={`rise inline-flex h-fit shrink-0 items-center gap-1 text-sm font-medium ${d === 'ok' ? 'text-north' : 'text-alert'}`}>
        {d === 'ok' ? <Check size={13} strokeWidth={2.25} /> : <X size={13} strokeWidth={2.25} />} {d === 'ok' ? t('validé', 'validated') : t('rejeté', 'rejected')}
      </span>
    )
  return (
    <span className="flex h-fit shrink-0 gap-2">
      <button onClick={onOk} aria-label={okLabel} className="validate press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-north px-4 text-sm font-bold text-north hover:bg-north hover:text-paper">
        <Check size={13} strokeWidth={2.25} /> {okLabel}
      </button>
      <button onClick={onNo} aria-label={t('Rejeter', 'Reject')} className="press grid h-11 w-11 place-items-center rounded-full border border-edge text-ink-2 hover:border-alert hover:text-alert">
        <X size={13} strokeWidth={2.25} />
      </button>
    </span>
  )
}
