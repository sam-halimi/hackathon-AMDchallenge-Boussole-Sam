import { useRef, useState } from 'react'
import { Check, CheckCircle2, ClipboardList, Download, FileLock2, Lock, Phone, Printer, Scale, Send, ShieldCheck } from 'lucide-react'
import Rappel from './Rappel'
import { Card, Check2, Toggle } from './ui'
import { RESOURCES } from '../lib/resources'
import { computeChecklist, fromTri, RULES_WARNING } from '../lib/rules'
import { sealForTransfer } from '../lib/vault'
import { useDialog } from '../lib/useDialog'
import type { Fiche } from '../lib/fiche'

const NB = '\u00A0'
const REBATIR = RESOURCES.find((r) => r.id === 'rebatir')!
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

const PHASES = [
  { icon: Lock, label: 'Chiffrement sur votre appareil' },
  { icon: FileLock2, label: 'Paquet scellé, empreinte calculée' },
  { icon: Send, label: 'Transmission à Rebâtir (simulée)' },
  { icon: CheckCircle2, label: 'Accusé de réception (simulé)' },
]

/* ───────────── Mon dossier ───────────── */

// Ordre de lecture : ce que contient le dossier et son aperçu, le garder, puis l'envoyer si on le décide.
// Le bouton d'envoi dit ce qui manque tant qu'il est inactif. Après l'envoi, les choix sont figés.
export default function Dossier({ fiche, hoursSince, onJournal }: { fiche: Fiche; hoursSince: number | null; onJournal: (a: string) => void }) {
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
  const sent = phase >= 0

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

  const rows: (readonly [string, string, string])[] = [
    ...(include.recit ? [['Mon récit', fiche.quandInconnu ? 'Date inconnue' : fiche.quand ? new Date(fiche.quand).toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }) : 'Date non indiquée', fiche.souvenirs ? `${fiche.souvenirs.length} caractères écrits` : 'Rien d’écrit pour l’instant'] as const] : []),
    ...(include.examens ? [['Examens prioritaires', checklist.length ? checklist.slice(0, 3).map((c) => c.label).join(' · ') : 'Date inconnue : à voir avec l’équipe', `${checklist.length > 3 ? `et ${checklist.length - 3} autre(s). ` : ''}Délais indicatifs, non validés cliniquement.`] as const] : []),
    ...(include.besoins ? [['Mes besoins', fiche.besoins.join(', ') || 'Aucun choisi', ''] as const] : []),
    ['Journal', `${fiche.journal.length} action(s) notée(s)`, 'Toujours inclus'] as const,
  ]

  return (
    <div>
      <h1 className="display text-[2rem] sm:text-5xl">Vous décidez de ce qui part.</h1>
      <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-ink-2 sm:mt-3">Boussole assemble votre dossier. Rien ne part sans votre double confirmation. Vous pouvez aussi simplement le garder.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
        <Card icon={ClipboardList} title="Ce que contient le dossier">
          <Toggle label="Mon récit" hint={fiche.souvenirs ? `${fiche.souvenirs.length} caractères` : 'vide pour l’instant'} on={include.recit} disabled={sent} set={(v) => setInclude({ ...include, recit: v })} />
          <Toggle label="Examens prioritaires" hint={hoursSince !== null ? `calculés à ${hoursSince}${NB}h` : 'date inconnue'} on={include.examens} disabled={sent} set={(v) => setInclude({ ...include, examens: v })} />
          <Toggle label="Mes besoins" hint={fiche.besoins.join(', ') || 'aucun choisi'} on={include.besoins} disabled={sent} set={(v) => setInclude({ ...include, besoins: v })} />

          <h3 className="mt-4 flex items-center justify-between border-t border-rule pt-4 text-base font-extrabold">Aperçu <span className="text-sm font-bold text-ink-2">{sections} section{sections > 1 ? 's' : ''}</span></h3>
          <dl id="dossier-apercu" className="mt-1 divide-y divide-rule">
            {rows.map(([k, v, hint]) => (
              <div key={k} className="py-3">
                <dt className="text-[15px] font-extrabold">{k}</dt>
                <dd className="mt-0.5 text-base leading-snug text-ink-2">{v}{hint && <span className="mt-0.5 block text-sm">{hint}</span>}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <button onClick={download} className="btn btn-plain"><Download size={18} strokeWidth={2} /> Garder une copie</button>
            <button onClick={() => { onJournal('Dossier imprimé'); window.print() }} className="btn btn-plain"><Printer size={18} strokeWidth={2} /> Imprimer / PDF</button>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card icon={Scale} title="Destinataire">
            <p className="text-base font-extrabold">{REBATIR.name}</p>
            <p className="mt-1 text-base leading-normal text-ink-2">{REBATIR.what}</p>
            <a href={`tel:${REBATIR.phone}`} className="btn btn-soft mt-3"><Phone size={18} strokeWidth={2.25} /> {REBATIR.phoneLabel}</a>
          </Card>
          <Card icon={ShieldCheck} title="Consentement">
            <Check2 id="consent-send" label="Je consens à transmettre ce dossier à Rebâtir." checked={consent.transmettre} disabled={sent} onChange={(v) => setConsent({ ...consent, transmettre: v })} />
            <Check2 id="consent-beta" label="Je comprends que c’est une bêta : l’envoi est simulé, rien ne part réellement." checked={consent.beta} disabled={sent} onChange={(v) => setConsent({ ...consent, beta: v })} />
          </Card>

          {!sent ? (
            <div>
              <button id="send" disabled={!ready} aria-describedby={ready ? undefined : 'send-aide'} onClick={() => setConfirmOpen(true)} className="btn btn-primary btn-lg w-full">
                <Send size={18} strokeWidth={2.25} /> Envoyer à Rebâtir
              </button>
              {!ready && <p id="send-aide" className="mt-2 text-center text-[15px] text-ink-2">{sections === 0 ? 'Choisissez au moins une section du dossier.' : 'Pour envoyer, cochez les deux cases du consentement.'}</p>}
            </div>
          ) : (
            <div className="fade-in card-soft p-5 sm:p-6" id="send-progress" aria-live="polite">
              <ol className="space-y-3">
                {PHASES.map(({ icon: Icon, label }, n) => {
                  const done = n < phase || (n === 3 && phase === 3)
                  return (
                    <li key={label} className={`flex items-center gap-3 text-base ${n <= phase ? 'text-ink' : 'text-ink-3'}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-150 ${done ? 'bg-north text-white' : n === phase ? 'bg-ink text-white' : 'bg-panel text-ink-3'}`}>
                        {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2} />}
                      </span>
                      {label}
                    </li>
                  )
                })}
              </ol>
              {packet && (
                <div className="fade-in mt-4 rounded-2xl bg-north-soft p-4">
                  <p className="text-base font-extrabold text-north">Référence simulée : <span className="whitespace-nowrap">{packet.ref}</span></p>
                  <p className="mt-2 text-[15px] leading-snug text-ink-2">En production : transmission chiffrée de bout en bout, clé remise séparément, accusé signé.</p>
                  <details className="mt-1 text-sm text-ink-2">
                    <summary className="press inline-flex min-h-11 cursor-pointer items-center rounded-lg font-bold underline decoration-2 underline-offset-4">Détails techniques</summary>
                    <p className="break-all">{packet.size} octets chiffrés · sha256 {packet.fingerprint.slice(0, 32)}…</p>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {packet && (
        <div className="mx-auto mt-5 max-w-2xl">
          <Rappel onConfirm={(b) => onJournal(`Rappel choisi : ${new Date(b.at).toLocaleString('fr-CA')} (${b.mode === 'tel' ? 'téléphone' : 'vidéo'})`)} />
        </div>
      )}

      {confirmOpen && <Confirm sections={sections} onCancel={() => setConfirmOpen(false)} onOk={send} />}
    </div>
  )
}

function Confirm({ sections, onCancel, onOk }: { sections: number; onCancel: () => void; onOk: () => void }) {
  const dialog = useRef<HTMLDivElement>(null)
  useDialog(dialog, true, onCancel)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fade-in absolute inset-0 bg-ink/50" onClick={onCancel} />
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="confirm-titre" className="sheet-in relative w-full max-w-md rounded-t-[28px] bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none sm:rounded-[28px] sm:p-6">
        <h2 id="confirm-titre" className="display text-[1.75rem]">Confirmer l’envoi ?</h2>
        <p className="mt-2 text-base leading-relaxed text-ink-2">{sections} section{sections > 1 ? 's' : ''} vers <b className="text-ink">Rebâtir</b>. En bêta, l’envoi est simulé : aucune donnée ne quitte votre appareil.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="btn btn-plain">Annuler</button>
          <button id="confirm-send" onClick={onOk} className="btn btn-primary">Oui, envoyer</button>
        </div>
      </div>
    </div>
  )
}
