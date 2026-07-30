// Adapted from georg95/birdnet-web's birdnet.js (non-commercial use, see SETUP.md):
// no CDN import (bundled `@tensorflow/tfjs` instead, for true offline operation), no
// geolocation/area-model (Waso filters purely by catalog membership, see labels.ts), and
// predictions are resolved directly to Waso `Bird` ids here rather than left as raw indices.
import * as tf from '@tensorflow/tfjs'
import { registerBirdNetKernels } from './melSpecKernel'
import { loadLabelIndexToBird } from './labels'
import { CHUNK_SAMPLES } from './constants'
import type { Bird } from '../data/birds'

const MIN_CONFIDENCE = 0.5

type InboundMessage =
  | { type: 'init'; baseUrl: string }
  | { type: 'predict'; chunkId: number; pcmAudio: Float32Array }

export type OutboundMessage =
  | { type: 'progress'; stage: 'model' | 'warmup' | 'labels'; progress: number }
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'predict'; chunkId: number; predictions: Array<{ birdId: string; confidence: number }> }

let model: tf.LayersModel | null = null
let labelToBird: Array<Bird | null> = []

async function handleInit(baseUrl: string) {
  registerBirdNetKernels()
  await tf.setBackend('webgl')
  await tf.ready()

  post({ type: 'progress', stage: 'model', progress: 0 })
  model = await tf.loadLayersModel(`${baseUrl}birdnet/models/birdnet/model.json`, {
    onProgress: (progress) => post({ type: 'progress', stage: 'model', progress }),
  })

  post({ type: 'progress', stage: 'warmup', progress: 0 })
  const warm = model.predict(tf.zeros([1, CHUNK_SAMPLES])) as tf.Tensor
  await warm.data()
  warm.dispose()

  post({ type: 'progress', stage: 'labels', progress: 0 })
  labelToBird = await loadLabelIndexToBird(baseUrl)

  post({ type: 'ready' })
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
    if (bird && row[i] > MIN_CONFIDENCE) {
      predictions.push({ birdId: bird.id, confidence: row[i] })
    }
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
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
