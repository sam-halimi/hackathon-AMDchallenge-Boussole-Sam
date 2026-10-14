import { useState } from 'react'
import { AlertTriangle, ArrowLeft, KeyRound, Lock, LockOpen } from 'lucide-react'
import { Wordmark } from './Logo'
import { Space, Welcome } from './Illustrations'
import { AideDiscrete, EyeToggle, FieldError, LangSwitch, TextField } from './ui'
import { useLang } from '../lib/i18n'
import { EMPTY } from '../lib/fiche'
import { createAccount, isEmail, login, passwordStrength, type VaultSession } from '../lib/vault'

/* ───────────── Création du compte et connexion ───────────── */

type OnOpen = (s: VaultSession, data: unknown, fresh: boolean) => void

function Shell({ bg, art, exit, children }: { bg: string; art: React.ReactNode; exit?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`flex min-h-dvh flex-col ${bg}`}>
      {/* En-tête collé en haut : « Quitter » reste visible pendant le défilement du formulaire. */}
      <header className={`sticky top-0 z-30 mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-2 sm:px-5 sm:py-4 ${bg}`}>
        <span className="inline-flex min-h-12 items-center"><Wordmark /></span>
        <div className="flex items-center gap-2"><LangSwitch />{exit}</div>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 pb-4 sm:px-5 md:grid-cols-2">
        {art}
        {children}
      </main>
      <footer className="mx-auto w-full max-w-md px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"><AideDiscrete /></footer>
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
  const { t } = useLang()
  const strengthLabel = ['', t('Trop court (8 caractères minimum)', 'Too short (8 characters minimum)'), t('Moyen : ajoutez un chiffre ou une majuscule', 'Medium: add a number or a capital letter'), t('Fort', 'Strong')][strength.score]
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Chaque erreur s'affiche sous son champ ; le premier champ fautif reçoit le curseur.
    const found: typeof errors = {}
    if (!isEmail(email)) found.email = t('Adresse courriel invalide.', 'Invalid email address.')
    if (pass.length < 8) found.pass = t('Le mot de passe doit contenir au moins 8 caractères.', 'The password must be at least 8 characters long.')
    else if (pass !== confirm) found.confirm = t('Les deux mots de passe ne correspondent pas.', 'The two passwords don’t match.')
    setErrors(found)
    const first = found.email ? 'email' : found.pass ? 'pass1' : found.confirm ? 'pass2' : null
    if (first) return document.getElementById(first)?.focus()
    setBusy(true)
    try {
      const data = { ...EMPTY, prenom: prenom.trim(), journal: [{ at: new Date().toISOString(), action: 'Compte créé' }] }
      const s = await createAccount(email, pass, data)
      onOpen(s, data, true)
    } catch {
      setErrors({ email: t('Un compte existe déjà avec ce courriel sur cet appareil. Connectez-vous.', 'An account already exists with this email on this device. Please sign in.') })
      setBusy(false)
    }
  }
  return (
    <Shell bg="bg-north-soft" exit={exit} art={<Space className="mx-auto hidden w-full max-w-[400px] md:block" />}>
      <form onSubmit={submit} className="sheet-in card-soft p-5 sm:p-9" noValidate>
        <h1 className="display text-3xl sm:text-4xl">{t('Créez votre compte', 'Create your account')}</h1>
        <p className="mt-2 text-base leading-relaxed text-ink-2">{t('Votre récit sera chiffré avec votre mot de passe. Personne d’autre ne peut le lire.', 'Your story will be encrypted with your password. No one else can read it.')}</p>
        <div className="mt-5 space-y-4">
          <TextField id="prenom" label={t('Prénom ou surnom', 'First name or nickname')} optional help={t('Comment voulez-vous qu’on vous appelle ?', 'What would you like us to call you?')} value={prenom} onChange={setPrenom} autoComplete="nickname" />
          <TextField id="email" label={t('Adresse courriel', 'Email address')} type="email" inputMode="email" help={t('Elle sert seulement à retrouver votre espace sur cet appareil. Elle n’est envoyée nulle part.', 'It is only used to find your space on this device. It is never sent anywhere.')} error={errors.email} value={email} onChange={setEmail} placeholder="vous@exemple.com" autoComplete="email" />
          <div>
            <TextField id="pass1" label={t('Mot de passe', 'Password')} help={t('8 caractères au minimum.', 'At least 8 characters.')} error={errors.pass} type={show ? 'text' : 'password'} value={pass} onChange={setPass} autoComplete="new-password" right={<EyeToggle show={show} set={setShow} />} />
            <div aria-live="polite" className="mt-2">
              <div className="flex gap-1.5" aria-hidden>
                {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-150 ${n <= strength.score ? ['', 'bg-coral-ink', 'bg-warn', 'bg-sage-ink'][strength.score] : 'bg-panel'}`} />)}
              </div>
              {strengthLabel && <p className={`mt-1.5 text-sm font-bold ${['', 'text-coral-ink', 'text-warn', 'text-sage-ink'][strength.score]}`} id="strength">{strengthLabel}</p>}
            </div>
          </div>
          <TextField id="pass2" label={t('Confirmer le mot de passe', 'Confirm password')} error={errors.confirm} type={show ? 'text' : 'password'} value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-[15px] leading-snug text-warn">
          <AlertTriangle size={18} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{t('Bêta de test : n’entrez pas de vraies données. Le compte est stocké sur cet appareil uniquement ; un mot de passe oublié rend le récit illisible.', 'Test beta: don’t enter real information. The account is stored on this device only; a forgotten password makes the story unreadable.')}</span>
        </p>
        <button id="create" disabled={busy} className="btn btn-primary btn-lg mt-5 w-full">
          {busy ? t('Création…', 'Creating…') : <><Lock size={18} strokeWidth={2.25} /> {t('Créer mon compte', 'Create my account')}</>}
        </button>
        <button type="button" onClick={onLogin} className="btn btn-quiet mt-2 w-full">{t('J’ai déjà un compte · Se connecter', 'I already have an account · Sign in')}</button>
        <button type="button" onClick={onBack} className="btn btn-quiet w-full"><ArrowLeft size={18} strokeWidth={2} /> {t('Revoir la présentation', 'See the introduction again')}</button>
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
  const { t } = useLang()
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setEmailError('')
    if (!isEmail(email)) { setEmailError(t('Adresse courriel invalide.', 'Invalid email address.')); return document.getElementById('login-email')?.focus() }
    setBusy(true)
    try { const { session, data } = await login(email, pass); onOpen(session, data, false) } catch { setError(t('Courriel ou mot de passe incorrect.', 'Incorrect email or password.')) }
    setBusy(false)
  }
  return (
    <Shell bg="bg-sage-soft" exit={exit} art={<Welcome className="mx-auto hidden w-full max-w-[400px] md:block" />}>
      <form onSubmit={submit} className="sheet-in card-soft p-5 sm:p-9" noValidate>
        <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-sage-soft text-sage-ink sm:grid"><KeyRound size={26} strokeWidth={2} /></div>
        <h1 className="display text-3xl sm:mt-5 sm:text-4xl">{t('Bon retour.', 'Welcome back.')}</h1>
        <p className="mt-2 text-base leading-relaxed text-ink-2">{t('Connectez-vous pour retrouver votre espace.', 'Sign in to get back to your space.')}</p>
        <div className="mt-5 space-y-4">
          <TextField id="login-email" label={t('Adresse courriel', 'Email address')} type="email" inputMode="email" error={emailError} value={email} onChange={setEmail} autoFocus autoComplete="email" />
          <TextField id="login-pass" label={t('Mot de passe', 'Password')} type={show ? 'text' : 'password'} value={pass} onChange={setPass} autoComplete="current-password" right={<EyeToggle show={show} set={setShow} />} />
        </div>
        {error && <FieldError>{error}</FieldError>}
        <button id="login" disabled={busy} className="btn btn-primary btn-lg mt-5 w-full">
          {busy ? t('Connexion…', 'Signing in…') : <><LockOpen size={18} strokeWidth={2.25} /> {t('Se connecter', 'Sign in')}</>}
        </button>
        <button type="button" onClick={onCreate} className="btn btn-quiet mt-2 w-full">{t('Pas encore de compte · En créer un', 'No account yet · Create one')}</button>
        <details className="mt-1 rounded-2xl text-[15px] text-ink-2">
          <summary className="press flex min-h-12 cursor-pointer list-none items-center justify-center rounded-full px-4 font-extrabold [&::-webkit-details-marker]:hidden">{t('Mot de passe oublié ?', 'Forgot your password?')}</summary>
          <p className="rounded-2xl bg-panel px-4 py-3 leading-snug">{t('Il ne peut pas être retrouvé : il n’est enregistré nulle part, c’est lui qui chiffre votre récit. Vous pouvez créer un nouvel espace avec une autre adresse courriel.', 'It can’t be recovered: it isn’t stored anywhere, it is what encrypts your story. You can create a new space with another email address.')}</p>
        </details>
        <button type="button" onClick={onIntro} className="btn btn-quiet w-full"><ArrowLeft size={18} strokeWidth={2} /> {t('Revoir la présentation', 'See the introduction again')}</button>
      </form>
    </Shell>
  )
}
