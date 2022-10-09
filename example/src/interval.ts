import { createPlayer,createTimeEvent, createSetIntervalTicker, play, insertEvent, createQueue } from '../../src'

export const interval = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)


  const player = createPlayer({
    context,
    ticker,
    onEvent: (timeEvent) => console.log('interval', timeEvent.count)
  })

  const queue = createQueue()
  const event = createTimeEvent(1, 1, 10, null)
  insertEvent(event, queue)

  play(queue, player)
}
