// Downloads the BirdNET TFJS model (vendored from georg95/birdnet-web, non-commercial use —
// see SETUP.md) into public/birdnet/, which is gitignored: run this once locally, and again
// in CI before `npm run build` (see .github/workflows/deploy.yml).
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://raw.githubusercontent.com/georg95/birdnet-web/main/models/birdnet'
const OUT_DIR = path.join(__dirname, '..', 'public', 'birdnet', 'models', 'birdnet')

const SHARD_COUNT = 13

const FILES = [
  'model.json',
  ...Array.from({ length: SHARD_COUNT }, (_, i) => `group1-shard${i + 1}of${SHARD_COUNT}.bin`),
  'labels/en_us.txt',
]

async function fetchFile(name) {
  const url = `${BASE_URL}/${name}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

async function main() {
  await mkdir(path.join(OUT_DIR, 'labels'), { recursive: true })

  for (const name of FILES) {
    const dest = path.join(OUT_DIR, name)
    process.stdout.write(`Fetching ${name}... `)
    const data = await fetchFile(name)
    await writeFile(dest, data)
    console.log(`${(data.length / 1024 / 1024).toFixed(2)} MB`)
  }

  console.log(`Done. Model files written to ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
