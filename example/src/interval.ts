import { createClock, createSetIntervalTicker } from '../../src'

export const interval = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const clock = createClock({
    context,
    ticker,
  })

  clock.start()

  clock
    .every(1, (event) => {
      console.log('interval', event.count)
    })
    .limit(10)
}
