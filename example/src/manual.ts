import { createPlayer, createCallbackTicker, play, stop, insertEvent, createQueue, createTimeEvent } from '../../src'
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

  const player = createPlayer({
    context,
    ticker,
    onPlay: () => console.log('play')
  })

  const queue = createQueue()
  const event = createTimeEvent(1, 1, 10, (event) => console.log('callback tick', event.count))
  insertEvent(event, queue)

  play(queue, player)
  // notice we tick 20 but only 10 events log :)
  times(20, next)

  stop(player)

  play(queue, player)

  // notice that it does the same thing again because we stopped and started
  times(20, next)
}
