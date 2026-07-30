import { useEffect, useRef } from 'react'

interface SpectrogramCanvasProps {
  analyser: AnalyserNode | null
}

/** Scrolling spectrogram, Merlin-style: each animation frame draws one new column of
 * frequency-amplitude-colored pixels on the right edge, shifting previous columns left. */
export function SpectrogramCanvas({ analyser }: SpectrogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!analyser) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const data = new Uint8Array(analyser.frequencyBinCount)
    let frame: number

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)

    function draw() {
      analyser!.getByteFrequencyData(data)

      const imageData = ctx!.getImageData(1, 0, width - 1, height)
      ctx!.putImageData(imageData, 0, 0)

      for (let y = 0; y < height; y++) {
        // Low frequencies at the bottom, high at the top — matches how bird calls read.
        const binIndex = Math.floor(((height - y) / height) * data.length)
        const amplitude = data[binIndex] ?? 0
        ctx!.fillStyle = amplitudeToColor(amplitude)
        ctx!.fillRect(width - 1, y, 1, 1)
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={120}
      className="w-full h-32 rounded-lg bg-slate-950"
    />
  )
}

function amplitudeToColor(amplitude: number): string {
  // 0-255 -> dark background through violet/amber for louder bins.
  const t = amplitude / 255
  const r = Math.round(15 + t * 240)
  const g = Math.round(23 + t * 80)
  const b = Math.round(42 + t * 160)
  return `rgb(${r}, ${g}, ${b})`
}
