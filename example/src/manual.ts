import { createPlayer, createCallbackTicker, play, stop, insertEvent, createQueue, createTimeEvent } from '../../src'
import { times } from 'data-fns'

type EventData = {
  id: number,
  velocity: number,
  note: string
}

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
    onStop: () => console.log(player.context.currentTime, 'stop'),
    onPlay: () => console.log(player.context.currentTime, 'play'),
    onEvent: (event) => console.log(player.context.currentTime, event.time, event.data)
  })

  const event = createTimeEvent(1, 1, 10, { id: 1 ,velocity: 0.8, note: "C4"})
  const queue = createQueue({timeEvents: [event]})

  // insertEvent(event, queue)

  play(queue, player)
  // notice we tick 20 but only 10 events log :)
  times(20, next)

  stop(player)

  play(queue, player)


  // TODO: not working
  // notice that it does the same thing again because we stopped and started
  times(20, next)
}
