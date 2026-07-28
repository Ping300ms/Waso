import { useEffect, useState } from 'react'

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="bg-amber-500 text-amber-950 text-sm text-center py-1 px-2">
      Hors-ligne — le Wasodex et les badges restent disponibles, la synchro reprendra au retour du réseau.
    </div>
  )
}
