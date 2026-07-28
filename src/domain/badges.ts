import { ALL_BIRDS, BIRDS_BY_FAMILY, FAMILIES, type Bird } from '../data/birds'
import type { SightingRecord } from '../db/schema'
import { emojiForFamily } from './emoji'

export type BadgeKind = 'family' | 'total'

export interface BadgeTier {
  tierPct: number
  /** Number of birds required to reach this tier (derived from group size). */
  threshold: number
}

export interface BadgeDef {
  id: string
  kind: BadgeKind
  famille?: string
  groupSize: number
  /** Achievable tiers for this group, ascending, deduplicated by threshold. */
  tiers: BadgeTier[]
  label: string
  emoji: string
}

export interface BadgeState extends BadgeDef {
  caught: number
  /** True as soon as the first tier is reached. */
  obtained: boolean
  /** Highest tier reached so far, or null if none. */
  currentTier: BadgeTier | null
  /** First tier not yet reached, or null if the group is fully complete. */
  nextTier: BadgeTier | null
  /** Real completion % of the group (drives the progress bar toward nextTier). */
  progressPct: number
}

const TIER_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

/** Builds the tier list for a group of `groupSize` birds, deduping tiers that map to the
 * same bird-count threshold (e.g. a 3-bird family only has meaningful thresholds at 1, 2, 3
 * birds, so several of the 10 nominal percentages collapse onto the same threshold and only
 * the first (lowest) percentage reaching each threshold is kept). */
function buildTiersForGroupSize(groupSize: number): BadgeTier[] {
  const seenThresholds = new Set<number>()
  const tiers: BadgeTier[] = []
  for (const tierPct of TIER_STEPS) {
    const threshold = Math.ceil((tierPct / 100) * groupSize)
    if (threshold < 1 || seenThresholds.has(threshold)) continue
    seenThresholds.add(threshold)
    tiers.push({ tierPct, threshold })
  }
  return tiers
}

function buildFamilyBadgeDef(famille: string, birds: Bird[]): BadgeDef {
  return {
    id: `family-${famille.toLowerCase()}`,
    kind: 'family',
    famille,
    groupSize: birds.length,
    tiers: buildTiersForGroupSize(birds.length),
    label: `Découvreur de ${famille}`,
    emoji: emojiForFamily(famille),
  }
}

function buildTotalBadgeDef(allBirds: Bird[]): BadgeDef {
  return {
    id: 'total',
    kind: 'total',
    groupSize: allBirds.length,
    tiers: buildTiersForGroupSize(allBirds.length),
    label: 'Ornithologue',
    emoji: '🏆',
  }
}

export function buildBadgeDefs(allBirds: Bird[] = ALL_BIRDS): BadgeDef[] {
  const familyDefs = FAMILIES.map((famille) =>
    buildFamilyBadgeDef(famille, BIRDS_BY_FAMILY.get(famille) ?? [])
  )
  return [buildTotalBadgeDef(allBirds), ...familyDefs]
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

    let currentTier: BadgeTier | null = null
    let nextTier: BadgeTier | null = null
    for (const tier of def.tiers) {
      if (tier.threshold <= caught) currentTier = tier
      else {
        nextTier = tier
        break
      }
    }

    return {
      ...def,
      caught,
      progressPct,
      currentTier,
      nextTier,
      obtained: currentTier !== null,
    }
  })
}
