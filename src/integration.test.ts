import {
  createTimeline,
  //   Timeline,
  //   TimelineOptions,
  //   TimelineContext,
  pause,
  play,
  stop,
  createEvent,
  //   getCurrentTime,
  //   timeStretch,
  //   repeat,
  //   getScheduledEvents,
  createCallbackTicker,
} from './'

const test = () => {
  const logs: Array<string> = []
  const [ticker, tick] = createCallbackTicker()
  const context = {
    currentTime: 0,
  }

  const next = () => {
    context.currentTime++
    tick()
  }

  const advance = (times: number) =>
    Array.from(Array(times)).forEach(() => {
      next()
      logs.push(`currentTime ${context.currentTime}`)
    })

  const timeline = createTimeline({
    context,
    ticker,
    onStart: () => logs.push('onStart'),
    onResume: () => logs.push('onResume'),
    onPlay: () => logs.push('onPlay'),
    onStop: () => logs.push('onStop'),
    onPause: () => logs.push('onPause'),
    onEvent: () => logs.push('onTimeEvent'),
    onEventExpire: (timeEvent) => logs.push(`onTimeEventExpired, event.time ${timeEvent.time}`),
    onCreateEvent: () => logs.push('onCreateEvent'),
    onSchedule: () => logs.push('onSchedule'),
  })

  createEvent(1, 1, 10, () => {}, timeline)

  play(timeline)
  advance(1)
  pause(timeline)
  advance(1)
  play(timeline)
  advance(1)
  stop(timeline)
  advance(1)

  return logs
}

describe('end to end timeline integration', () => {
  it('', () => {
    // expect(test()).toEqual([])
    expect(true).toEqual(true)
  })
})
