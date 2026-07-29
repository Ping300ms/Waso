import { ALL_BIRDS, BIRDS_BY_FAMILY, FAMILIES, type Bird } from '../data/birds'
import { emojiForFamily } from './emoji'
import { buildThematicBadgeDefs } from './thematicBadges'

/** Only `birdId` (plus optional date/time) is needed to compute badge progress — accepting
 * this narrower shape lets callers pass plain records without dirty/deletedAt bookkeeping
 * (e.g. the leaderboard, or another player's fetched sightings). */
export interface CaughtBird {
  birdId: string
  firstSeenDate?: string
  firstSeenTime?: string | null
}

export type BadgeKind = 'family' | 'total' | 'checklist' | 'custom'
export type BadgeCategory =
  | 'famille'
  | 'temporalite'
  | 'terrain'
  | 'physique'
  | 'comportement'
  | 'progression'
  | 'special'

export const CATEGORY_LABELS: Record<Exclude<BadgeCategory, 'special'>, string> = {
  famille: 'Complétion de famille',
  temporalite: 'Quand',
  terrain: 'Où',
  physique: 'Quoi',
  comportement: 'Comportement',
  progression: 'Progression',
}

export interface BadgeTier {
  tierPct: number
  /** Number of birds (or evaluator units) required to reach this tier. */
  threshold: number
}

export interface BadgeDef {
  id: string
  kind: BadgeKind
  category: BadgeCategory
  famille?: string // kind === 'family'
  memberBirdIds?: string[] // kind === 'checklist'
  /** kind === 'custom' — returns the current `caught` count from the full sighting set. */
  evaluate?: (sightings: CaughtBird[]) => number
  /** Shown in the detail modal for 'custom' badges (no bird list to display for those). */
  description?: string
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
export function buildTiersForGroupSize(groupSize: number): BadgeTier[] {
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

/** Single pass/fail tier at `requiredCount` — used by checklist/custom badges, which don't
 * have a meaningful 10%-step ladder (they're either obtained or not, toward one goal). */
export function singleTier(requiredCount: number): BadgeTier[] {
  return [{ tierPct: 100, threshold: requiredCount }]
}

function buildFamilyBadgeDef(famille: string, birds: Bird[]): BadgeDef {
  return {
    id: `family-${famille.toLowerCase()}`,
    kind: 'family',
    category: 'famille',
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
    category: 'special',
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
  return [buildTotalBadgeDef(allBirds), ...familyDefs, ...buildThematicBadgeDefs()]
}

export function computeBadgeStates(
  sightings: CaughtBird[],
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
    let caught: number
    switch (def.kind) {
      case 'total':
        caught = totalCaught
        break
      case 'family':
        caught = caughtByFamily.get(def.famille!) ?? 0
        break
      case 'checklist':
        caught = (def.memberBirdIds ?? []).filter((id) => caughtIds.has(id)).length
        break
      case 'custom':
        caught = def.evaluate ? def.evaluate(sightings) : 0
        break
    }

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
