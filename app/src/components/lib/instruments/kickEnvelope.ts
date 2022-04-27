export const kickEnvelope = (context: AudioContext, destination: AudioNode, time: number) => {
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.connect(gain)
  gain.connect(destination)
  osc.frequency.setValueAtTime(300, time)
  osc.start(time)
  gain.gain.setValueAtTime(0, time)

  // osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5)
  // gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)

  return {
    osc,
    gain,
    stop: (time: number) => osc.stop(time),
  }
}
