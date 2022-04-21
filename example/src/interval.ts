import { createTimeline, createSetIntervalTicker, play, createEvent } from '../../src'

export const interval = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const timeline = createTimeline({
    context,
    ticker,
  })

  createEvent(1, 1, 10, (event) => console.log('interval', event.count), timeline)

  play(timeline)
}
