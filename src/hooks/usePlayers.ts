import { useEffect, useState } from 'react'
import { supabase } from '../sync/supabaseClient'
import type { SightingRecord } from '../db/schema'

export interface PlayerSummary {
  id: string
  pseudo: string
}

export function usePlayers(): { players: PlayerSummary[]; loading: boolean; error: string | null } {
  const [players, setPlayers] = useState<PlayerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('profiles')
      .select('id, pseudo')
      .order('pseudo', { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          setError(fetchError.message)
        } else {
          setPlayers((data as PlayerSummary[]) ?? [])
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { players, loading, error }
}

export function usePlayerSightings(userId: string | null): {
  sightings: SightingRecord[]
  loading: boolean
  error: string | null
} {
  const [sightings, setSightings] = useState<SightingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    supabase
      .from('sightings')
      .select('bird_id, first_seen_date, first_seen_time, updated_at')
      .eq('user_id', userId)
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          setError(fetchError.message)
        } else {
          const rows =
            (data as {
              bird_id: string
              first_seen_date: string
              first_seen_time: string | null
              updated_at: string
            }[]) ?? []
          setSightings(
            rows.map((r) => ({
              birdId: r.bird_id,
              firstSeenDate: r.first_seen_date,
              firstSeenTime: r.first_seen_time,
              updatedAt: r.updated_at,
              dirty: 0,
            }))
          )
        }
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { sightings, loading, error }
}
