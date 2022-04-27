const noiseBuffer = (context: AudioContext) => {
  const bufferSize = context.sampleRate
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const output = buffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1
  }

  return buffer
}

export const snare = (context: AudioContext, destination: AudioNode, time: number) => {
  const noise = context.createBufferSource()
  noise.buffer = noiseBuffer(context)

  const noiseFilter = context.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1000
  noise.connect(noiseFilter)

  const noiseEnvelope = context.createGain()
  noiseFilter.connect(noiseEnvelope)

  noiseEnvelope.connect(destination)

  const osc = context.createOscillator()
  osc.type = 'triangle'

  const oscEnvelope = context.createGain()
  osc.connect(oscEnvelope)
  oscEnvelope.connect(destination)

  // trigger (maybe could be yet another fn if the part above is "reusable")
  noiseEnvelope.gain.setValueAtTime(1, time)
  noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2)
  noise.start(time)

  osc.frequency.setValueAtTime(100, time)
  oscEnvelope.gain.setValueAtTime(0.7, time)
  oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
  osc.start(time)

  osc.stop(time + 0.2)
  noise.stop(time + 0.2)
}
