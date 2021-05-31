import { createClock, createCallbackTicker } from '../../src'
import { times } from 'data-fns'

export const manual = () => {
  const [ticker, tick] = createCallbackTicker()
  const context = {
    currentTime: 0,
  }

  const next = () => {
    context.currentTime++
    tick()
  }

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

  // notice we loop 20 but only 10 events log :)
  times(20, next)
}
