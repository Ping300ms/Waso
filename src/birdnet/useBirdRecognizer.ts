import { useCallback, useRef, useState } from 'react'
import { BIRDS_BY_ID, type Bird } from '../data/birds'
import type { OutboundMessage } from './birdnet.worker'
import { CHUNK_SAMPLES } from './constants'
import BirdnetWorker from './birdnet.worker?worker'

const SAMPLE_RATE = 48_000

export type RecognizerStatus = 'idle' | 'downloading' | 'listening' | 'error'

export interface Detection {
  bird: Bird
  confidence: number
  lastSeenAt: number
}

export interface RecognizerState {
  status: RecognizerStatus
  progress: number
  errorMessage: string | null
  detections: Detection[]
  analyser: AnalyserNode | null
  start: () => Promise<void>
  stop: () => void
}

export function useBirdRecognizer(): RecognizerState {
  const [status, setStatus] = useState<RecognizerStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const workerRef = useRef<Worker | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const pendingSamplesRef = useRef<Float32Array>(new Float32Array(0))
  const chunkIdRef = useRef(0)
  const detectionsMapRef = useRef<Map<string, Detection>>(new Map())

  const stop = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void audioContextRef.current?.close()
    audioContextRef.current = null
    setAnalyser(null)
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    setErrorMessage(null)
    setStatus('downloading')
    setProgress(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyserNode = audioContext.createAnalyser()
      analyserNode.fftSize = 2048
      source.connect(analyserNode)
      setAnalyser(analyserNode)

      await audioContext.audioWorklet.addModule(
        new URL('./pcmCaptureProcessor.js', import.meta.url)
      )
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-capture-processor')
      source.connect(workletNode)

      const worker = new BirdnetWorker()
      workerRef.current = worker

      worker.onmessage = (e: MessageEvent<OutboundMessage>) => {
        const msg = e.data
        if (msg.type === 'progress') {
          setProgress(Math.round(msg.progress * 100))
        } else if (msg.type === 'ready') {
          setStatus('listening')
          setProgress(100)
        } else if (msg.type === 'error') {
          setErrorMessage(msg.message)
          setStatus('error')
        } else if (msg.type === 'predict') {
          const now = Date.now()
          for (const { birdId, confidence } of msg.predictions) {
            const bird = BIRDS_BY_ID.get(birdId)
            if (!bird) continue
            detectionsMapRef.current.set(birdId, { bird, confidence, lastSeenAt: now })
          }
          setDetections(
            Array.from(detectionsMapRef.current.values()).sort((a, b) => b.lastSeenAt - a.lastSeenAt)
          )
        }
      }

      workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
        const incoming = e.data
        const combined = new Float32Array(pendingSamplesRef.current.length + incoming.length)
        combined.set(pendingSamplesRef.current, 0)
        combined.set(incoming, pendingSamplesRef.current.length)

        let offset = 0
        while (combined.length - offset >= CHUNK_SAMPLES) {
          const chunk = combined.slice(offset, offset + CHUNK_SAMPLES)
          offset += CHUNK_SAMPLES
          worker.postMessage({ type: 'predict', chunkId: chunkIdRef.current++, pcmAudio: chunk })
        }
        pendingSamplesRef.current = combined.slice(offset)
      }

      worker.postMessage({ type: 'init', baseUrl: import.meta.env.BASE_URL })
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setStatus('error')
      stop()
    }
  }, [stop])

  return { status, progress, errorMessage, detections, analyser, start, stop }
}
