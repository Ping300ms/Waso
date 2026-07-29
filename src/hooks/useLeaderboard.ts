import { useEffect, useState } from 'react'
import { supabase } from '../sync/supabaseClient'
import { db, type LeaderboardCacheEntry, type LeaderboardCacheRecord } from '../db/schema'
import { FAMILIES, BIRDS_BY_FAMILY } from '../data/birds'
import { buildBadgeDefs, computeBadgeStates, type CaughtBird } from '../domain/badges'

export type LeaderboardEntry = LeaderboardCacheEntry

interface LeaderboardResult {
  entries: LeaderboardEntry[]
  fetchedAt: string | null
  loading: boolean
  offline: boolean
}

const BADGE_DEFS = buildBadgeDefs()

function countBadges(caughtBirds: CaughtBird[]): number {
  return computeBadgeStates(caughtBirds, BADGE_DEFS).filter((b) => b.obtained).length
}

function countFamilies(birdIds: string[]): number {
  const idSet = new Set(birdIds)
  let count = 0
  for (const famille of FAMILIES) {
    const birds = BIRDS_BY_FAMILY.get(famille) ?? []
    if (birds.some((b) => idSet.has(b.id))) count++
  }
  return count
}

export function useLeaderboard(): LeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    let cancelled = false

    async function loadFromCache() {
      const cached = await db.leaderboardCache.get('singleton')
      if (cached && !cancelled) {
        setEntries(cached.entries)
        setFetchedAt(cached.fetchedAt)
      }
    }

    async function fetchLive() {
      if (!navigator.onLine) {
        setOffline(true)
        await loadFromCache()
        setLoading(false)
        return
      }

      const [{ data: profiles, error: profilesError }, { data: sightings, error: sightingsError }] =
        await Promise.all([
          supabase.from('profiles').select('id, pseudo'),
          supabase.from('sightings').select('user_id, bird_id, first_seen_date, first_seen_time'),
        ])

      if (profilesError || sightingsError || !profiles || !sightings) {
        setOffline(true)
        await loadFromCache()
        setLoading(false)
        return
      }

      const caughtByUser = new Map<string, CaughtBird[]>()
      for (const row of sightings as {
        user_id: string
        bird_id: string
        first_seen_date: string
        first_seen_time: string | null
      }[]) {
        const list = caughtByUser.get(row.user_id) ?? []
        list.push({
          birdId: row.bird_id,
          firstSeenDate: row.first_seen_date,
          firstSeenTime: row.first_seen_time,
        })
        caughtByUser.set(row.user_id, list)
      }

      const computed: LeaderboardEntry[] = (profiles as { id: string; pseudo: string }[]).map(
        (p) => {
          const caughtBirds = caughtByUser.get(p.id) ?? []
          const birdIds = caughtBirds.map((c) => c.birdId)
          return {
            userId: p.id,
            pseudo: p.pseudo,
            birdCount: birdIds.length,
            familyCount: countFamilies(birdIds),
            badgeCount: countBadges(caughtBirds),
          }
        }
      )

      if (cancelled) return
      const now = new Date().toISOString()
      setEntries(computed)
      setFetchedAt(now)
      setOffline(false)
      setLoading(false)

      const cacheRecord: LeaderboardCacheRecord = { key: 'singleton', fetchedAt: now, entries: computed }
      await db.leaderboardCache.put(cacheRecord)
    }

    void fetchFallback()
    async function fetchFallback() {
      await fetchLive().catch(async () => {
        setOffline(true)
        await loadFromCache()
        setLoading(false)
      })
    }

    return () => {
      cancelled = true
    }
  }, [])

  return { entries, fetchedAt, loading, offline }
}
