import { db } from './schema'

export async function getSyncState() {
  return (
    (await db.syncState.get('singleton')) ?? {
      key: 'singleton' as const,
      lastPulledAt: null,
      lastPushedAt: null,
    }
  )
}

export async function setLastSynced(now: string): Promise<void> {
  await db.syncState.put({ key: 'singleton', lastPulledAt: now, lastPushedAt: now })
}
