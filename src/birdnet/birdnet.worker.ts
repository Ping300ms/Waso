// Adapted from georg95/birdnet-web's birdnet.js (non-commercial use, see SETUP.md):
// no CDN import (bundled `@tensorflow/tfjs` instead, for true offline operation), and
// predictions are resolved directly to Waso `Bird` ids here rather than left as raw indices.
// The area-model (location/season filter) IS used here, unlike upstream's default off-state —
// see handleLocation below.
import * as tf from '@tensorflow/tfjs'
import { registerBirdNetKernels } from './melSpecKernel'
import { loadLabelIndexToBird } from './labels'
import { CHUNK_SAMPLES } from './constants'
import type { Bird } from '../data/birds'

const MIN_CONFIDENCE = 0.5
const MIN_AREA_CONFIDENCE = 0.1

type InboundMessage =
  | { type: 'init'; baseUrl: string }
  | { type: 'predict'; chunkId: number; pcmAudio: Float32Array }
  | { type: 'location'; latitude: number; longitude: number }

export type OutboundMessage =
  | { type: 'progress'; stage: 'model' | 'warmup' | 'labels'; progress: number }
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'predict'; chunkId: number; predictions: Array<{ birdId: string; confidence: number }> }

let model: tf.LayersModel | null = null
let areaModel: tf.GraphModel | null = null
let labelToBird: Array<Bird | null> = []
/** Per-species geoscore for the currently selected location/date, indexed like `labelToBird`. */
let areaScores: Float32Array | null = null

async function handleInit(baseUrl: string) {
  registerBirdNetKernels()
  await tf.setBackend('webgl')
  await tf.ready()

  post({ type: 'progress', stage: 'model', progress: 0 })
  model = await tf.loadLayersModel(`${baseUrl}birdnet/models/birdnet/model.json`, {
    onProgress: (progress) => post({ type: 'progress', stage: 'model', progress }),
  })
  areaModel = await tf.loadGraphModel(`${baseUrl}birdnet/models/birdnet/area-model/model.json`)

  post({ type: 'progress', stage: 'warmup', progress: 0 })
  const warm = model.predict(tf.zeros([1, CHUNK_SAMPLES])) as tf.Tensor
  await warm.data()
  warm.dispose()

  post({ type: 'progress', stage: 'labels', progress: 0 })
  labelToBird = await loadLabelIndexToBird(baseUrl)

  post({ type: 'ready' })
}

/** ISO-like week-of-year, matching BirdNET's area-model training convention (georg95/birdnet-web). */
function weekOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  startOfYear.setDate(startOfYear.getDate() + (1 - (startOfYear.getDay() % 7)))
  return Math.round((date.getTime() - startOfYear.getTime()) / 604_800_000) + 1
}

async function handleLocation(latitude: number, longitude: number) {
  if (!areaModel) return
  const week = weekOfYear(new Date())
  const input = tf.tensor([[latitude, longitude, week]])
  const output = areaModel.predict(input) as tf.Tensor
  input.dispose()
  const data = (await output.data()) as Float32Array
  output.dispose()
  areaScores = data
}

async function handlePredict(chunkId: number, pcmAudio: Float32Array) {
  if (!model) return

  const input = tf.tensor(pcmAudio, [1, pcmAudio.length])
  const output = model.predict(input) as tf.Tensor
  input.dispose()
  const scores = (await output.array()) as number[][]
  output.dispose()

  const row = scores[0] ?? []
  const predictions: Array<{ birdId: string; confidence: number }> = []
  for (let i = 0; i < row.length; i++) {
    const bird = labelToBird[i]
    if (!bird || row[i] <= MIN_CONFIDENCE) continue
    if (areaScores && areaScores[i] <= MIN_AREA_CONFIDENCE) continue
    predictions.push({ birdId: bird.id, confidence: row[i] })
  }
  post({ type: 'predict', chunkId, predictions })
}

function post(message: OutboundMessage) {
  ;(self as unknown as Worker).postMessage(message)
}

self.onmessage = async (e: MessageEvent<InboundMessage>) => {
  try {
    if (e.data.type === 'init') await handleInit(e.data.baseUrl)
    if (e.data.type === 'predict') await handlePredict(e.data.chunkId, e.data.pcmAudio)
    if (e.data.type === 'location') await handleLocation(e.data.latitude, e.data.longitude)
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
