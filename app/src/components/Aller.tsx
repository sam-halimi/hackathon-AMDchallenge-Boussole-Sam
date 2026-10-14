import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BadgeCheck, Clock, ExternalLink, HeartHandshake, List, Map as MapIcon, MapPin, Navigation, Phone, Scale, Stethoscope } from 'lucide-react'
import { LigneAide } from './ui'
import { RESOURCES, type Resource } from '../lib/resources'
import { computeChecklist, type Answer } from '../lib/rules'
import type { Kind } from '../lib/fiche'
import { useLang } from '../lib/i18n'
import { resource, ruleLabel, rulesWarning } from '../lib/en'
import { nextReview, RESOURCES_VERIFIED } from '../lib/site'

const ResourceMap = lazy(() => import('./ResourceMap'))
const NB = '\u00A0'

/* ───────────── Où aller (liste et carte) ───────────── */

const FILTERS = [
  { id: 'all', label: ['Tout', 'All'], icon: MapPin },
  { id: 'exam', label: ['Examens médicaux', 'Medical exams'], icon: Stethoscope },
  { id: 'support', label: ['Soutien psychologique', 'Psychological support'], icon: HeartHandshake },
  { id: 'legal', label: ['Juridique', 'Legal'], icon: Scale },
] as const

// Une couleur par catégorie, la même sur les repères de la carte (ResourceMap), dans la liste et dans la légende.
type Pair = readonly [string, string]
const KINDS: Record<Resource['kind'], { label: Pair; group: Pair; all: Pair; badge: string; text: string }> = {
  exam: { label: ['Examens médicaux', 'Medical exams'], group: ['Examens et soins', 'Exams and care'], all: ['lieux d’examen et de soins', 'exam and care locations'], badge: 'bg-sky-ink', text: 'text-sky-ink' },
  support: { label: ['Soutien psychologique', 'Psychological support'], group: ['Écoute et soutien psychologique', 'Listening and psychological support'], all: ['services d’écoute et de soutien', 'listening and support services'], badge: 'bg-sage-ink', text: 'text-sage-ink' },
  legal: { label: ['Juridique', 'Legal'], group: ['Droits, justice, aide financière', 'Rights, justice, financial help'], all: ['services juridiques et d’aide financière', 'legal and financial help services'], badge: 'bg-warn', text: 'text-warn' },
}
// Sous « Tout », chaque catégorie montre ses premiers services ; un bouton ouvre la catégorie entière.
const APERCU = 3
const ORDER: Resource['kind'][] = ['exam', 'support', 'legal']

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)')
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}

// Sur téléphone, la liste et la carte sont deux vues : la carte n'est plus prise dans le défilement de la page,
// et elle n'est chargée que si on la demande. Sur grand écran, elles restent côte à côte.
export default function Aller({ hoursSince, substance, initial }: { hoursSince: number | null; substance: Answer; initial: Kind }) {
  const [filter, setFilter] = useState<Kind>(initial)
  const [view, setView] = useState<'liste' | 'carte'>('liste')
  const [active, setActive] = useState<string | undefined>()
  const wide = useWide()
  const { t, lang, locale } = useLang()
  const k = lang === 'fr' ? 0 : 1
  const verified = new Date(`${RESOURCES_VERIFIED}T12:00:00`).toLocaleDateString(locale, { dateStyle: 'long' })
  const review = nextReview().toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const items = useMemo(() => RESOURCES.filter((r) => filter === 'all' || r.kind === filter).map((r) => resource(lang, r)), [filter, lang])
  const urgent = hoursSince !== null ? computeChecklist({ hoursSince, substance, exposure: true, pregnancyRisk: true, injuries: false, showered: false }).filter((c) => c.status === 'urgent' || c.status === 'possible') : []
  const chosen = items.find((r) => r.id === active)
  const showMap = wide || view === 'carte'

  useEffect(() => {
    if (active) document.getElementById(wide ? `res-${active}` : 'fiche-carte')?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [active, wide])

  const select = (id: string) => { setActive(id); if (!wide) setView('carte') }
  const openKind = (kd: Kind) => {
    setFilter(kd); setActive(undefined)
    requestAnimationFrame(() => document.getElementById('liste')?.scrollIntoView({ behavior: 'instant', block: 'start' }))
  }

  return (
    <div>
      <h1 className="display text-[2rem] sm:text-5xl">{t('Des personnes formées vous attendent.', 'Trained people are waiting for you.')}</h1>
      <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-2 sm:mt-3">{t(`En cas de doute, appelez d’abord Info-aide violence sexuelle (24${NB}h/24)${NB}: elle vous oriente vers le bon centre.`, 'If in doubt, call Info-aide violence sexuelle first (24/7): they will direct you to the right centre.')}</p>
      <p className="mt-3 inline-flex items-start gap-2 rounded-2xl bg-sage-soft px-3 py-2 text-sm font-bold leading-snug text-sage-ink"><BadgeCheck size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" /> <span>{t(`Ressources vérifiées le ${verified}, prochaine vérification en ${review}`, `Resources checked on ${verified}, next check in ${review}`)}</span></p>

      {hoursSince !== null && urgent.length > 0 && (
        <div className="fade-in mt-5 rounded-[24px] bg-warn-soft p-4 sm:p-5">
          <p className="flex items-start gap-2 text-base font-extrabold leading-snug text-warn"><Clock size={18} strokeWidth={2.25} className="mt-0.5 shrink-0" /> <span>{t(`Il y a ${hoursSince}${NB}h : des examens sont encore possibles`, `${hoursSince}${NB}h ago: exams are still possible`)}</span></p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {urgent.slice(0, 4).map((c) => (
              <li key={c.id} className="rounded-2xl bg-white px-3 py-2 text-[15px] leading-snug">{ruleLabel(lang, c.id, c.label)} · <b>≈{NB}{c.remainingH}{NB}h</b>{c.uncertain && <span className="font-bold text-warn"> · {t('à confirmer', 'to be confirmed')}</span>}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-snug text-warn">{rulesWarning(lang)} {t('« À confirmer » : affiché parce que vous avez répondu « Je ne sais pas ».', '“To be confirmed”: shown because you answered “I don’t know”.')}</p>
        </div>
      )}

      <div className="mt-5"><LigneAide id="call-ligne-aller" detail={t('Info-aide violence sexuelle · gratuit · confidentiel · 24 h/24', 'Info-aide violence sexuelle · free · confidential · 24/7')} /></div>

      <h2 className="mt-7 text-lg font-extrabold">{t('Que cherchez-vous ?', 'What are you looking for?')}</h2>
      <div role="group" aria-label={t('Catégories', 'Categories')} className="mt-3 grid grid-cols-2 gap-2 lg:flex">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button key={id} id={`filtre-${id}`} onClick={() => { setFilter(id); setActive(undefined) }} aria-pressed={filter === id} className={`btn justify-start px-4 text-left ${filter === id ? 'btn-primary' : 'btn-plain'}`}>
            <Icon size={18} strokeWidth={2} className="shrink-0" /> {label[k]}
          </button>
        ))}
      </div>

      {!wide && (
        <div role="group" aria-label={t('Affichage', 'View')} className="mt-3 grid grid-cols-2 rounded-full bg-panel p-1">
          {([['liste', t('Liste', 'List'), List], ['carte', t('Carte', 'Map'), MapIcon]] as const).map(([v, l, Icon]) => (
            <button key={v} id={`vue-${v}`} onClick={() => setView(v)} aria-pressed={view === v} className={`btn min-h-11 ${view === v ? 'bg-white text-ink shadow-[0_6px_14px_-10px_rgba(45,36,64,.6)]' : 'btn-quiet'}`}>
              <Icon size={18} strokeWidth={2} /> {l}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {(wide || view === 'liste') && (
          <div id="liste" className="min-w-0 scroll-mt-32 space-y-6 lg:order-1">
            {ORDER.filter((kd) => items.some((r) => r.kind === kd)).map((kd) => {
              const group = items.filter((r) => r.kind === kd)
              const shown = filter === 'all' ? group.filter((r, n) => n < APERCU || r.id === active) : group
              return (
                <section key={kd} aria-labelledby={`groupe-${kd}`}>
                  <h2 id={`groupe-${kd}`} className={`text-base font-extrabold ${KINDS[kd].text}`}>{KINDS[kd].group[k]}</h2>
                  <ul className="mt-2 space-y-3">
                    {shown.map((r) => <ResourceCard key={r.id} r={r} n={items.indexOf(r) + 1} active={r.id === active} onSelect={() => select(r.id)} />)}
                  </ul>
                  {shown.length < group.length && (
                    <button id={`tout-${kd}`} onClick={() => openKind(kd)} className="btn btn-soft mt-3 w-full">{t('Voir les', 'See all')} {group.length} {KINDS[kd].all[k]}</button>
                  )}
                </section>
              )
            })}
          </div>
        )}
        {showMap && (
          <div className="min-w-0 lg:sticky lg:top-32 lg:order-2 lg:self-start">
            <div className="h-[min(60dvh,440px)] overflow-hidden rounded-[24px] border-4 border-white shadow-[0_20px_40px_-28px_rgba(45,36,64,.5)] lg:h-[clamp(320px,calc(100dvh-14rem),640px)]" id="map">
              <Suspense fallback={<div className="skeleton grid h-full w-full place-items-center text-base text-ink-2">{t('Chargement de la carte…', 'Loading the map…')}</div>}>
                <ResourceMap items={items} active={active} onSelect={setActive} confirmLabel={t('à confirmer', 'to be confirmed')} />
              </Suspense>
            </div>
            <ul aria-label={t('Légende', 'Legend')} className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
              {ORDER.map((kd) => {
                const Icon = FILTERS.find((f) => f.id === kd)!.icon
                return <li key={kd} className={`inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0_6px_14px_-12px_rgba(45,36,64,.6)] ${KINDS[kd].text}`}><span className={`grid h-6 w-6 place-items-center rounded-full text-white ${KINDS[kd].badge}`}><Icon size={14} strokeWidth={2.25} /></span> {KINDS[kd].label[k]}</li>
              })}
            </ul>
            {!wide && (
              <div id="fiche-carte" className="mt-4 scroll-mb-24">
                {chosen
                  ? <ul><ResourceCard r={chosen} n={items.indexOf(chosen) + 1} active onSelect={() => undefined} /></ul>
                  : <p className="rounded-2xl bg-panel px-4 py-3 text-base text-ink-2">{t('Touchez un repère pour voir la fiche du lieu. Les services sans adresse publique sont dans la liste.', 'Tap a pin to see the place’s details. Services without a public address are in the list.')}</p>}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mt-6 text-sm leading-relaxed text-ink-2">{t('Carte : OpenStreetMap. Sources : CIUSSS de Montréal, CVASM, SPVM (2026), sites officiels des organismes, vérifiés le 4 octobre 2026. « À confirmer » : information qu’aucune source officielle n’a encore confirmée. Adresses confidentielles non affichées. Vérifiez les horaires par téléphone.', 'Map: OpenStreetMap. Sources: CIUSSS de Montréal, CVASM, SPVM (2026), official websites of the organizations, checked on October 4, 2026. “To be confirmed”: information that no official source has confirmed yet. Confidential addresses are not shown. Check opening hours by phone.')}</p>
    </div>
  )
}

function ResourceCard({ r, n, active, onSelect }: { r: Resource; n: number; active: boolean; onSelect: () => void }) {
  const { t, lang } = useLang()
  const kind = KINDS[r.kind]
  const l = lang === 'fr' ? 0 : 1
  const placed = Boolean(r.lat && r.lng)
  return (
    <li id={`res-${r.id}`} className={`rounded-[24px] bg-white p-4 sm:p-5 ${active ? 'shadow-[inset_0_0_0_2px_var(--color-north)]' : 'shadow-[0_14px_30px_-26px_rgba(45,36,64,.5)]'}`}>
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${kind.badge}`}>{n}</span>
        <span className={`text-sm font-extrabold ${kind.text}`}>{kind.label[l]}</span>
      </div>
      <h3 className="mt-1 text-lg font-extrabold leading-snug">
        {placed
          ? <button onClick={onSelect} title={t('Voir sur la carte', 'See on the map')} className="press -mx-1 flex min-h-11 w-full items-center rounded-lg px-1 py-1 text-left">{r.name}</button>
          : r.name}
      </h3>
      <p className="mt-1 text-base leading-normal text-ink-2">{r.what}</p>
      <ul className="mt-3 space-y-1.5 text-base leading-snug">
        {r.address && <li className="flex gap-2"><MapPin size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-ink-2" /> <span translate="no">{r.address}</span></li>}
        <li className="flex gap-2"><Clock size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-ink-2" /> <span>{r.hours}</span></li>
        {r.note && <li className="flex gap-2 font-bold text-warn"><AlertTriangle size={18} strokeWidth={2} className="mt-0.5 shrink-0" /> <span>{r.note}</span></li>}
      </ul>
      {r.toConfirm && (
        <p className="mt-3 rounded-2xl bg-warn-soft px-3 py-2.5 text-[15px] leading-snug text-warn" data-to-confirm={r.id}>
          <span className="mr-1.5 inline-block rounded-full bg-warn px-2.5 py-0.5 text-sm font-extrabold text-white">{t('À confirmer', 'To be confirmed')}</span>{r.toConfirm}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {r.phone && <a href={`tel:${r.phone}`} className="btn btn-primary basis-full justify-start text-left sm:basis-auto"><Phone size={18} strokeWidth={2.25} className="shrink-0" /> <span translate="no">{r.phoneLabel}</span></a>}
        {r.address && <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(r.address)}`} target="_blank" rel="noreferrer" aria-label={t('Itinéraire Google Maps', 'Directions (Google Maps)')} className="btn btn-soft flex-1 px-4 sm:flex-none"><Navigation size={18} strokeWidth={2} className="shrink-0" /> <span>{t('Itinéraire', 'Directions')}<span className="max-sm:hidden"> Google Maps</span></span></a>}
        {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-plain flex-1 px-4 sm:flex-none"><ExternalLink size={18} strokeWidth={2} className="shrink-0" /> {t('Site', 'Website')}</a>}
      </div>
    </li>
  )
}
