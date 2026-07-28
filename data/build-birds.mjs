// Regenerates src/data/birds.generated.json from BIRDS.csv at the repo root.
// Run with: npm run build:birds (whenever BIRDS.csv is edited).
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CSV_PATH = path.join(__dirname, '..', 'BIRDS.csv')
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'birds.generated.json')

const RARETE_VALUES = new Set(['Commun', 'Rare', 'Epique', 'Legendaire'])

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics (accents) after NFD normalization
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsv(raw) {
  // Strip UTF-8 BOM if present.
  const text = raw.replace(/^﻿/, '')
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(';').map((h) => h.trim())
  return rows.map((line) => {
    const cells = line.split(';')
    const record = {}
    headers.forEach((h, i) => {
      record[h] = (cells[i] ?? '').trim()
    })
    return record
  })
}

function build() {
  const raw = readFileSync(CSV_PATH, 'utf-8')
  const records = parseCsv(raw)

  const seenIds = new Map()
  const birds = records.map((record, index) => {
    const scientificName = record.ScientificName
    const fullScientificName = record.FullScientificName
    const frenchName = record.FrenchName
    const category = record.Category
    const rarete = record.Rarete

    if (!scientificName) {
      throw new Error(`Row ${index + 2}: missing ScientificName`)
    }
    if (!RARETE_VALUES.has(rarete)) {
      throw new Error(`Row ${index + 2} (${scientificName}): invalid Rarete "${rarete}"`)
    }

    const famille = scientificName.split(/\s+/)[0]
    const id = slugify(scientificName)

    if (seenIds.has(id)) {
      throw new Error(
        `Duplicate bird id "${id}" for "${scientificName}" (already used by "${seenIds.get(id)}")`
      )
    }
    seenIds.set(id, scientificName)

    return {
      id,
      scientificName,
      fullScientificName,
      frenchName,
      category,
      famille,
      rarete,
    }
  })

  writeFileSync(OUT_PATH, JSON.stringify(birds, null, 2) + '\n', 'utf-8')
  console.log(`Wrote ${birds.length} birds to ${path.relative(process.cwd(), OUT_PATH)}`)
}

build()
