/**
 * Placeholder emoji per Famille (genus). Not exhaustive — curated for the most common
 * genera in BIRDS.csv, with a generic fallback for everything else. Easy to replace with
 * real family icons later: swap this map for artwork keyed the same way (by `famille`).
 */
export const FAMILY_EMOJI: Record<string, string> = {
  // Anseriformes (ducks, geese, swans)
  Branta: '🦢',
  Anser: '🪿',
  Cygnus: '🦢',
  Tadorna: '🦆',
  Anas: '🦆',
  Mareca: '🦆',
  Spatula: '🦆',
  Netta: '🦆',
  Aythya: '🦆',
  Somateria: '🦆',
  Melanitta: '🦆',
  Bucephala: '🦆',
  Mergus: '🦆',
  Mergellus: '🦆',
  Clangula: '🦆',
  Oxyura: '🦆',
  Alopochen: '🦆',

  // Galliformes
  Coturnix: '🐓',
  Alectoris: '🐓',
  Perdix: '🐓',
  Phasianus: '🦃',
  Tetrao: '🐓',
  Lyrurus: '🐓',
  Lagopus: '🐓',

  // Raptors
  Falco: '🦅',
  Buteo: '🦅',
  Aquila: '🦅',
  Milvus: '🦅',
  Circus: '🦅',
  Accipiter: '🦅',
  Astur: '🦅',
  Haliaeetus: '🦅',
  Pandion: '🦅',
  Pernis: '🦅',
  Gyps: '🦅',
  Neophron: '🦅',
  Gypaetus: '🦅',

  // Owls
  Tyto: '🦉',
  Athene: '🦉',
  Bubo: '🦉',
  Strix: '🦉',
  Asio: '🦉',
  Otus: '🦉',
  Aegolius: '🦉',
  Glaucidium: '🦉',
  Surnia: '🦉',

  // Waterbirds / waders
  Ardea: '🦩',
  Egretta: '🦩',
  Phoenicopterus: '🦩',
  Ciconia: '🕊',
  Grus: '🕊',
  Fulica: '🐔',
  Gallinula: '🐔',
  Rallus: '🐔',
  Charadrius: '🐦',
  Calidris: '🐦',
  Tringa: '🐦',
  Numenius: '🐦',
  Limosa: '🐦',
  Gallinago: '🐦',
  Scolopax: '🐦',
  Recurvirostra: '🐦',
  Himantopus: '🐦',
  Vanellus: '🐦',
  Pluvialis: '🐦',

  // Gulls / terns / seabirds
  Larus: '🕊',
  Chroicocephalus: '🕊',
  Ichthyaetus: '🕊',
  Sterna: '🕊',
  Thalasseus: '🕊',
  Chlidonias: '🕊',
  Stercorarius: '🕊',
  Fulmarus: '🕊',
  Puffinus: '🕊',
  Morus: '🕊',
  Phalacrocorax: '🕊',

  // Pigeons / cuckoos
  Columba: '🐦',
  Streptopelia: '🐦',
  Cuculus: '🐦',

  // Corvids
  Corvus: '🐦‍⬛',
  Pica: '🐦‍⬛',
  Garrulus: '🐦‍⬛',
  Coloeus: '🐦‍⬛',
  Pyrrhocorax: '🐦‍⬛',
  Nucifraga: '🐦‍⬛',

  // Small passerines
  Parus: '🐦',
  Cyanistes: '🐦',
  Periparus: '🐦',
  Poecile: '🐦',
  Sylvia: '🐦',
  Curruca: '🐦',
  Phylloscopus: '🐦',
  Acrocephalus: '🐦',
  Turdus: '🐦',
  Erithacus: '🐦',
  Luscinia: '🐦',
  Phoenicurus: '🐦',
  Saxicola: '🐦',
  Oenanthe: '🐦',
  Fringilla: '🐦',
  Carduelis: '🐦',
  Chloris: '🐦',
  Emberiza: '🐦',
  Passer: '🐦',
  Hirundo: '🐦',
  Delichon: '🐦',
  Motacilla: '🐦',
  Anthus: '🐦',
}

export const DEFAULT_FAMILY_EMOJI = '🐦'

export function emojiForFamily(famille: string): string {
  return FAMILY_EMOJI[famille] ?? DEFAULT_FAMILY_EMOJI
}
