import { useLiveQuery } from 'dexie-react-hooks'
import { db, type SightingRecord } from '../db/schema'
import { isActiveSighting } from '../db/sightingsRepo'

/**
 * Live-updating list of the current user's local sightings (reactive to Dexie writes).
 * Excludes tombstoned (deleted-but-not-yet-synced) records — use `db.sightings.toArray()`
 * directly if a tombstone needs to be seen (e.g. the sync engine).
 */
export function useSightings(): SightingRecord[] {
  return (useLiveQuery(() => db.sightings.toArray(), [], []) ?? []).filter(isActiveSighting)
}

export function useSightingsByBirdId(): Map<string, SightingRecord> {
  const sightings = useSightings()
  return new Map(sightings.map((s) => [s.birdId, s]))
}
