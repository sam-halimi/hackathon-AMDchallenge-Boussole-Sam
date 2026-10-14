import { X } from 'lucide-react'
import { quitter } from '../lib/quitter'
import { useLang } from '../lib/i18n'

// Présent en haut de chaque écran de l'espace de la personne, avant comme après la connexion.
export default function Quitter({ lock }: { lock: () => void }) {
  const { t } = useLang()
  return (
    <button id="quitter" type="button" onClick={() => quitter(lock)} aria-label={t('Quitter rapidement : ferme Boussole et ouvre une page de météo', 'Quick exit: closes Boussole and opens a weather page')} className="btn btn-plain px-4">
      <X size={18} strokeWidth={2.5} /> {t('Quitter', 'Exit')}
    </button>
  )
}
