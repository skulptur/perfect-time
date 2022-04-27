const fundamental = 40
const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21]

export const hat = (context: AudioContext, destination: AudioNode, time: number) => {
  const gain = context.createGain()

  // Bandpass
  const bandpass = context.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 10000

  // Highpass
  const highpass = context.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 7000

  // Connect the graph
  bandpass.connect(highpass)
  highpass.connect(gain)
  gain.connect(destination)

  // Create the oscillators
  ratios.forEach((ratio) => {
    const osc = context.createOscillator()
    osc.type = 'square'
    // Frequency is the fundamental * this oscillator's ratio
    osc.frequency.value = fundamental * ratio
    osc.connect(bandpass)
    osc.start(time)
    osc.stop(time + 0.3)
  })

  // Define the volume envelope
  gain.gain.setValueAtTime(0.00001, time)
  gain.gain.exponentialRampToValueAtTime(1, time + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.3, time + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.00001, time + 0.3)
}
