import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, EyeOff, FileLock2, Fingerprint, Home, Lock, MapPin, PenLine, ServerOff, ShieldCheck, Sparkles, Trash2, X } from 'lucide-react'
import { Wordmark } from './Logo'
import { fromTri } from '../lib/rules'
import { anyAccount, deleteAccount, saveVault, type VaultSession } from '../lib/vault'
import Intro from './Intro'
import Accueil from './Accueil'
import Recit from './Recit'
import Aller from './Aller'
import Dossier from './Dossier'
import { Account, Unlock } from './Compte'
import { EMPTY, type Fiche, type Kind, type Tab } from '../lib/fiche'
import Etapes from './Etapes'


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
