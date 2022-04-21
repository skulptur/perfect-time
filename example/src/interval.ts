import { createClock, createSetIntervalTicker, start, every, limit } from '../../src'

export const interval = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const clock = createClock({
    context,
    ticker,
  })

  start(clock)

  const event = every(
    1,
    (event) => {
      console.log('interval', event.count)
    },
    clock
  )

  limit(10, event, clock.queue)
}
