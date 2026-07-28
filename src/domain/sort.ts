import type { Bird } from '../data/birds'
import type { SightingRecord } from '../db/schema'
import { RARETE_ORDER } from './rarete'

export type SortKey = 'famille' | 'alphabetique' | 'dateObtention' | 'rarete'

export const SORT_LABELS: Record<SortKey, string> = {
  famille: 'Famille',
  alphabetique: 'Alphabétique',
  dateObtention: "Date d'obtention",
  rarete: 'Rareté',
}

export const DEFAULT_SORT_KEY: SortKey = 'famille'

/**
 * Builds a comparator for the given sort key. `sightingsByBirdId` is required for
 * `dateObtention` (uncaught birds sort after caught ones, then alphabetically among themselves).
 */
export function getBirdComparator(
  sortKey: SortKey,
  sightingsByBirdId: Map<string, SightingRecord>
): (a: Bird, b: Bird) => number {
  switch (sortKey) {
    case 'famille':
      return (a, b) =>
        a.famille.localeCompare(b.famille, 'fr') || a.frenchName.localeCompare(b.frenchName, 'fr')
    case 'alphabetique':
      return (a, b) => a.frenchName.localeCompare(b.frenchName, 'fr')
    case 'rarete':
      return (a, b) =>
        RARETE_ORDER.indexOf(a.rarete) - RARETE_ORDER.indexOf(b.rarete) ||
        a.frenchName.localeCompare(b.frenchName, 'fr')
    case 'dateObtention':
      return (a, b) => {
        const dateA = sightingsByBirdId.get(a.id)?.firstSeenDate
        const dateB = sightingsByBirdId.get(b.id)?.firstSeenDate
        if (dateA && dateB) return dateA.localeCompare(dateB)
        if (dateA && !dateB) return -1
        if (!dateA && dateB) return 1
        return a.frenchName.localeCompare(b.frenchName, 'fr')
      }
  }
}
