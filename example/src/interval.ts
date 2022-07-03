import { createPlayer, createSetIntervalTicker, play, addEvent, createQueue } from '../../src'

export const interval = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const player = createPlayer({
    context,
    ticker,
  })

  const queue = createQueue()
  addEvent(1, 1, 10, (event) => console.log('interval', event.count), queue)

  play(queue, player)
}
