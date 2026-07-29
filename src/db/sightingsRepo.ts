import { db, type SightingRecord } from './schema'

function nowIso(): string {
  return new Date().toISOString()
}

export async function getAllSightings(): Promise<SightingRecord[]> {
  return db.sightings.toArray()
}

export async function getSighting(birdId: string): Promise<SightingRecord | undefined> {
  return db.sightings.get(birdId)
}

/**
 * Logs (or updates) a sighting for a bird. If a record already exists, the earliest
 * date between the existing and the new one is kept (a bird's "first seen" date only
 * ever moves earlier, never later) — this matches the additive-merge sync rule.
 */
export async function upsertSighting(birdId: string, date: Date): Promise<void> {
  const isoDate = date.toISOString().slice(0, 10)
  const existing = await db.sightings.get(birdId)
  const firstSeenDate =
    existing && existing.firstSeenDate < isoDate ? existing.firstSeenDate : isoDate

  await db.sightings.put({
    birdId,
    firstSeenDate,
    updatedAt: nowIso(),
    dirty: 1,
  })
}

/** Writes records coming from a sync merge, without marking them dirty (already reconciled). */
export async function bulkPutClean(records: SightingRecord[]): Promise<void> {
  await db.sightings.bulkPut(records.map((r) => ({ ...r, dirty: 0 })))
}

export async function markClean(birdIds: string[]): Promise<void> {
  await db.transaction('rw', db.sightings, async () => {
    for (const birdId of birdIds) {
      const record = await db.sightings.get(birdId)
      if (record) await db.sightings.put({ ...record, dirty: 0 })
    }
  })
}

export async function isCaught(birdId: string): Promise<boolean> {
  const record = await db.sightings.get(birdId)
  return record !== undefined && !record.deletedAt
}

/** True for a real (non-tombstoned) sighting. */
export function isActiveSighting(record: SightingRecord): boolean {
  return !record.deletedAt
}

export async function getActiveSightings(): Promise<SightingRecord[]> {
  return (await db.sightings.toArray()).filter(isActiveSighting)
}

/**
 * Marks a sighting as deleted (tombstone) instead of removing it outright, so the deletion
 * can be propagated to Supabase on the next sync even if we're currently offline.
 */
export async function markSightingDeleted(birdId: string): Promise<void> {
  const existing = await db.sightings.get(birdId)
  if (!existing) return
  await db.sightings.put({
    ...existing,
    deletedAt: nowIso(),
    dirty: 1,
  })
}

/** Removes a tombstoned record entirely once the remote delete has been confirmed by sync. */
export async function purgeSighting(birdId: string): Promise<void> {
  await db.sightings.delete(birdId)
}
