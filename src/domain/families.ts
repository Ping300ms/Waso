import { BIRDS_BY_FAMILY, FAMILIES } from '../data/birds'
import type { SightingRecord } from '../db/schema'

export interface FamilyCompletion {
  famille: string
  caught: number
  total: number
  pct: number
}

export function familyCompletion(
  sightings: SightingRecord[],
  famille: string
): FamilyCompletion {
  const caughtIds = new Set(sightings.map((s) => s.birdId))
  const birds = BIRDS_BY_FAMILY.get(famille) ?? []
  const caught = birds.filter((b) => caughtIds.has(b.id)).length
  const total = birds.length
  return { famille, caught, total, pct: total === 0 ? 0 : (caught / total) * 100 }
}

export function allFamilyCompletions(sightings: SightingRecord[]): FamilyCompletion[] {
  return FAMILIES.map((famille) => familyCompletion(sightings, famille))
}
