import { ALL_BIRDS } from "../data/birds";
import type { BadgeDef, CaughtBird } from "./badges";
import { singleTier } from "./badges";

/** Resolves French bird names to stable IDs, failing fast on typos (same philosophy as
 * `data/build-birds.mjs`'s uniqueness check) — these lists are curated by hand, so a
 * silent miss would quietly break a badge instead of surfacing immediately. */
function resolveIds(frenchNames: string[]): string[] {
  return frenchNames.map((name) => {
    const bird = ALL_BIRDS.find((b) => b.frenchName === name);
    if (!bird) throw new Error(`thematicBadges: unknown bird name "${name}"`);
    return bird.id;
  });
}

function checklistBadge(
  id: string,
  category: BadgeDef["category"],
  label: string,
  emoji: string,
  pool: string[],
  requiredCount: number,
): BadgeDef {
  const memberBirdIds = resolveIds(pool);
  return {
    id,
    kind: "checklist",
    category,
    memberBirdIds,
    groupSize: requiredCount,
    tiers: singleTier(requiredCount),
    label,
    emoji,
  };
}

function customBadge(
  id: string,
  category: BadgeDef["category"],
  label: string,
  emoji: string,
  description: string,
  requiredCount: number,
  evaluate: (sightings: CaughtBird[]) => number,
): BadgeDef {
  return {
    id,
    kind: "custom",
    category,
    description,
    groupSize: requiredCount,
    tiers: singleTier(requiredCount),
    label,
    emoji,
    evaluate,
  };
}

// --- Quand ---------------------------------------------------------------

const NOCTURNAL_SPECIES = [
  "Effraie des clochers",
  "Chevêche d'Athéna",
  "Chevêchette d'Europe",
  "Petit-duc scops",
  "Hibou moyen-duc",
  "Hibou des marais",
  "Harfang des neiges",
  "Grand-duc d'Europe",
  "Chouette hulotte",
  "Chouette de Tengmalm",
  "Engoulevent d'Europe",
  "Engoulevent à collier roux",
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function buildLeveTotBadge(): BadgeDef {
  return customBadge(
    "custom-leve-tot",
    "temporalite",
    "Lève-tôt",
    "🌅",
    "Observer un oiseau avant 7h du matin.",
    1,
    (sightings) =>
      sightings.some(
        (s) =>
          s.firstSeenTime &&
          timeToMinutes(s.firstSeenTime) < timeToMinutes("07:00"),
      )
        ? 1
        : 0,
  );
}

function buildOiseauDeNuitBadge(): BadgeDef {
  const nocturnalIds = new Set(resolveIds(NOCTURNAL_SPECIES));
  return customBadge(
    "custom-oiseau-de-nuit",
    "temporalite",
    "Oiseau de nuit",
    "🌙",
    "Valider une espèce nocturne (chouette, hibou, engoulevent...) ou observer après 22h.",
    1,
    (sightings) => {
      const hasNocturnalSpecies = sightings.some((s) =>
        nocturnalIds.has(s.birdId),
      );
      const hasLateSighting = sightings.some(
        (s) =>
          s.firstSeenTime &&
          timeToMinutes(s.firstSeenTime) > timeToMinutes("22:00"),
      );
      return hasNocturnalSpecies || hasLateSighting ? 1 : 0;
    },
  );
}

// --- Où --------------------------------------------------------------------

const WETLAND_POOL = [
  "Canard colvert",
  "Canard chipeau",
  "Canard souchet",
  "Sarcelle d'hiver",
  "Sarcelle d'été",
  "Fuligule milouin",
  "Fuligule morillon",
  "Nette rousse",
  "Foulque macroule",
  "Gallinule poule-d'eau",
  "Grèbe castagneux",
  "Grèbe huppé",
  "Grèbe à cou noir",
  "Héron cendré",
  "Aigrette garzette",
  "Grande Aigrette",
  "Héron pourpré",
  "Blongios nain",
  "Butor étoilé",
  "Bihoreau gris",
  "Cygne tuberculé",
  "Tadorne de Belon",
  "Echasse blanche",
  "Avocette élégante",
  "Râle d'eau",
  "Marouette ponctuée",
  "Bécassine des marais",
  "Chevalier gambette",
];

const PELAGIC_POOL = [
  "Fou de Bassan",
  "Macareux moine",
  "Guillemot de Troïl",
  "Pingouin torda",
  "Goéland argenté",
  "Goéland marin",
  "Goéland brun",
  "Goéland leucophée",
  "Mouette rieuse",
  "Grand Cormoran",
  "Cormoran huppé",
  "Sterne pierregarin",
  "Sterne caugek",
  "Fulmar boréal",
  "Puffin des Anglais",
  "Labbe parasite",
];

const MOUNTAIN_POOL = [
  "Tichodrome échelette",
  "Chocard à bec jaune",
  "Lagopède alpin",
  "Gypaète barbu",
  "Aigle royal",
  "Niverolle alpine",
  "Accenteur alpin",
  "Venturon montagnard",
  "Crave à bec rouge",
  "Perdrix bartavelle",
];

const URBAN_POOL = [
  "Moineau domestique",
  "Étourneau sansonnet",
  "Pigeon ramier",
  "Pigeon biset",
  "Rougequeue noir",
  "Merle noir",
  "Mésange charbonnière",
  "Tourterelle turque",
  "Corneille noire",
];

// --- Quoi --------------------------------------------------------------------

const TINY_POOL = [
  "Roitelet huppé",
  "Roitelet à triple bandeau",
  "Troglodyte mignon",
  "Mésange bleue",
  "Pouillot véloce",
];

const HEAVY_POOL = [
  "Aigle royal",
  "Vautour fauve",
  "Cygne tuberculé",
  "Grande Aigrette",
  "Cygne chanteur",
  "Outarde barbue",
  "Grue cendrée",
];

const COLORFUL_POOL = [
  "Martin-pêcheur d'Europe",
  "Guêpier d'Europe",
  "Loriot d'Europe",
  "Huppe fasciée",
  "Rollier d'Europe",
  "Chardonneret élégant",
  "Bouvreuil pivoine",
  "Verdier d'Europe",
];

const SHINY_POOL = [
  "Balbuzard pêcheur",
  "Râle des genêts",
  "Outarde canepetière",
  "Vautour percnoptère",
  "Aigle de Bonelli",
  "Gypaète barbu",
  "Butor étoilé",
  "Sarcelle marbrée",
  "Courlis cendré",
  "Pie-grièche à tête rousse",
];

const MASTER_SHOT_POOL = ["Perdrix bartavelle"];

// --- Comportement ------------------------------------------------------------

const RAPTOR_DIURNAL_GENERA = new Set([
  "Falco",
  "Buteo",
  "Aquila",
  "Milvus",
  "Circus",
  "Accipiter",
  "Astur",
  "Haliaeetus",
  "Pandion",
  "Pernis",
  "Gyps",
  "Neophron",
  "Gypaetus",
  "Clanga",
  "Hieraaetus",
  "Circaetus",
  "Aegypius",
  "Elanus",
]);

const SINGERS_POOL = [
  "Rossignol philomèle",
  "Merle noir",
  "Fauvette à tête noire",
  "Grive musicienne",
  "Alouette des champs",
  "Bruant jaune",
];

const PASSAGE_MIGRANT_POOL = [
  "Phragmite des joncs",
  "Chevalier sylvain",
  "Bécasseau cocorli",
  "Traquet motteux",
  "Gorgebleue à miroir",
  "Pie-grièche écorcheur",
  "Bondrée apivore",
  "Faucon hobereau",
];

function buildSeigneurDesCieuxBadge(): BadgeDef {
  const raptors = ALL_BIRDS.filter((b) => RAPTOR_DIURNAL_GENERA.has(b.famille));
  return {
    id: "checklist-seigneur-des-cieux",
    kind: "checklist",
    category: "comportement",
    memberBirdIds: raptors.map((b) => b.id),
    groupSize: raptors.length,
    tiers: singleTier(raptors.length),
    label: "Seigneur des Cieux",
    emoji: "🦅",
  };
}

// --- Progression ---------------------------------------------------------------

function buildPremierePlumeBadge(): BadgeDef {
  return customBadge(
    "custom-premiere-plume",
    "progression",
    "Première plume",
    "🪶",
    "Valider la toute première observation.",
    1,
    (sightings) => (sightings.length > 0 ? 1 : 0),
  );
}

/** Longest run of consecutive calendar days containing at least one sighting date. */
function longestDateStreak(dates: string[]): number {
  const uniqueDays = Array.from(new Set(dates)).sort();
  if (uniqueDays.length === 0) return 0;

  let longest = 1;
  let current = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1] + "T00:00:00Z");
    const curr = new Date(uniqueDays[i] + "T00:00:00Z");
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

const CARNET_DE_TERRAIN_TARGET = 7;

function buildCarnetDeTerrainBadge(): BadgeDef {
  return customBadge(
    "custom-carnet-de-terrain",
    "progression",
    "Carnet de terrain",
    "📓",
    `Enregistrer des observations ${CARNET_DE_TERRAIN_TARGET} jours d'affilée.`,
    CARNET_DE_TERRAIN_TARGET,
    (sightings) => {
      const dates = sightings
        .filter((s) => s.firstSeenDate)
        .map((s) => s.firstSeenDate!);
      return Math.min(longestDateStreak(dates), CARNET_DE_TERRAIN_TARGET);
    },
  );
}

export function buildThematicBadgeDefs(): BadgeDef[] {
  return [
    buildLeveTotBadge(),
    buildOiseauDeNuitBadge(),
    checklistBadge(
      "checklist-pieds-dans-leau",
      "terrain",
      "Pieds dans l'eau",
      "🦆",
      WETLAND_POOL,
      10,
    ),
    checklistBadge(
      "checklist-loup-de-mer",
      "terrain",
      "Loup de mer",
      "⚓",
      PELAGIC_POOL,
      5,
    ),
    checklistBadge(
      "checklist-alpiniste",
      "terrain",
      "Alpiniste",
      "🏔️",
      MOUNTAIN_POOL,
      4,
    ),
    checklistBadge(
      "checklist-citadin",
      "terrain",
      "Citadin",
      "🏙️",
      URBAN_POOL,
      5,
    ),
    checklistBadge(
      "checklist-format-pocket",
      "physique",
      "Format Pocket",
      "🔍",
      TINY_POOL,
      3,
    ),
    checklistBadge(
      "checklist-poids-lourd",
      "physique",
      "Poids Lourd",
      "🏋️",
      HEAVY_POOL,
      4,
    ),
    checklistBadge(
      "checklist-feu-artifice",
      "physique",
      "Feu d'artifice",
      "🎆",
      COLORFUL_POOL,
      4,
    ),
    checklistBadge(
      "checklist-shiny-hunter",
      "physique",
      "Shiny Hunter",
      "✨",
      SHINY_POOL,
      1,
    ),
    checklistBadge(
      "checklist-master-shot",
      "physique",
      "Coup du roi",
      "🐦‍🔥",
      MASTER_SHOT_POOL,
      1,
    ),
    buildSeigneurDesCieuxBadge(),
    checklistBadge(
      "checklist-maestro",
      "comportement",
      "Maestro",
      "🎵",
      SINGERS_POOL,
      5,
    ),
    checklistBadge(
      "checklist-grand-migrateur",
      "comportement",
      "Grand Migrateur",
      "🧭",
      PASSAGE_MIGRANT_POOL,
      5,
    ),
    buildPremierePlumeBadge(),
    buildCarnetDeTerrainBadge(),
  ];
}
