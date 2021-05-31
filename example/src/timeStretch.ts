import { createClock, createSetIntervalTicker } from '../../src'

export const timeStretch = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const clock = createClock({
    context,
    ticker,
  })

  clock.start()

  const eventA = clock.atTime(1, () => console.log('event A')).repeat(3)
  const eventB = clock.atTime(2, () => console.log('event B')).repeat(3)
  const eventC = clock.atTime(3, () => console.log('event C')).repeat(3)

  // the tempo will be doubled immediately for all events
  clock.timeStretch(0.5)

  // the tempo will be halved in 9 seconds only for eventA and eventB
  clock.setTimeout(9, (event) => {
    clock.timeStretch(2, event.time, [eventA, eventB])
  })
}
