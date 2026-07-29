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
 *
 * `time` (HH:MM, optional) describes the earliest occurrence: if the new date is earlier
 * than (or equal-with-no-existing-time) the current one, it replaces the stored time; if
 * the new date is later, the existing date+time are left untouched.
 */
export async function upsertSighting(birdId: string, date: Date, time?: string | null): Promise<void> {
  const isoDate = date.toISOString().slice(0, 10)
  const existing = await db.sightings.get(birdId)

  let firstSeenDate = isoDate
  let firstSeenTime: string | null | undefined = time ?? null
  if (existing) {
    if (existing.firstSeenDate < isoDate) {
      firstSeenDate = existing.firstSeenDate
      firstSeenTime = existing.firstSeenTime
    } else if (existing.firstSeenDate === isoDate && !existing.firstSeenTime) {
      firstSeenTime = time ?? existing.firstSeenTime
    } else if (existing.firstSeenDate === isoDate) {
      firstSeenTime = existing.firstSeenTime
    }
  }

  await db.sightings.put({
    birdId,
    firstSeenDate,
    firstSeenTime,
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
