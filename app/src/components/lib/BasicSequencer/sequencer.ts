import { createTimeline, createWorkerSetIntervalTicker, play, createEvent } from '../../../../../src'

export const sequencer = (context: AudioContext) => {
  const timeline = createTimeline({
    context,
    ticker: createWorkerSetIntervalTicker(100),
  })

  createEvent(
    0,
    0.1,
    Infinity,
    (event) => console.log('script processor', event.count, event.time - context.currentTime),
    timeline
  )

  play(timeline)
}
