import { useEffect, useState } from 'react'
import { Download, WifiOff } from 'lucide-react'

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

// Bandeau discret quand le réseau tombe : l'espace chiffré reste utilisable, la carte et l'IA non.
export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (online) return null
  return (
    <div id="offline-banner" role="status" className="no-print sticky top-0 z-[60] flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-sm font-bold text-white">
      <WifiOff size={16} strokeWidth={2.25} className="shrink-0" />
      Hors ligne : votre espace fonctionne. La carte et l’IA reviendront avec le réseau. Urgence : 911.
    </div>
  )
}

// Proposition d'installation (Android / ordinateur). Sur iPhone : Partager → « Sur l'écran d'accueil ».
export function InstallCard() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as InstallPrompt) }
    const onInstalled = () => setDone(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])
  if (!prompt || done) return null
  return (
    <div id="install-card" className="fade-in mt-6 flex flex-wrap items-center gap-4 rounded-[28px] bg-white p-5 shadow-[0_14px_30px_-26px_rgba(45,36,64,.5)]">
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-extrabold">Garder Boussole sur ce téléphone</span>
        <span className="mt-1 block text-[15px] leading-snug text-ink-2">Facultatif. L’icône « Boussole » sera visible sur votre écran d’accueil.</span>
      </span>
      <button onClick={async () => { await prompt.prompt(); const r = await prompt.userChoice; if (r.outcome === 'accepted') setDone(true); setPrompt(null) }}
        className="press inline-flex h-12 items-center gap-2 rounded-full bg-north px-5 font-extrabold text-white hover:bg-ink">
        <Download size={18} strokeWidth={2.25} /> Installer
      </button>
    </div>
  )
}
