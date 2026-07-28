import { useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { runSync } from './syncEngine'

const DEBOUNCE_MS = 5000

export function useSyncTrigger(): void {
  const { session } = useAuth()
  const lastRunRef = useRef(0)

  useEffect(() => {
    if (!session?.user.id) return
    const userId = session.user.id

    const trigger = () => {
      const now = Date.now()
      if (now - lastRunRef.current < DEBOUNCE_MS) return
      lastRunRef.current = now
      void runSync(userId)
    }

    trigger() // initial sync on login / mount

    const onVisibility = () => {
      if (document.visibilityState === 'visible') trigger()
    }

    window.addEventListener('online', trigger)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('online', trigger)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [session?.user.id])
}
