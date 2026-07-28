import { useLiveQuery } from 'dexie-react-hooks'
import { db, type SightingRecord } from '../db/schema'

/** Live-updating list of the current user's local sightings (reactive to Dexie writes). */
export function useSightings(): SightingRecord[] {
  return useLiveQuery(() => db.sightings.toArray(), [], []) ?? []
}

export function useSightingsByBirdId(): Map<string, SightingRecord> {
  const sightings = useSightings()
  return new Map(sightings.map((s) => [s.birdId, s]))
}
