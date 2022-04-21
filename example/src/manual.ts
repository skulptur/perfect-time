import { createTimeline, createCallbackTicker, play, stop, createEvent } from '../../src'
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

  const timeline = createTimeline({
    context,
    ticker,
  })

  createEvent(1, 1, 10, (event) => console.log('callback tick', event.count), timeline)

  play(timeline)
  // notice we tick 20 but only 10 events log :)
  times(20, next)

  stop(timeline)

  play(timeline)
  // notice we tick 20 but only 10 events log :)
  times(20, next)
}
