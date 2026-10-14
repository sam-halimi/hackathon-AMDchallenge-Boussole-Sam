import { useEffect, useMemo, useRef, useState } from 'react'
import { FileLock2, Home, Lock, MapPin, PenLine, ShieldCheck, X } from 'lucide-react'
import { Wordmark } from './Logo'
import { fromTri } from '../lib/rules'
import { anyAccount, deleteAccount, saveVault, type VaultSession } from '../lib/vault'
import Intro from './Intro'
import Accueil from './Accueil'
import Recit from './Recit'
import Aller from './Aller'
import Dossier from './Dossier'
import ViePrivee from './ViePrivee'
import Quitter from './Quitter'
import { Account, Unlock } from './Compte'
import { EMPTY, type Fiche, type Kind, type Tab } from '../lib/fiche'
import Etapes from './Etapes'


const NB = '\u00A0'

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
  // Verrouiller annule aussi l'enregistrement en attente : sans cela, un récit effacé dans les 600 ms
  // suivant une saisie était réécrit sur l'appareil.
  const lock = () => { window.clearTimeout(timer.current); setSession(null); setFiche(EMPTY); setSavedAt(null); setEtapes(false); setStage(anyAccount() ? 'unlock' : 'intro') }
  const wipe = () => { window.clearTimeout(timer.current); if (session) deleteAccount(session); lock() }

  const exit = <Quitter lock={lock} />

  if (stage === 'intro') return <Intro exit={exit} onDone={() => setStage(session ? 'app' : 'account')} onHave={() => setStage(session ? 'app' : 'unlock')} />
  if (stage === 'account') return <Account exit={exit} onBack={() => setStage('intro')} onLogin={() => setStage('unlock')} onOpen={open} />
  if (stage === 'unlock') return <Unlock exit={exit} onOpen={open} onIntro={() => setStage('intro')} onCreate={() => setStage('account')} />

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
            {exit}
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
        {tab === 'recit' && <Recit fiche={fiche} update={update} savedAt={savedAt} hoursSince={hoursSince} onWipe={wipe} onNext={() => goTo('aller')} />}
        {tab === 'aller' && <Aller hoursSince={hoursSince} substance={fromTri(fiche.substance)} initial={kind} />}
        {tab === 'dossier' && <Dossier fiche={fiche} hoursSince={hoursSince} onJournal={addJournal} />}
        {tab === 'vie-privee' && (
          <ViePrivee onLock={lock} onWipe={wipe}>
            <p className="mt-3 flex items-start gap-2 rounded-2xl bg-panel px-4 py-3 text-base leading-snug text-ink-2">
              <X size={18} strokeWidth={2.5} className="mt-0.5 shrink-0" />
              <span><b className="text-ink">Quitter</b>, en haut de chaque écran, verrouille votre espace et remplace Boussole par une page de météo. Le bouton «{NB}Retour{NB}» n’y ramène pas, mais l’historique du navigateur garde la trace de la visite : effacez-le, ou utilisez la navigation privée, si l’appareil est partagé.</span>
            </p>
          </ViePrivee>
        )}
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
