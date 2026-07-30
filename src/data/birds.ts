import birdsJson from './birds.generated.json'

export type Rarete = 'Commun' | 'Rare' | 'Epique' | 'Legendaire'

export interface Bird {
  id: string
  scientificName: string
  fullScientificName: string
  frenchName: string
  category: string
  famille: string
  rarete: Rarete
}

export const ALL_BIRDS: Bird[] = birdsJson as Bird[]

export const BIRDS_BY_ID: Map<string, Bird> = new Map(ALL_BIRDS.map((b) => [b.id, b]))

export const BIRDS_BY_SCIENTIFIC_NAME: Map<string, Bird> = new Map(
  ALL_BIRDS.map((b) => [b.scientificName, b])
)

export const FAMILIES: string[] = Array.from(new Set(ALL_BIRDS.map((b) => b.famille))).sort(
  (a, b) => a.localeCompare(b, 'fr')
)

export const BIRDS_BY_FAMILY: Map<string, Bird[]> = new Map(
  FAMILIES.map((famille) => [famille, ALL_BIRDS.filter((b) => b.famille === famille)])
)

/**
 * Numéro façon Pokédex. Suit le tri par défaut du Wasodex (famille, puis nom français) plutôt
 * que l'ordre brut de la checklist, pour que les numéros restent cohérents avec l'affichage.
 */
export const BIRD_NUMBER_BY_ID: Map<string, number> = new Map(
  [...ALL_BIRDS]
    .sort(
      (a, b) =>
        a.famille.localeCompare(b.famille, 'fr') || a.frenchName.localeCompare(b.frenchName, 'fr')
    )
    .map((b, index) => [b.id, index + 1])
)
