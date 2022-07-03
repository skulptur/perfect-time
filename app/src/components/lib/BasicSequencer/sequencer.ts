import { createPlayer, createWorkerSetIntervalTicker, play, addEvent } from '../../../../../src'

export const sequencer = (context: AudioContext) => {
  const player = createPlayer({
    context,
    ticker: createWorkerSetIntervalTicker(100),
  })

  addEvent(
    0,
    0.1,
    Infinity,
    (event) => console.log('script processor', event.count, event.time - context.currentTime),
    player
  )

  play(player)
}
