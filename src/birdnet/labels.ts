import { BIRDS_BY_SCIENTIFIC_NAME, type Bird } from '../data/birds'

export const BIRDNET_LABELS_URL = 'birdnet/models/birdnet/labels/en_us.txt'

/**
 * Parses BirdNET's label file (`ScientificName_CommonName` per line, from
 * georg95/birdnet-web) into a lookup from model output index to the matching Waso `Bird` —
 * `null` when BirdNET knows the species but it isn't part of our 606-bird catalog. This is
 * the filter behind "only Wasodex birds are identifiable": every prediction index without a
 * match is silently dropped downstream, never shown to the user.
 */
export async function loadLabelIndexToBird(baseUrl = ''): Promise<Array<Bird | null>> {
  const text = await fetch(baseUrl + BIRDNET_LABELS_URL).then((r) => r.text())
  const lines = text.split('\n').filter((line) => line.trim() !== '')

  let matched = 0
  const result = lines.map((line) => {
    const scientificName = line.split('_')[0]
    const bird = BIRDS_BY_SCIENTIFIC_NAME.get(scientificName) ?? null
    if (bird) matched++
    return bird
  })

  // eslint-disable-next-line no-console
  console.info(`BirdNET labels: ${matched}/${lines.length} matched a Waso catalog bird`)
  return result
}
