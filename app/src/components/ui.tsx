import { AlertTriangle, ArrowRight, Check, Eye, EyeOff, Languages, Phone, ShieldAlert, type LucideIcon } from 'lucide-react'
import { useLang } from '../lib/i18n'

// Petits composants partagés par les écrans de l'espace de la personne.
// Règles communes : zones de clic d'au moins 48 px, texte d'au moins 14 px, contraste AA.

/* Aide immédiate, en version discrète : présente sur les écrans d'arrivée, avant même la création du compte.
   Deux boutons qui disent ce qu'ils appellent : l'écoute gratuite et le 911. */
export function AideDiscrete({ className = '' }: { className?: string }) {
  const { t } = useLang()
  const btn = 'press flex min-h-14 flex-col items-center justify-center rounded-2xl bg-white/85 px-3 py-1.5 text-center leading-tight shadow-[0_6px_16px_-14px_rgba(45,36,64,.8)]'
  return (
    <div role="group" aria-label={t('Aide immédiate', 'Immediate help')} className={`grid grid-cols-2 gap-2 ${className}`}>
      <a href="tel:+18889339007" aria-label={t('Appeler Info-aide violence sexuelle, écoute gratuite 24 h sur 24 : +1 888 933-9007', 'Call Info-aide violence sexuelle, free support line, 24/7: +1 888 933-9007')} className={btn}>
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink-2"><Phone size={14} strokeWidth={2.5} className="text-coral-ink" /> {t('Écoute 24\u00A0h/24', 'Support line 24/7')}</span>
        <span translate="no" className="whitespace-nowrap text-base font-extrabold text-ink">+1 888 933-9007</span>
      </a>
      <a href="tel:911" aria-label={t('Appeler le 911 en cas de danger immédiat', 'Call 911 if you are in immediate danger')} className={btn}>
        <span className="flex items-center gap-1.5 text-sm font-bold text-alert"><ShieldAlert size={14} strokeWidth={2.5} /> {t('Danger immédiat', 'Immediate danger')}</span>
        <span translate="no" className="text-base font-extrabold text-ink">911</span>
      </a>
    </div>
  )
}

/* La ligne d'écoute, en grand : seule surface corail de l'application. */
export function LigneAide({ id, detail }: { id: string; detail: string }) {
  return (
    <a href="tel:+18889339007" id={id} className="press flex items-center gap-3 rounded-[28px] bg-coral p-4 text-ink sm:gap-4 sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/55"><Phone size={22} strokeWidth={2.25} /></span>
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-snug">{detail}</span>
        <span translate="no" className="display block whitespace-nowrap text-[clamp(1.5rem,7vw,1.875rem)]">+1 888 933-9007</span>
      </span>
      <ArrowRight size={22} strokeWidth={2.25} className="ml-auto hidden shrink-0 sm:block" />
    </a>
  )
}

export function Card({ icon: Icon, title, children, className = '' }: { icon: LucideIcon; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card-soft p-5 sm:p-6 ${className}`}>
      <h2 className="mb-3 flex items-center gap-3 text-lg font-extrabold leading-snug">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-north-soft text-north"><Icon size={20} strokeWidth={2} /></span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function TextField({ id, label, optional, help, error, value, onChange, type = 'text', autoFocus, autoComplete, placeholder, inputMode, right }: {
  id: string; label: string; optional?: boolean; help?: string; error?: string; value: string; onChange: (v: string) => void
  type?: string; autoFocus?: boolean; autoComplete?: string; placeholder?: string; inputMode?: 'tel' | 'email' | 'text'; right?: React.ReactNode
}) {
  const described = [help && `${id}-aide`, error && `${id}-erreur`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-bold text-ink">{label}{optional && <span className="font-normal text-ink-2"> (facultatif)</span>}</label>
      {help && <p id={`${id}-aide`} className="mt-0.5 text-sm leading-snug text-ink-2">{help}</p>}
      <div className="relative mt-1.5">
        <input id={id} autoFocus={autoFocus} type={type} inputMode={inputMode} value={value} onChange={(e) => onChange(e.target.value)} className={`input ${right ? 'pr-14' : ''}`}
          autoComplete={autoComplete} placeholder={placeholder} aria-invalid={error ? true : undefined} aria-describedby={described} />
        {right && <span className="absolute right-0.5 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
      {error && <FieldError id={`${id}-erreur`}>{error}</FieldError>}
    </div>
  )
}

export function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm font-bold leading-snug text-alert"><AlertTriangle size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" /> <span>{children}</span></p>
}

export function EyeToggle({ show, set }: { show: boolean; set: (v: boolean) => void }) {
  const { t } = useLang()
  return (
    <button type="button" onClick={() => set(!show)} aria-label={show ? t('Masquer le mot de passe', 'Hide password') : t('Afficher le mot de passe', 'Show password')} aria-pressed={show} className="press grid h-12 w-12 place-items-center rounded-full text-ink-2 hover:bg-panel hover:text-ink">
      {show ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
    </button>
  )
}

/* Case à cocher sur une ligne entière. L'identifiant est porté par la ligne : la toucher coche la case. */
export function Check2({ label, checked, onChange, id, disabled }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; id?: string; disabled?: boolean }) {
  return (
    <label id={id} className={`flex min-h-12 items-center gap-3 rounded-2xl py-1.5 text-base leading-snug ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white transition-colors duration-150 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-north ${checked ? 'bg-north' : 'bg-white shadow-[inset_0_0_0_2px_var(--color-edge)]'}`}>
        {checked && <Check size={16} strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </label>
  )
}

export function Toggle({ label, hint, on, set, disabled }: { label: string; hint: string; on: boolean; set: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={() => set(!on)} className="press flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl py-2 text-left disabled:cursor-not-allowed">
      <span className="min-w-0"><span className="block text-base font-bold">{label}</span><span className="block text-sm leading-snug text-ink-2">{hint}</span></span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-150 ${on ? 'bg-north' : 'bg-edge'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-150 ${on ? 'translate-x-7' : 'translate-x-1'}`} />
      </span>
    </button>
  )
}

/* Liste de réponses à cocher, une par ligne. « single » : une seule réponse, qu'on peut retirer en la touchant à nouveau. */
export function OptionList({ label, options, value, onToggle, single, icons, display }: {
  label: string; options: readonly string[]; value: readonly string[]; onToggle: (v: string) => void; single?: boolean; icons?: Record<string, LucideIcon>
  display?: (v: string) => string
}) {
  return (
    <div role="group" aria-label={label} className="grid gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        const Icon = icons?.[o]
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} aria-pressed={on} className="option">
            <span className={`option-mark ${single ? 'round' : ''}`}><Check size={16} strokeWidth={3} /></span>
            <span className="min-w-0 flex-1">{display ? display(o) : o}</span>
            {Icon && <Icon size={18} strokeWidth={2} className="shrink-0 text-ink-2" />}
          </button>
        )
      })}
    </div>
  )
}

/* Bascule français / anglais. Compacte (FR ou EN) dans les en-têtes, en toutes lettres ailleurs. */
export function LangSwitch({ full = false, className = '' }: { full?: boolean; className?: string }) {
  const { lang, setLang } = useLang()
  const other = lang === 'fr' ? 'en' : 'fr'
  return (
    <button type="button" onClick={() => setLang(other)} lang={other} aria-label={other === 'en' ? 'Switch to English' : 'Passer en français'} className={`btn btn-plain ${full ? '' : 'btn-icon w-12'} ${className}`}>
      {full ? <><Languages size={18} strokeWidth={2} /> {other === 'en' ? 'English' : 'Français'}</> : other.toUpperCase()}
    </button>
  )
}
