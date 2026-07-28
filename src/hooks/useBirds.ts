import { ALL_BIRDS, FAMILIES, type Bird } from '../data/birds'

/** Static catalog — never changes at runtime, no need for state. */
export function useBirds(): Bird[] {
  return ALL_BIRDS
}

export function useFamilies(): string[] {
  return FAMILIES
}
