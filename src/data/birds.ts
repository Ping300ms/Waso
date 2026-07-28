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

export const FAMILIES: string[] = Array.from(new Set(ALL_BIRDS.map((b) => b.famille))).sort(
  (a, b) => a.localeCompare(b, 'fr')
)

export const BIRDS_BY_FAMILY: Map<string, Bird[]> = new Map(
  FAMILIES.map((famille) => [famille, ALL_BIRDS.filter((b) => b.famille === famille)])
)
