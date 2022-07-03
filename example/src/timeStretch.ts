import {
  createPlayer,
  createSetIntervalTicker,
  play,
  timeStretch as stretch,
  addEvent,
  getContextTime,
  getScheduledEvents, createQueue,
} from '../../src'

export const timeStretch = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const player = createPlayer({
    context,
    ticker,
  })

  const queue = createQueue()
  const eventA = addEvent(1, 3, Infinity, () => console.log('event A'), queue)
  const eventB = addEvent(2, 3, Infinity, () => console.log('event B'), queue)
  const eventC = addEvent(3, 3, Infinity, () => console.log('event C'), queue)

  // the tempo will be doubled immediately for all events
  stretch(0.5, getContextTime(player), getScheduledEvents(player), player)

  // the tempo will be halved in 9 seconds only for eventA and eventB
  addEvent(9, null, 0, (event) => stretch(2, event.time, [eventA, eventB], player), queue)

  play(queue, player)
}
