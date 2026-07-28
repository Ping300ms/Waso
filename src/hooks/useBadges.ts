import { useMemo } from 'react'
import { buildBadgeDefs, computeBadgeStates, type BadgeState } from '../domain/badges'
import { useSightings } from './useSightings'
import type { SightingRecord } from '../db/schema'

const STATIC_DEFS = buildBadgeDefs()

export function useBadges(): BadgeState[] {
  const sightings = useSightings()
  return useBadgesForSightings(sightings)
}

/** Same computation, parameterized — used for viewing another player's badges. */
export function useBadgesForSightings(sightings: SightingRecord[]): BadgeState[] {
  return useMemo(() => computeBadgeStates(sightings, STATIC_DEFS), [sightings])
}
