/** Shared between the main thread and the worker — kept in its own file (no TF.js import)
 * so importing it from the main thread doesn't pull the worker's heavy dependencies along. */
export const CHUNK_SAMPLES = 144_000 // 3s @ 48kHz — BirdNET's native input window
