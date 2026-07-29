import { supabase } from './supabaseClient'
import { db, type SightingRecord } from '../db/schema'
import { bulkPutClean, purgeSighting } from '../db/sightingsRepo'
import { setLastSynced } from '../db/syncMeta'

interface RemoteSighting {
  user_id: string
  bird_id: string
  first_seen_date: string
  updated_at: string
}

interface MergedRow {
  birdId: string
  firstSeenDate: string
}

/**
 * Additive merge: a bird counts as caught if it's caught on EITHER side; when both sides
 * have it, the earliest date wins. Pure function, no I/O — safe to unit test and to rerun.
 */
export function additiveMerge(
  local: SightingRecord[],
  remote: RemoteSighting[]
): MergedRow[] {
  const localMap = new Map(local.map((r) => [r.birdId, r.firstSeenDate]))
  const remoteMap = new Map(remote.map((r) => [r.bird_id, r.first_seen_date]))
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])

  const merged: MergedRow[] = []
  for (const birdId of allIds) {
    const localDate = localMap.get(birdId)
    const remoteDate = remoteMap.get(birdId)
    if (localDate && remoteDate) {
      merged.push({ birdId, firstSeenDate: localDate < remoteDate ? localDate : remoteDate })
    } else {
      merged.push({ birdId, firstSeenDate: (localDate ?? remoteDate)! })
    }
  }
  return merged
}

let syncInFlight = false

export async function runSync(userId: string): Promise<void> {
  if (syncInFlight) return
  if (!navigator.onLine) return

  syncInFlight = true
  try {
    const allLocal = await db.sightings.toArray()
    const tombstoned = allLocal.filter((r) => r.deletedAt)
    const local = allLocal.filter((r) => !r.deletedAt)

    // Propagate local deletions first, so a bird pending deletion is never resurrected by
    // the additive merge below (whether the remote delete succeeds now or is retried later).
    for (const record of tombstoned) {
      const { error: deleteError } = await supabase
        .from('sightings')
        .delete()
        .eq('user_id', userId)
        .eq('bird_id', record.birdId)
      if (deleteError) {
        // eslint-disable-next-line no-console
        console.warn('Sync: remote delete failed, will retry next trigger', deleteError.message)
        continue
      }
      await purgeSighting(record.birdId)
    }

    const { data: remoteRows, error } = await supabase
      .from('sightings')
      .select('user_id, bird_id, first_seen_date, updated_at')
      .eq('user_id', userId)

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('Sync: failed to fetch remote sightings', error.message)
      return
    }
    const tombstonedIds = new Set(tombstoned.map((r) => r.birdId))
    const remote = ((remoteRows ?? []) as RemoteSighting[]).filter(
      (r) => !tombstonedIds.has(r.bird_id)
    )

    const merged = additiveMerge(local, remote)

    const localMap = new Map(local.map((r) => [r.birdId, r.firstSeenDate]))
    const remoteMap = new Map(remote.map((r) => [r.bird_id, r.first_seen_date]))
    const now = new Date().toISOString()

    const toUpsert = merged
      .filter((row) => remoteMap.get(row.birdId) !== row.firstSeenDate)
      .map((row) => ({
        user_id: userId,
        bird_id: row.birdId,
        first_seen_date: row.firstSeenDate,
        updated_at: now,
      }))

    if (toUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('sightings')
        .upsert(toUpsert, { onConflict: 'user_id,bird_id' })
      if (upsertError) {
        // eslint-disable-next-line no-console
        console.warn('Sync: push failed, will retry next trigger', upsertError.message)
        // Local dirty flags are left untouched — safe to retry, additive merge is idempotent.
        return
      }
    }

    const toWriteLocal = merged
      .filter((row) => localMap.get(row.birdId) !== row.firstSeenDate)
      .map((row) => ({
        birdId: row.birdId,
        firstSeenDate: row.firstSeenDate,
        updatedAt: now,
        dirty: 0,
      }))

    if (toWriteLocal.length > 0) {
      await bulkPutClean(toWriteLocal)
    }

    await setLastSynced(now)
  } finally {
    syncInFlight = false
  }
}
