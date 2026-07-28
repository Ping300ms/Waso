import Dexie, { type EntityTable } from 'dexie'

export interface SightingRecord {
  /** Primary key — a user either has or hasn't caught a given bird. */
  birdId: string
  /** ISO date string (YYYY-MM-DD), earliest known sighting date. */
  firstSeenDate: string
  /** ISO timestamp of the last local modification. */
  updatedAt: string
  /** True if created/modified locally since the last successful push to Supabase. */
  dirty: number // stored as 0/1 (IndexedDB-friendly boolean for indexing)
}

export interface SyncStateRecord {
  key: 'singleton'
  lastPulledAt: string | null
  lastPushedAt: string | null
}

export interface LeaderboardCacheRecord {
  key: 'singleton'
  fetchedAt: string
  entries: Array<{
    userId: string
    pseudo: string
    birdCount: number
    familyCount: number
  }>
}

class WasoDB extends Dexie {
  sightings!: EntityTable<SightingRecord, 'birdId'>
  syncState!: EntityTable<SyncStateRecord, 'key'>
  leaderboardCache!: EntityTable<LeaderboardCacheRecord, 'key'>

  constructor() {
    super('waso-db')
    this.version(1).stores({
      sightings: 'birdId, dirty',
      syncState: 'key',
      leaderboardCache: 'key',
    })
  }
}

export const db = new WasoDB()
