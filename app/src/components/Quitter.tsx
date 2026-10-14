import { X } from 'lucide-react'
import { quitter } from '../lib/quitter'

// Présent en haut de chaque écran de l'espace de la personne, avant comme après la connexion.
export default function Quitter({ lock }: { lock: () => void }) {
  return (
    <button id="quitter" type="button" onClick={() => quitter(lock)} aria-label="Quitter rapidement : ferme Boussole et ouvre une page de météo" className="btn btn-plain px-4">
      <X size={18} strokeWidth={2.5} /> Quitter
    </button>
  )
}
