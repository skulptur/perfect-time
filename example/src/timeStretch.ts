import { createClock, createSetIntervalTicker, start, atTime, timeStretch as stretch, setTimeout, repeat, getCurrentTime} from '../../src'

export const timeStretch = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const clock = createClock({
    context,
    ticker,
  })

  start(clock)

  const eventA = repeat(3, atTime(1, () => console.log('event A'), clock))
  const eventB = repeat(3, atTime(2, () => console.log('event B'), clock))
  const eventC = repeat(3, atTime(3, () => console.log('event C'), clock))

  // the tempo will be doubled immediately for all events
  stretch(0.5, getCurrentTime(clock), clock.queue._events)

  // the tempo will be halved in 9 seconds only for eventA and eventB
  setTimeout(9, (event) => {
    stretch(2, event.time, [eventA, eventB])
  }, clock)
}
