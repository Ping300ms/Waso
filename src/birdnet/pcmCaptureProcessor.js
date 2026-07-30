// AudioWorkletProcessor: forwards raw mono PCM blocks from the mic to the main thread, where
// useBirdRecognizer accumulates them into 3s (144 000-sample) windows for the BirdNET worker.
// Kept as a standalone script (no imports) — it runs in the separate AudioWorkletGlobalScope,
// loaded via `audioContext.audioWorklet.addModule(url)`.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]
    if (input && input[0]) {
      // Copy out of the reused Web Audio buffer — postMessage would otherwise transfer/detach it.
      this.port.postMessage(input[0].slice())
    }
    return true
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor)
