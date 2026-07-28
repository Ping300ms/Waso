import { ALL_BIRDS, BIRDS_BY_FAMILY, FAMILIES, type Bird } from '../data/birds'
import type { SightingRecord } from '../db/schema'
import { emojiForFamily } from './emoji'

export type BadgeKind = 'family' | 'total'

export interface BadgeDef {
  id: string
  kind: BadgeKind
  famille?: string
  tierPct: number
  /** Number of birds required to reach this tier (derived from group size). */
  threshold: number
  groupSize: number
  label: string
  emoji: string
}

export interface BadgeState extends BadgeDef {
  obtained: boolean
  /** Current % of the relevant group caught (for un-obtained badges: progress toward this tier). */
  progressPct: number
  caught: number
}

const TIER_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

/** Builds the tier list for a group of `groupSize` birds, deduping tiers that map to the
 * same bird-count threshold (e.g. a 3-bird family only has meaningful thresholds at 1, 2, 3
 * birds, so several of the 10 nominal percentages collapse onto the same threshold and only
 * the first (lowest) percentage reaching each threshold is kept). */
function buildTiersForGroupSize(groupSize: number): Array<{ tierPct: number; threshold: number }> {
  const seenThresholds = new Set<number>()
  const tiers: Array<{ tierPct: number; threshold: number }> = []
  for (const tierPct of TIER_STEPS) {
    const threshold = Math.ceil((tierPct / 100) * groupSize)
    if (threshold < 1 || seenThresholds.has(threshold)) continue
    seenThresholds.add(threshold)
    tiers.push({ tierPct, threshold })
  }
  return tiers
}

function buildFamilyBadgeDefs(famille: string, birds: Bird[]): BadgeDef[] {
  const emoji = emojiForFamily(famille)
  return buildTiersForGroupSize(birds.length).map(({ tierPct, threshold }) => ({
    id: `family-${famille.toLowerCase()}-${tierPct}`,
    kind: 'family' as const,
    famille,
    tierPct,
    threshold,
    groupSize: birds.length,
    label: `Découvreur de ${famille} ${tierPct}%`,
    emoji,
  }))
}

function buildTotalBadgeDefs(allBirds: Bird[]): BadgeDef[] {
  return buildTiersForGroupSize(allBirds.length).map(({ tierPct, threshold }) => ({
    id: `total-${tierPct}`,
    kind: 'total' as const,
    tierPct,
    threshold,
    groupSize: allBirds.length,
    label: `Ornithologue ${tierPct}%`,
    emoji: '🏆',
  }))
}

export function buildBadgeDefs(allBirds: Bird[] = ALL_BIRDS): BadgeDef[] {
  const familyDefs = FAMILIES.flatMap((famille) =>
    buildFamilyBadgeDefs(famille, BIRDS_BY_FAMILY.get(famille) ?? [])
  )
  return [...buildTotalBadgeDefs(allBirds), ...familyDefs]
}

export function computeBadgeStates(
  sightings: SightingRecord[],
  defs: BadgeDef[] = buildBadgeDefs()
): BadgeState[] {
  const caughtIds = new Set(sightings.map((s) => s.birdId))

  const caughtByFamily = new Map<string, number>()
  for (const famille of FAMILIES) {
    const birds = BIRDS_BY_FAMILY.get(famille) ?? []
    caughtByFamily.set(famille, birds.filter((b) => caughtIds.has(b.id)).length)
  }
  const totalCaught = caughtIds.size

  return defs.map((def) => {
    const caught = def.kind === 'total' ? totalCaught : caughtByFamily.get(def.famille!) ?? 0
    const progressPct = def.groupSize === 0 ? 0 : (caught / def.groupSize) * 100
    return {
      ...def,
      caught,
      progressPct,
      obtained: caught >= def.threshold,
    }
  })
}
