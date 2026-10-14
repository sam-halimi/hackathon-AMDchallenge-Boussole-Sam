import { useState } from 'react'
import { AlertTriangle, ArrowLeft, KeyRound, Lock, LockOpen } from 'lucide-react'
import { Wordmark } from './Logo'
import { Space, Welcome } from './Illustrations'
import { AideDiscrete, EyeToggle, FieldError, TextField } from './ui'
import { EMPTY } from '../lib/fiche'
import { createAccount, isEmail, login, passwordStrength, type VaultSession } from '../lib/vault'

/* ───────────── Création du compte et connexion ───────────── */

type OnOpen = (s: VaultSession, data: unknown, fresh: boolean) => void

function Shell({ bg, art, exit, children }: { bg: string; art: React.ReactNode; exit?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`flex min-h-dvh flex-col ${bg}`}>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2 sm:px-5 sm:py-4">
        <span className="inline-flex min-h-12 items-center"><Wordmark /></span>
        {exit}
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 pb-4 sm:px-5 md:grid-cols-2">
        {art}
        {children}
      </main>
      <footer className="px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]"><AideDiscrete /></footer>
    </div>
  )
}

export function Account({ onBack, onLogin, onOpen, exit }: { onBack: () => void; onLogin: () => void; onOpen: OnOpen; exit?: React.ReactNode }) {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; pass?: string; confirm?: string }>({})
  const [busy, setBusy] = useState(false)
  const strength = passwordStrength(pass)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Chaque erreur s'affiche sous son champ ; le premier champ fautif reçoit le curseur.
    const found: typeof errors = {}
    if (!isEmail(email)) found.email = 'Adresse courriel invalide.'
    if (pass.length < 8) found.pass = 'Le mot de passe doit contenir au moins 8 caractères.'
    else if (pass !== confirm) found.confirm = 'Les deux mots de passe ne correspondent pas.'
    setErrors(found)
    const first = found.email ? 'email' : found.pass ? 'pass1' : found.confirm ? 'pass2' : null
    if (first) return document.getElementById(first)?.focus()
    setBusy(true)
    try {
      const data = { ...EMPTY, prenom: prenom.trim(), journal: [{ at: new Date().toISOString(), action: 'Compte créé' }] }
      const s = await createAccount(email, pass, data)
      onOpen(s, data, true)
    } catch {
      setErrors({ email: 'Un compte existe déjà avec ce courriel sur cet appareil. Connectez-vous.' })
      setBusy(false)
    }
  }
  return (
    <Shell bg="bg-north-soft" exit={exit} art={<Space className="mx-auto hidden w-full max-w-[400px] md:block" />}>
      <form onSubmit={submit} className="sheet-in card-soft p-5 sm:p-9" noValidate>
        <h1 className="display text-3xl sm:text-4xl">Créez votre compte</h1>
        <p className="mt-2 text-base leading-relaxed text-ink-2">Votre récit sera chiffré avec votre mot de passe. Personne d’autre ne peut le lire.</p>
        <div className="mt-5 space-y-4">
          <TextField id="prenom" label="Prénom ou surnom" optional help="Comment voulez-vous qu’on vous appelle ?" value={prenom} onChange={setPrenom} autoComplete="nickname" />
          <TextField id="email" label="Adresse courriel" type="email" inputMode="email" help="Elle sert seulement à retrouver votre espace sur cet appareil. Elle n’est envoyée nulle part." error={errors.email} value={email} onChange={setEmail} placeholder="vous@exemple.com" autoComplete="email" />
          <div>
            <TextField id="pass1" label="Mot de passe" help="8 caractères au minimum." error={errors.pass} type={show ? 'text' : 'password'} value={pass} onChange={setPass} autoComplete="new-password" right={<EyeToggle show={show} set={setShow} />} />
            <div aria-live="polite" className="mt-2">
              <div className="flex gap-1.5" aria-hidden>
                {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${n <= strength.score ? ['', 'bg-coral-ink', 'bg-warn', 'bg-sage-ink'][strength.score] : 'bg-panel'}`} />)}
              </div>
              {strength.label && <p className={`mt-1.5 text-sm font-bold ${['', 'text-coral-ink', 'text-warn', 'text-sage-ink'][strength.score]}`} id="strength">{strength.label}</p>}
            </div>
          </div>
          <TextField id="pass2" label="Confirmer le mot de passe" error={errors.confirm} type={show ? 'text' : 'password'} value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-[15px] leading-snug text-warn">
          <AlertTriangle size={18} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>Bêta de test : n’entrez pas de vraies données. Le compte est stocké sur cet appareil uniquement ; un mot de passe oublié rend le récit illisible.</span>
        </p>
        <button id="create" disabled={busy} className="btn btn-primary btn-lg mt-5 w-full">
          {busy ? 'Création…' : <><Lock size={18} strokeWidth={2.25} /> Créer mon compte</>}
        </button>
        <button type="button" onClick={onLogin} className="btn btn-quiet mt-2 w-full">J’ai déjà un compte · Se connecter</button>
        <button type="button" onClick={onBack} className="btn btn-quiet w-full"><ArrowLeft size={18} strokeWidth={2} /> Revoir la présentation</button>
      </form>
    </Shell>
  )
}

export function Unlock({ onOpen, onIntro, onCreate, exit }: { onOpen: OnOpen; onIntro: () => void; onCreate: () => void; exit?: React.ReactNode }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setEmailError('')
    if (!isEmail(email)) { setEmailError('Adresse courriel invalide.'); return document.getElementById('login-email')?.focus() }
    setBusy(true)
    try { const { session, data } = await login(email, pass); onOpen(session, data, false) } catch { setError('Courriel ou mot de passe incorrect.') }
    setBusy(false)
  }
  return (
    <Shell bg="bg-sage-soft" exit={exit} art={<Welcome className="mx-auto hidden w-full max-w-[400px] md:block" />}>
      <form onSubmit={submit} className="sheet-in card-soft p-5 sm:p-9" noValidate>
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-sage-soft text-sage-ink sm:grid"><KeyRound size={26} strokeWidth={2} /></div>
        <h1 className="display text-3xl sm:mt-5 sm:text-4xl">Bon retour.</h1>
        <p className="mt-2 text-base leading-relaxed text-ink-2">Connectez-vous pour retrouver votre espace.</p>
        <div className="mt-5 space-y-4">
          <TextField id="login-email" label="Adresse courriel" type="email" inputMode="email" error={emailError} value={email} onChange={setEmail} autoFocus autoComplete="email" />
          <TextField id="login-pass" label="Mot de passe" type={show ? 'text' : 'password'} value={pass} onChange={setPass} autoComplete="current-password" right={<EyeToggle show={show} set={setShow} />} />
        </div>
        {error && <FieldError>{error}</FieldError>}
        <button id="login" disabled={busy} className="btn btn-primary btn-lg mt-5 w-full">
          {busy ? 'Connexion…' : <><LockOpen size={18} strokeWidth={2.25} /> Se connecter</>}
        </button>
        <button type="button" onClick={onCreate} className="btn btn-quiet mt-2 w-full">Pas encore de compte · En créer un</button>
        <details className="mt-1 rounded-2xl text-[15px] text-ink-2">
          <summary className="press flex min-h-12 cursor-pointer list-none items-center justify-center rounded-full px-4 font-extrabold [&::-webkit-details-marker]:hidden">Mot de passe oublié ?</summary>
          <p className="rounded-2xl bg-panel px-4 py-3 leading-snug">Il ne peut pas être retrouvé : il n’est enregistré nulle part, c’est lui qui chiffre votre récit. Vous pouvez créer un nouvel espace avec une autre adresse courriel.</p>
        </details>
        <button type="button" onClick={onIntro} className="btn btn-quiet w-full"><ArrowLeft size={18} strokeWidth={2} /> Revoir la présentation</button>
      </form>
    </Shell>
  )
}
