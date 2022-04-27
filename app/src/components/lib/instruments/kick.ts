export const kick = (context: AudioContext, destination: AudioNode, time: number) => {
  const osc = context.createOscillator()
  const gain = context.createGain()
  osc.connect(gain)
  gain.connect(destination)
  osc.frequency.setValueAtTime(300, time)
  gain.gain.setValueAtTime(1, time)

  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5)
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5)

  osc.start(time)

  osc.stop(time + 0.5)
}
