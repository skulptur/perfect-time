import { createTimeline, createWorkerSetIntervalTicker, play, createEvent, TimeEvent } from '../../../src'

import { kick } from './lib/instruments/kick'
import { kickEnvelope } from './lib/instruments/kickEnvelope'
import { snare } from './lib/instruments/snare'
import { hat } from './lib/instruments/hat'
import { ADSRNode } from './lib/instruments/adsr'

export const sequencer = (context: AudioContext, onPlay: (id: number) => void) => {
  const timeline = createTimeline({
    context,
    ticker: createWorkerSetIntervalTicker(100),
  })

  var volumeEnvelope = ADSRNode(context, {
    attack: 0.1, // seconds until hitting 1.0
    decay: 0.2, // seconds until hitting sustain value
    sustain: 0.2, // sustain value
    release: 0.3, // seconds until returning back to 0.0
  }) as any
  volumeEnvelope.start()

  var pitchEnvelope = ADSRNode(context, {
    attack: 0.1, // seconds until hitting 1.0
    decay: 0.2, // seconds until hitting sustain value
    sustain: 0.2, // sustain value
    release: 0.1, // seconds until returning back to 0.0
    base: 0.1,
    peak: 300,
  }) as any
  pitchEnvelope.start()

  const kickEnv = kickEnvelope(context, context.destination, context.currentTime)

  volumeEnvelope.connect(kickEnv.gain.gain)
  pitchEnvelope.connect(kickEnv.osc.frequency)

  const playKick = (event: TimeEvent) => {
    if (Math.random() > 0.5) return
    console.log('kick', event.count, event.time - context.currentTime)
    // kick(context, context.destination, event.time)
    volumeEnvelope.trigger(event.time)
    volumeEnvelope.release(event.time + 0.01)

    pitchEnvelope.trigger(event.time)
    pitchEnvelope.release(event.time + 0.01)
    onPlay(0)
  }

  // const playSnare = (event: TimeEvent) => {
  //   if (Math.random() > 0.2) return
  //   console.log('snare', event.count, event.time - context.currentTime)
  //   snare(context, context.destination, event.time)
  //   onPlay(1)
  // }

  // const playHat = (event: TimeEvent) => {
  //   if (Math.random() > 0.2) return
  //   console.log('hat', event.count, event.time - context.currentTime)
  //   hat(context, context.destination, event.time)
  //   onPlay(2)
  // }

  // createEvent(0, 1 / 16, Infinity, playHat, timeline)
  // createEvent(1 / 4, 1 / 8, Infinity, playSnare, timeline)
  createEvent(0, 1 / 8, Infinity, playKick, timeline)

  play(timeline)
}
