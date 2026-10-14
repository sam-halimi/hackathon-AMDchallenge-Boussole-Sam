import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, ClipboardList, Download, EyeOff, FileLock2, Fingerprint, Home, Lock, MapPin, PenLine, Phone, Printer, Scale, Send, ServerOff, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import { Wordmark } from './Logo'
import { RESOURCES } from '../lib/resources'
import { computeChecklist, fromTri, RULES_WARNING } from '../lib/rules'
import { anyAccount, deleteAccount, saveVault, sealForTransfer, type VaultSession } from '../lib/vault'
import Intro from './Intro'
import Accueil from './Accueil'
import Recit from './Recit'
import Aller from './Aller'
import { Account, Unlock } from './Compte'
import { EMPTY, type Fiche, type Kind, type Tab } from '../lib/fiche'
import Etapes from './Etapes'
import Rappel from './Rappel'

const NB = ' '

const TABS = [
  { id: 'accueil', label: 'Accueil', short: 'Accueil', icon: Home },
  { id: 'recit', label: 'Mon récit', short: 'Récit', icon: PenLine },
  { id: 'aller', label: 'Où aller', short: 'Où aller', icon: MapPin },
  { id: 'dossier', label: 'Mon dossier', short: 'Dossier', icon: FileLock2 },
  { id: 'vie-privee', label: 'Vie privée', short: 'Vie privée', icon: ShieldCheck },
] as const

export default function Espace() {
  const [stage, setStage] = useState<'intro' | 'account' | 'unlock' | 'app'>(() => (anyAccount() ? 'unlock' : 'intro'))
  const [etapes, setEtapes] = useState(false)
  const [tab, setTab] = useState<Tab>('accueil')
  const [kind, setKind] = useState<Kind>('all') // filtre d'arrivée dans « Où aller »
  const [session, setSession] = useState<VaultSession | null>(null)
  const [fiche, setFiche] = useState<Fiche>(EMPTY)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => { window.scrollTo(0, 0) }, [tab, stage])

  // Enregistrement automatique, chiffré, 600 ms après la dernière modification
  const update = (patch: Partial<Fiche> | ((f: Fiche) => Partial<Fiche>)) => {
    setFiche((f) => {
      const next = { ...f, ...(typeof patch === 'function' ? patch(f) : patch) }
      if (session) {
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(async () => {
          const s = await saveVault(session, next)
          setSavedAt(s.updatedAt)
        }, 600)
      }
      return next
    })
  }
  const goTo = (t: Tab, k: Kind = 'all') => { setKind(k); setTab(t) }
  const addJournal = (action: string) => update((f) => ({ journal: [...f.journal, { at: new Date().toISOString(), action }] }))

  const hoursSince = useMemo(() => {
    if (!fiche.quand || fiche.quandInconnu) return null
    const h = Math.round((Date.now() - new Date(fiche.quand).getTime()) / 3_600_000)
    return h >= 0 ? h : null
  }, [fiche.quand, fiche.quandInconnu])

  const open = (s: VaultSession, data: unknown, fresh: boolean) => {
    setSession(s); setFiche({ ...EMPTY, ...(data as Partial<Fiche>) }); setSavedAt(fresh ? new Date().toISOString() : null); setTab('accueil'); setStage('app')
    setEtapes(true) // la fenêtre des étapes s'ouvre à chaque arrivée dans le compte
  }
  const lock = () => { setSession(null); setFiche(EMPTY); setSavedAt(null); setEtapes(false); setStage(anyAccount() ? 'unlock' : 'intro') }

  if (stage === 'intro') return <Intro onDone={() => setStage(session ? 'app' : 'account')} onHave={() => setStage(session ? 'app' : 'unlock')} />
  if (stage === 'account') return <Account onBack={() => setStage('intro')} onLogin={() => setStage('unlock')} onOpen={open} />
  if (stage === 'unlock') return <Unlock onOpen={open} onIntro={() => setStage('intro')} onCreate={() => setStage('account')} />

  return (
    <div className="min-h-dvh pb-24 sm:pb-0">
      <header className="no-print sticky top-0 z-30 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-5">
          <button onClick={() => goTo('accueil')} aria-label="Boussole, retour à l’accueil" className="press inline-flex min-h-12 items-center rounded-full pr-2"><Wordmark /></button>
          <span className="hidden rounded-full bg-sun-soft px-3 py-1 text-sm font-bold text-warn sm:inline">Bêta de test</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-sm text-ink-2 md:inline-flex"><Lock size={15} strokeWidth={2} /> {savedAt ? `Chiffré à ${new Date(savedAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}` : 'Chiffré'}</span>
            <button onClick={lock} aria-label="Verrouiller mon espace" className="btn btn-soft max-sm:w-12 max-sm:px-0">
              <Lock size={18} strokeWidth={2.25} /> <span className="max-sm:sr-only">Verrouiller</span>
            </button>
          </div>
        </div>
        <nav aria-label="Rubriques" className="mx-auto hidden max-w-6xl gap-1.5 px-4 pb-2 sm:flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} id={`tab-${id}`} onClick={() => goTo(id)} aria-current={tab === id ? 'page' : undefined} className={`press inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-base font-bold ${tab === id ? 'bg-ink text-white' : 'text-ink-2 hover:bg-panel'}`}>
              <Icon size={18} strokeWidth={2} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main key={tab} className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-10">
        {tab === 'accueil' && <Accueil fiche={fiche} hoursSince={hoursSince} go={goTo} onIntro={() => setEtapes(true)} />}
        {tab === 'recit' && <Recit fiche={fiche} update={update} savedAt={savedAt} hoursSince={hoursSince} onWipe={() => { if (session) deleteAccount(session); lock() }} onNext={() => goTo('aller')} />}
        {tab === 'aller' && <Aller hoursSince={hoursSince} substance={fromTri(fiche.substance)} initial={kind} />}
        {tab === 'dossier' && <Dossier fiche={fiche} hoursSince={hoursSince} onJournal={addJournal} />}
        {tab === 'vie-privee' && <ViePrivee />}
      </main>

      <Etapes open={etapes} onClose={() => setEtapes(false)} prenom={fiche.prenom} go={(t, k) => { setEtapes(false); goTo(t as Tab, k) }} />

      {/* Barre d'onglets mobile : ancrée en bas, claire, au pouce */}
      <nav aria-label="Rubriques" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 px-1">
          {TABS.map(({ id, short, icon: Icon }) => (
            <button key={id} id={`mtab-${id}`} onClick={() => goTo(id)} aria-current={tab === id ? 'page' : undefined} className={`press flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-[clamp(12.5px,3.7vw,14px)] font-extrabold leading-tight tracking-tight ${tab === id ? 'text-north' : 'text-ink-2'}`}>
              <span className={`grid h-8 w-14 place-items-center rounded-full ${tab === id ? 'bg-north-soft' : ''}`}><Icon size={22} strokeWidth={2} /></span>
              {short}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

/* ───────────── Mon dossier ───────────── */

const REBATIR = RESOURCES.find((r) => r.id === 'rebatir')!

function Dossier({ fiche, hoursSince, onJournal }: { fiche: Fiche; hoursSince: number | null; onJournal: (a: string) => void }) {
  const [include, setInclude] = useState({ recit: true, examens: true, besoins: true })
  const [consent, setConsent] = useState({ transmettre: false, beta: false })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [phase, setPhase] = useState(-1)
  const [packet, setPacket] = useState<{ size: number; fingerprint: string; ref: string } | null>(null)
  const checklist = hoursSince !== null ? computeChecklist({ hoursSince, substance: fromTri(fiche.substance), exposure: true, pregnancyRisk: true, injuries: fiche.symptomes.includes('Blessures visibles'), showered: fromTri(fiche.douche) }) : []

  const dossier = {
    avertissement: 'BÊTA DE TEST · DONNÉES NON RÉELLES',
    genereLe: new Date().toISOString(),
    ...(include.recit && { recit: { quand: fiche.quandInconnu ? 'inconnu' : fiche.quand, ou: fiche.ou, souvenirs: fiche.souvenirs, oublis: fiche.oublis, symptomes: fiche.symptomes, substance: fiche.substance, douche: fiche.douche, vetements: fiche.vetements, temoins: fiche.temoins } }),
    ...(include.examens && { examens: checklist.map((c) => ({ examen: c.label, statut: c.status, heuresRestantes: c.remainingH, aConfirmer: c.uncertain })), avertissementRegles: RULES_WARNING }),
    ...(include.besoins && { besoins: fiche.besoins }),
    journal: fiche.journal,
  }
  const sections = [include.recit, include.examens, include.besoins].filter(Boolean).length
  const ready = consent.transmettre && consent.beta && sections > 0

  const send = async () => {
    setConfirmOpen(false)
    setPhase(0)
    const sealed = await sealForTransfer(dossier)
    await wait(900); setPhase(1)
    await wait(900); setPhase(2)
    await wait(1100); setPhase(3)
    const ref = `RB-SIM-${sealed.fingerprint.slice(0, 6).toUpperCase()}`
    setPacket({ ...sealed, ref })
    onJournal(`Envoi simulé à Rebâtir (${ref})`)
  }
  const download = () => {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mon-dossier-boussole-BETA.json'; a.click()
    onJournal('Dossier exporté (JSON)')
  }

  const PHASES = [
    { icon: Lock, label: 'Chiffrement sur votre appareil' },
    { icon: FileLock2, label: 'Paquet scellé, empreinte calculée' },
    { icon: Send, label: 'Transmission à Rebâtir (simulée)' },
    { icon: CheckCircle2, label: 'Accusé de réception (simulé)' },
  ]

  return (
    <div>
      <div className="rise eyebrow text-north">Mon dossier</div>
      <h1 className="rise rise-1 display mt-3 text-4xl sm:text-5xl">Vous décidez de ce qui part.</h1>
      <p className="rise rise-2 mt-3 max-w-2xl text-[17px] leading-relaxed text-ink-2">Boussole assemble votre dossier. Rien ne part sans votre double confirmation. Vous pouvez aussi simplement le garder.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="min-w-0 space-y-4">
          <Card icon={ClipboardList} title="Ce que contient le dossier" tint="north">
            <Toggle label="Mon récit" hint={fiche.souvenirs ? `${fiche.souvenirs.length} caractères` : 'vide pour l’instant'} on={include.recit} set={(v) => setInclude({ ...include, recit: v })} />
            <Toggle label="Examens prioritaires" hint={hoursSince !== null ? `calculés à ${hoursSince}${NB}h` : 'date inconnue'} on={include.examens} set={(v) => setInclude({ ...include, examens: v })} />
            <Toggle label="Mes besoins" hint={fiche.besoins.join(', ') || 'aucun choisi'} on={include.besoins} set={(v) => setInclude({ ...include, besoins: v })} />
          </Card>
          <Card icon={Scale} title="Destinataire" tint="sun">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-warn-soft text-warn"><Scale size={20} strokeWidth={1.75} /></span>
              <div>
                <div className="font-medium">{REBATIR.name}</div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{REBATIR.what}</p>
                <a href={`tel:${REBATIR.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-north hover:underline"><Phone size={14} strokeWidth={1.75} /> {REBATIR.phoneLabel}</a>
              </div>
            </div>
          </Card>
          <Card icon={ShieldCheck} title="Consentement" tint="sage">
            <Check2 id="consent-send" label="Je consens à transmettre ce dossier à Rebâtir." checked={consent.transmettre} onChange={(v) => setConsent({ ...consent, transmettre: v })} />
            <Check2 id="consent-beta" label="Je comprends que c’est une bêta : l’envoi est simulé, rien ne part réellement." checked={consent.beta} onChange={(v) => setConsent({ ...consent, beta: v })} />
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-[28px] bg-panel p-6">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-ink-3">Aperçu</span>
              <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs">{sections} section{sections > 1 ? 's' : ''}</span>
            </div>
            <Apercu id="dossier-apercu" rows={[
              ...(include.recit ? [['Mon récit', fiche.quandInconnu ? 'Date inconnue' : fiche.quand ? new Date(fiche.quand).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }) : 'Date non indiquée', fiche.souvenirs ? `${fiche.souvenirs.length} caractères écrits` : 'Rien d’écrit pour l’instant'] as const] : []),
              ...(include.examens ? [['Examens prioritaires', checklist.length ? checklist.slice(0, 3).map((c) => c.label).join(' · ') : 'Date inconnue : à voir avec l’équipe', `${checklist.length > 3 ? `et ${checklist.length - 3} autre(s). ` : ''}Délais indicatifs, non validés cliniquement.`] as const] : []),
              ...(include.besoins ? [['Mes besoins', fiche.besoins.join(', ') || 'Aucun choisi', ''] as const] : []),
              ['Journal', `${fiche.journal.length} action(s) notée(s)`, 'Toujours inclus'] as const,
            ]} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={download} className="press inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-4 py-2 text-sm hover:border-ink"><Download size={15} strokeWidth={1.75} /> Garder une copie</button>
              <button onClick={() => { onJournal('Dossier imprimé'); window.print() }} className="press inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-4 py-2 text-sm hover:border-ink"><Printer size={15} strokeWidth={1.75} /> Imprimer / PDF</button>
            </div>
          </div>

          {phase < 0 ? (
            <button id="send" disabled={!ready} onClick={() => setConfirmOpen(true)} className="press group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-medium text-paper hover:bg-north disabled:cursor-not-allowed disabled:opacity-30">
              <Send size={18} strokeWidth={1.75} /> Envoyer à Rebâtir
            </button>
          ) : (
            <div className="fade-in card-soft p-6" id="send-progress">
              <ol className="space-y-4">
                {PHASES.map(({ icon: Icon, label }, n) => (
                  <li key={label} className={`flex items-center gap-3 transition-opacity duration-150 ${n <= phase ? 'opacity-100' : 'opacity-35'}`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 ${n < phase || (n === 3 && phase === 3) ? 'bg-north text-paper' : n === phase ? 'bg-ink text-paper' : 'bg-panel text-ink-3'}`}>
                      {n < phase || (n === 3 && phase === 3) ? <Check size={16} strokeWidth={2.25} /> : <Icon size={16} strokeWidth={1.75} className={n === phase ? '' : ''} />}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
              {packet && (
                <div className="fade-in mt-5 rounded-2xl bg-north-soft p-4 text-sm text-north">
                  <div className="font-medium">Référence simulée : <span className="font-mono">{packet.ref}</span></div>
                  <div className="mt-1 font-mono text-[11px] break-all text-north">{packet.size} octets chiffrés · sha256 {packet.fingerprint.slice(0, 32)}…</div>
                  <div className="mt-2 text-ink-2">En production : transmission chiffrée de bout en bout, clé remise séparément, accusé signé.</div>
                </div>
              )}
              {packet && <Rappel onConfirm={(b) => onJournal(`Rappel choisi : ${new Date(b.at).toLocaleString('fr-CA')} (${b.mode === 'tel' ? 'téléphone' : 'vidéo'})`)} />}
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fade-in absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" className="sheet-in relative w-full max-w-md rounded-t-3xl border border-rule bg-paper p-6 sm:rounded-3xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-warn-soft text-warn"><Send size={22} strokeWidth={1.75} /></div>
            <h2 className="display mt-5 text-3xl">Confirmer l’envoi ?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{sections} section{sections > 1 ? 's' : ''} vers <b>Rebâtir</b>. En bêta, l’envoi est simulé : aucune donnée ne quitte votre appareil.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirmOpen(false)} className="press flex-1 rounded-full border border-rule py-3 hover:border-ink">Annuler</button>
              <button id="confirm-send" onClick={send} className="press flex-1 rounded-full bg-ink py-3 font-medium text-paper hover:bg-north">Oui, envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────── Vie privée ───────────── */

function ViePrivee() {
  const promises = [
    { icon: ServerOff, t: 'Vos données restent sur votre appareil', d: 'En bêta, la fiche est stockée uniquement dans votre navigateur. Aucun serveur Boussole ne la reçoit.' },
    { icon: Fingerprint, t: 'Chiffrement avec votre mot de passe', d: 'AES-256-GCM, clé dérivée de votre mot de passe par PBKDF2 (310 000 itérations). Sans lui, la fiche est illisible, y compris pour nous.' },
    { icon: ShieldCheck, t: 'Rien ne part sans vous', d: 'Chaque transmission demande un consentement explicite et une double confirmation. Vous choisissez les sections.' },
    { icon: EyeOff, t: 'Votre nom n’est jamais montré à l’IA', d: 'Côté soignant, les identifiants sont masqués avant tout traitement par l’IA, et c’est visible à l’écran.' },
    { icon: Trash2, t: 'Effacement en un clic', d: '« Tout effacer » supprime la fiche de l’appareil immédiatement et définitivement.' },
    { icon: X, t: 'Aucun pistage', d: 'Pas de cookie publicitaire, pas d’outil d’analyse, pas de revente. Le fond de carte OpenStreetMap est le seul appel externe.' },
    { icon: Sparkles, t: 'L’IA guide, l’humain décide', d: 'L’IA ne pose aucun diagnostic, ne juge pas votre récit et ne désigne personne. Elle range des notes pour l’équipe soignante, qui valide chaque ligne.' },
    { icon: AlertTriangle, t: 'Ce qui reste à confirmer est signalé', d: 'Une information qu’aucune source officielle n’a confirmée porte la mention « À confirmer ». Les délais médicaux sont indicatifs.' },
  ]
  return (
    <div>
      <div className="rise eyebrow text-north">Vie privée</div>
      <h1 className="rise rise-1 display mt-3 max-w-3xl text-4xl sm:text-5xl">Des données parmi les plus sensibles qui soient. On les traite comme telles.</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promises.map(({ icon: Icon, t, d }) => (
          <div key={t} className="rise card-soft p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-north-soft text-north"><Icon size={20} strokeWidth={1.75} /></span>
            <div className="mt-5 text-[17px] font-medium">{t}</div>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-warn/30 bg-warn-soft p-6 text-warn">
        <div className="flex items-center gap-2 font-medium"><AlertTriangle size={18} strokeWidth={1.75} /> Bêta de test</div>
        <p className="mt-2 text-[15px] leading-relaxed">Cette version sert à tester le parcours. N’y entrez pas de vraies données. En production : hébergement au Canada, évaluation des facteurs relatifs à la vie privée (Loi 25), audit de sécurité indépendant, transmission chiffrée de bout en bout.</p>
      </div>
    </div>
  )
}

/* ───────────── Petits composants ───────────── */

const TINTS = {
  north: 'bg-north-soft text-north', coral: 'bg-coral-soft text-coral-ink', sky: 'bg-sky-soft text-sky-ink', sage: 'bg-sage-soft text-sage-ink', sun: 'bg-sun-soft text-warn',
} as const
function Card({ icon: Icon, title, children, wide, tint = 'north' }: { icon: typeof Lock; title: string; children: React.ReactNode; wide?: boolean; tint?: keyof typeof TINTS }) {
  return (
    <section className={`rise card-soft p-6 transition-shadow duration-150 focus-within:shadow-[0_0_0_3px_var(--color-north-soft)] ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="mb-4 flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${TINTS[tint]}`}><Icon size={19} strokeWidth={2} /></span>
        <h2 className="text-[17px] font-extrabold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Apercu({ id, rows }: { id: string; rows: readonly (readonly [string, string, string])[] }) {
  return (
    <dl id={id} className="mt-4 divide-y divide-rule rounded-2xl bg-paper">
      {rows.map(([k, v, hint]) => (
        <div key={k} className="px-4 py-3">
          <dt className="text-sm font-extrabold text-ink">{k}</dt>
          <dd className="mt-0.5 text-[15px] leading-snug text-ink-2">{v}{hint && <span className="block text-xs text-ink-3">{hint}</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

function Check2({ label, checked, onChange, id }: { label: string; checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <label id={id} className="press mt-3 flex cursor-pointer items-start gap-3 rounded-2xl p-1 text-[15px]">
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-150 ${checked ? 'border-north bg-north text-paper' : 'border-ink-3/50'}`}>
        <Check size={13} strokeWidth={2.5} className={`transition-all duration-150 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
      </span>
      {label}
    </label>
  )
}

function Toggle({ label, hint, on, set }: { label: string; hint: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => set(!on)} aria-pressed={on} className="press flex w-full items-center justify-between gap-3 rounded-2xl px-1 py-2.5 text-left">
      <span><span className="block text-[15px]">{label}</span><span className="block text-xs text-ink-3">{hint}</span></span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ${on ? 'bg-north' : 'bg-rule'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-150 ease-[var(--ease-out-soft)] ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  )
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
