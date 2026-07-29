import { supabase } from './supabaseClient'
import { db, type SightingRecord } from '../db/schema'
import { bulkPutClean, purgeSighting } from '../db/sightingsRepo'
import { setLastSynced } from '../db/syncMeta'

interface RemoteSighting {
  user_id: string
  bird_id: string
  first_seen_date: string
  first_seen_time: string | null
  updated_at: string
}

interface MergedRow {
  birdId: string
  firstSeenDate: string
  firstSeenTime: string | null
}

/**
 * Additive merge: a bird counts as caught if it's caught on EITHER side; when both sides
 * have it, the earliest date wins (and its time comes along with it — if both sides share
 * the same date, whichever side actually has a time set wins, local breaking ties).
 * Pure function, no I/O — safe to unit test and to rerun.
 */
export function additiveMerge(
  local: SightingRecord[],
  remote: RemoteSighting[]
): MergedRow[] {
  const localMap = new Map(local.map((r) => [r.birdId, r]))
  const remoteMap = new Map(remote.map((r) => [r.bird_id, r]))
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()])

  const merged: MergedRow[] = []
  for (const birdId of allIds) {
    const l = localMap.get(birdId)
    const r = remoteMap.get(birdId)
    if (l && r) {
      if (l.firstSeenDate < r.first_seen_date) {
        merged.push({ birdId, firstSeenDate: l.firstSeenDate, firstSeenTime: l.firstSeenTime ?? null })
      } else if (r.first_seen_date < l.firstSeenDate) {
        merged.push({ birdId, firstSeenDate: r.first_seen_date, firstSeenTime: r.first_seen_time })
      } else {
        merged.push({
          birdId,
          firstSeenDate: l.firstSeenDate,
          firstSeenTime: l.firstSeenTime ?? r.first_seen_time ?? null,
        })
      }
    } else if (l) {
      merged.push({ birdId, firstSeenDate: l.firstSeenDate, firstSeenTime: l.firstSeenTime ?? null })
    } else if (r) {
      merged.push({ birdId, firstSeenDate: r.first_seen_date, firstSeenTime: r.first_seen_time })
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
      .select('user_id, bird_id, first_seen_date, first_seen_time, updated_at')
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

    const localMap = new Map(local.map((r) => [r.birdId, r]))
    const remoteMap = new Map(remote.map((r) => [r.bird_id, r]))
    const now = new Date().toISOString()

    const toUpsert = merged
      .filter(
        (row) =>
          remoteMap.get(row.birdId)?.first_seen_date !== row.firstSeenDate ||
          (remoteMap.get(row.birdId)?.first_seen_time ?? null) !== row.firstSeenTime
      )
      .map((row) => ({
        user_id: userId,
        bird_id: row.birdId,
        first_seen_date: row.firstSeenDate,
        first_seen_time: row.firstSeenTime,
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
      .filter(
        (row) =>
          localMap.get(row.birdId)?.firstSeenDate !== row.firstSeenDate ||
          (localMap.get(row.birdId)?.firstSeenTime ?? null) !== row.firstSeenTime
      )
      .map((row) => ({
        birdId: row.birdId,
        firstSeenDate: row.firstSeenDate,
        firstSeenTime: row.firstSeenTime,
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
