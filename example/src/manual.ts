import { createClock, createCallbackTicker, start, every, limit } from '../../src'
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

  start(clock)

  const event = every(
    1,
    (event) => {
      console.log('callback tick', event.count, event)
    },
    clock
  )

  limit(10, event, clock.queue)

  // notice we loop 20 but only 10 events log :)
  times(20, next)
}
