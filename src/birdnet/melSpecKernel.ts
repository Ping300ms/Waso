// @ts-nocheck
// Vendored (adapted) from georg95/birdnet-web's birdnet.js — non-commercial use, see SETUP.md.
// This registers the custom Keras layer (`MelSpecLayerSimple`) baked into BirdNET's TFJS
// graph (it computes the mel-spectrogram *inside* the model, so we feed it raw PCM), plus a
// hand-written WebGL kernel implementing the STFT that layer needs. Both touch TF.js's
// internal/undocumented backend APIs (`runWebGLProgram`, `runKernel`, ...) that aren't part
// of the public TypeScript types — hence `@ts-nocheck` for this file specifically, rather
// than trying to force types onto an intentionally-vendored, version-sensitive adaptation.
import * as tf from '@tensorflow/tfjs'

export class MelSpecLayerSimple extends tf.layers.Layer {
  constructor(config) {
    super(config)
    this.sampleRate = config.sampleRate
    this.specShape = config.specShape ?? config.spec_shape
    this.frameStep = config.frameStep ?? config.frame_step
    this.frameLength = config.frameLength ?? config.frame_length
    this.melFilterbank = tf.tensor2d(config.melFilterbank ?? config.mel_filterbank)
  }

  build(inputShape) {
    this.magScale = this.addWeight(
      'magnitude_scaling',
      [],
      'float32',
      tf.initializers.constant({ value: 1.23 })
    )
    super.build(inputShape)
  }

  computeOutputShape(inputShape) {
    return [inputShape[0], this.specShape[0], this.specShape[1], 1]
  }

  call(inputs) {
    return tf.tidy(() => {
      inputs = inputs[0]
      return tf.stack(
        inputs.split(inputs.shape[0]).map((input) => {
          let spec = input.squeeze()
          spec = tf.sub(spec, tf.min(spec, -1, true))
          spec = tf.div(spec, tf.max(spec, -1, true).add(0.000001))
          spec = tf.sub(spec, 0.5)
          spec = tf.mul(spec, 2.0)
          spec = tf.engine().runKernel('STFT', {
            signal: spec,
            frameLength: this.frameLength,
            frameStep: this.frameStep,
          })
          spec = tf.matMul(spec, this.melFilterbank)
          spec = spec.pow(2.0)
          spec = spec.pow(tf.div(1.0, tf.add(1.0, tf.exp(this.magScale.read()))))
          spec = tf.reverse(spec, -1)
          spec = tf.transpose(spec)
          spec = spec.expandDims(-1)
          return spec
        })
      )
    })
  }

  static get className() {
    return 'MelSpecLayerSimple'
  }
}

let registered = false

/** Registers the custom layer class + WebGL `STFT` kernel with TF.js. Idempotent — safe to
 * call every time the worker starts up. */
export function registerBirdNetKernels() {
  if (registered) return
  registered = true

  tf.serialization.registerClass(MelSpecLayerSimple)

  tf.registerKernel({
    kernelName: 'STFT',
    backendName: 'webgl',
    kernelFunc: ({ backend, inputs: { signal, frameLength, frameStep } }) => {
      const innerDim = frameLength / 2
      const batch = ((signal.size - frameLength + frameStep) / frameStep) | 0
      let currentTensor = backend.runWebGLProgram(
        {
          variableNames: ['x'],
          outputShape: [batch, frameLength],
          userCode: `
            void main() {
                ivec2 coords = getOutputCoords();
                int p = coords[1] % ${innerDim};
                int k = 0;
                for (int i = 0; i < ${Math.log2(innerDim)}; ++i) {
                    if ((p & (1 << i)) != 0) { k |= (1 << (${Math.log2(innerDim) - 1} - i)); }
                }
                int i = 2 * k;
                if (coords[1] >= ${innerDim}) {
                    i = 2 * (k % ${innerDim}) + 1;
                }
                int q = coords[0] * ${frameLength} + i;
                float val = getX((q / ${frameLength}) * ${frameStep} + q % ${frameLength});
                float cosArg = ${(2.0 * Math.PI) / frameLength} * float(q);
                float mul = 0.5 - 0.5 * cos(cosArg);
                setOutput(val * mul);
            }`,
        },
        [signal],
        'float32'
      )
      for (let len = 1; len < innerDim; len *= 2) {
        let prevTensor = currentTensor
        currentTensor = backend.runWebGLProgram(
          {
            variableNames: ['x'],
            outputShape: [batch, innerDim * 2],
            userCode: `void main() {
                    ivec2 coords = getOutputCoords();
                    int batch = coords[0];
                    int i = coords[1];
                    int k = i % ${innerDim};
                    int isHigh = (k % ${len * 2}) / ${len};
                    int highSign = (1 - isHigh * 2);
                    int baseIndex = k - isHigh * ${len};
                    float t = ${Math.PI / len} * float(k % ${len});
                    float a = cos(t);
                    float b = sin(-t);
                    float oddK_re = getX(batch, baseIndex + ${len});
                    float oddK_im = getX(batch, baseIndex + ${len + innerDim});
                    if (i < ${innerDim}) { // real
                        float evenK_re = getX(batch, baseIndex);
                        setOutput(evenK_re + (oddK_re * a - oddK_im * b) * float(highSign));
                    } else { // imaginary
                        float evenK_im = getX(batch, baseIndex + ${innerDim});
                        setOutput(evenK_im + (oddK_re * b + oddK_im * a) * float(highSign));
                    }
                }`,
          },
          [currentTensor],
          'float32'
        )
        backend.disposeIntermediateTensorInfo(prevTensor)
      }
      const real = backend.runWebGLProgram(
        {
          variableNames: ['x'],
          outputShape: [batch, innerDim + 1],
          userCode: `void main() {
                ivec2 coords = getOutputCoords();
                int batch = coords[0];
                int i = coords[1];
                int zI = i % ${innerDim};
                int conjI = (${innerDim} - i) % ${innerDim};
                float Zk0 = getX(batch, zI);
                float Zk1 = getX(batch, zI+${innerDim});
                float Zk_conj0 = getX(batch, conjI);
                float Zk_conj1 = -getX(batch, conjI+${innerDim});
                float t = ${-2 * Math.PI} * float(i) / float(${innerDim * 2});
                float diff0 = Zk0 - Zk_conj0;
                float diff1 = Zk1 - Zk_conj1;
                float result = (Zk0 + Zk_conj0 + cos(t) * diff1 + sin(t) * diff0) * 0.5;
                setOutput(result);
            }`,
        },
        [currentTensor],
        'float32'
      )
      backend.disposeIntermediateTensorInfo(currentTensor)
      return real
    },
  })
}
