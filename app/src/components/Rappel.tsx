import { useMemo, useState } from 'react'
import { CalendarCheck, CalendarPlus, HeartHandshake, Languages, MessageSquareOff, Phone, ShieldCheck, Users, Video } from 'lucide-react'
import { FieldError, OptionList } from './ui'
import { useLang } from '../lib/i18n'
import { option } from '../lib/en'

// Choix d'un créneau de rappel par un service juridique spécialisé (simulé en bêta).
// Il y a toujours des créneaux : aujourd'hui (au plus tôt dans 1 h) jusqu'à 21 h, et demain de 8 h à 21 h.
function slotsFor(day: Date, from: number) {
  const out: Date[] = []
  for (let h = 8; h <= 20; h++) for (const m of [0, 30]) {
    const d = new Date(day); d.setHours(h, m, 0, 0)
    if (d.getTime() >= from) out.push(d)
  }
  return out
}
const fmtTime = (d: Date, locale: string) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
const fmtDay = (d: Date, locale: string) => d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
// Majuscule au premier mot seulement : « Mercredi 14 octobre ».
const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export type Booking = { at: string; mode: 'tel' | 'video'; phone: string; prefs: string[] }

const PREFS = {
  'Une avocate (femme) si possible': HeartHandshake,
  'Un ou une interprète': Languages,
  'Une personne de confiance peut être présente': Users,
  'Pas de message vocal laissé': MessageSquareOff,
}
// Les six premiers horaires d'abord : assez pour choisir, sans mur de boutons.
const FIRST = 6

export default function Rappel({ onConfirm }: { onConfirm: (b: Booking) => void }) {
  const now = useMemo(() => new Date(), [])
  const today = useMemo(() => slotsFor(now, now.getTime() + 60 * 60 * 1000), [now])
  const tomorrow = useMemo(() => { const t = new Date(now); t.setDate(t.getDate() + 1); return slotsFor(t, 0) }, [now])
  const [day, setDay] = useState<0 | 1>(today.length ? 0 : 1)
  const [slot, setSlot] = useState<Date | null>(null)
  const [more, setMore] = useState(false)
  const [mode, setMode] = useState<'tel' | 'video'>('tel')
  const [phone, setPhone] = useState('+1 ')
  const [prefs, setPrefs] = useState<string[]>(['Pas de message vocal laissé'])
  const [done, setDone] = useState<Booking | null>(null)
  const { t, lang, locale } = useLang()
  const list = day === 0 ? today : tomorrow
  const visible = more ? list : list.slice(0, FIRST)
  const validPhone = /^\+1[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/.test(phone.trim())
  const dayWord = day === 0 ? t('aujourd’hui', 'today') : t('demain', 'tomorrow')

  const ics = (b: Booking) => {
    const start = new Date(b.at); const end = new Date(start.getTime() + 45 * 60000)
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boussole//FR', 'BEGIN:VEVENT', `DTSTART:${f(start)}`, `DTEND:${f(end)}`, 'SUMMARY:Appel (rendez-vous personnel)', 'DESCRIPTION:Rappel simulé (bêta Boussole).', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'rendez-vous.ics'; a.click()
  }

  if (done) {
    const d = new Date(done.at)
    return (
      <div className="sheet-in rounded-[28px] bg-sage-soft p-5 sm:p-6" id="rappel-ok">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-ink text-white"><CalendarCheck size={24} strokeWidth={2} /></span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-sage-ink">{t('Rendez-vous confirmé (simulé)', 'Appointment confirmed (simulated)')}</p>
            <p className="display text-2xl">{sentence(fmtDay(d, locale))}, <span className="whitespace-nowrap">{fmtTime(d, locale)}</span></p>
          </div>
        </div>
        <p className="mt-4 text-base leading-relaxed text-ink-2">
          {lang === 'fr'
            ? <>Un avocat ou une avocate spécialisée en violences sexuelles vous {done.mode === 'tel' ? 'appellera' : 'enverra un lien vidéo'} à cette heure-là. L’appel dure environ 30 à 45 minutes. Vous pouvez faire une pause, refuser une question ou raccrocher à tout moment : on vous rappellera quand vous voulez.</>
            : <>A lawyer specialized in sexual violence will {done.mode === 'tel' ? 'call you' : 'send you a video link'} at that time. The call lasts about 30 to 45 minutes. You can take a break, refuse a question or hang up at any time: we will call you back whenever you want.</>}
        </p>
        <div className="mt-4 grid gap-2 sm:flex">
          <button onClick={() => ics(done)} className="btn btn-plain"><CalendarPlus size={18} strokeWidth={2} /> {t('Ajouter à mon agenda', 'Add to my calendar')}</button>
          <button onClick={() => setDone(null)} className="btn btn-quiet">{t('Changer le créneau', 'Change the time')}</button>
        </div>
      </div>
    )
  }

  return (
    <section className="sheet-in card-soft p-5 sm:p-8" id="rappel" aria-labelledby="rappel-titre">
      <p className="text-sm font-extrabold text-north">{t('Dernière étape', 'Last step')}</p>
      <h2 id="rappel-titre" className="display mt-1 text-2xl sm:text-3xl">{t('Quand souhaitez-vous être rappelée ?', 'When would you like to be called back?')}</h2>
      <p className="mt-2 text-base leading-relaxed text-ink-2">{t('Un avocat ou une avocate formée aux violences sexuelles vous appelle pour parler de votre dossier, à votre rythme, en tenant compte de ce que vous vivez.', 'A lawyer trained in sexual violence calls you to talk about your file, at your own pace, taking into account what you are going through.')}</p>

      <div role="group" aria-label={t('Jour', 'Day')} className="mt-5 grid grid-cols-2 rounded-full bg-panel p-1">
        {([[t('Aujourd’hui', 'Today'), today.length], [t('Demain', 'Tomorrow'), tomorrow.length]] as const).map(([l, n], k) => (
          <button key={l} disabled={!n} aria-pressed={day === k} onClick={() => { setDay(k as 0 | 1); setSlot(null); setMore(false) }} className={`btn min-h-11 ${day === k ? 'bg-ink text-white' : 'btn-quiet'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label={t('Créneaux disponibles', 'Available times')}>
        {visible.map((d) => {
          const on = slot?.getTime() === d.getTime()
          return <button key={d.getTime()} role="radio" aria-checked={on} onClick={() => setSlot(d)} className={`slot btn whitespace-nowrap px-1 ${on ? 'btn-primary' : 'btn-soft'}`}>{fmtTime(d, locale)}</button>
        })}
      </div>
      {!more && list.length > FIRST && (
        <button onClick={() => setMore(true)} className="btn btn-quiet mt-1 w-full">{t('Voir plus d’horaires', 'See more times')}</button>
      )}

      <h3 className="mt-5 text-[15px] font-bold">{t('Par téléphone ou en vidéo ?', 'By phone or video?')}</h3>
      <div role="radiogroup" aria-label={t('Par téléphone ou en vidéo', 'By phone or video')} className="mt-2 grid gap-2 sm:grid-cols-2">
        {([['tel', t('Par téléphone', 'By phone'), Phone], ['video', t('En vidéo', 'By video'), Video]] as const).map(([v, l, Icon]) => (
          <button key={v} role="radio" aria-checked={mode === v} onClick={() => setMode(v)} className="option">
            <Icon size={18} strokeWidth={2} className="shrink-0" /> {l}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label htmlFor="rappel-phone" className="block text-[15px] font-bold">{t('Numéro où vous joindre', 'Number where we can reach you')}</label>
        <p id="rappel-phone-aide" className="mt-0.5 text-sm text-ink-2">{t('Format : +1 514 555-0123', 'Format: +1 514 555-0123')}</p>
        <input id="rappel-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" className="input mt-1.5" placeholder="+1 514 555-0123"
          aria-describedby="rappel-phone-aide" aria-invalid={!validPhone && phone.length > 3 ? true : undefined} />
        {!validPhone && phone.length > 3 && <FieldError>{t('Le numéro n’est pas encore complet.', 'The number is not complete yet.')}</FieldError>}
      </div>

      <h3 className="mt-5 text-[15px] font-bold">{t('Ce qui vous mettrait à l’aise', 'What would make you comfortable')}</h3>
      <div className="mt-2">
        <OptionList label={t('Ce qui vous mettrait à l’aise', 'What would make you comfortable')} options={Object.keys(PREFS)} icons={PREFS} display={(o) => option(lang, o)} value={prefs} onToggle={(t) => setPrefs(prefs.includes(t) ? prefs.filter((x) => x !== t) : [...prefs, t])} />
      </div>

      {slot && <p className="mt-5 text-center text-base font-bold" aria-live="polite">{sentence(dayWord)} {t('à', 'at')} {fmtTime(slot, locale)}, {mode === 'tel' ? t('par téléphone', 'by phone') : t('en vidéo', 'by video')}</p>}
      <button id="rappel-confirm" disabled={!slot || !validPhone} onClick={() => { const b = { at: slot!.toISOString(), mode, phone: phone.trim(), prefs }; setDone(b); onConfirm(b) }}
        className={`btn btn-primary btn-lg w-full ${slot ? 'mt-2' : 'mt-5'}`}>
        <CalendarCheck size={18} strokeWidth={2.25} /> {!slot ? t('Choisissez un créneau', 'Choose a time') : !validPhone ? t('Indiquez votre numéro', 'Enter your number') : t('Confirmer ce rendez-vous', 'Confirm this appointment')}
      </button>
      <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-sm leading-snug text-ink-2"><ShieldCheck size={16} strokeWidth={2} className="mt-0.5 shrink-0" /> <span>{t('Bêta : aucun appel réel n’est programmé. En production, le rappel est assuré par un service juridique partenaire.', 'Beta: no real call is scheduled. In production, the call is made by a partner legal service.')}</span></p>
    </section>
  )
}
