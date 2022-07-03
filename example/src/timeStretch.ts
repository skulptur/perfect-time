import {
  createTimeline,
  createSetIntervalTicker,
  play,
  timeStretch as stretch,
  createEvent,
  getContextTime,
  getScheduledEvents,
} from '../../src'

export const timeStretch = (context) => {
  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(100)

  const timeline = createTimeline({
    context,
    ticker,
  })

  const eventA = createEvent(1, 3, Infinity, () => console.log('event A'), timeline)
  const eventB = createEvent(2, 3, Infinity, () => console.log('event B'), timeline)
  const eventC = createEvent(3, 3, Infinity, () => console.log('event C'), timeline)

  // the tempo will be doubled immediately for all events
  stretch(0.5, getContextTime(timeline), getScheduledEvents(timeline), timeline)

  // the tempo will be halved in 9 seconds only for eventA and eventB
  createEvent(9, null, 0, (event) => stretch(2, event.time, [eventA, eventB], timeline), timeline)

  play(timeline)
}
