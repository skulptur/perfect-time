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
    onEventExpire: () => logs.push(`onTimeEventExpired`),
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
    expect(test()).toEqual([
      'onCreateEvent',
      'onSchedule',
      'onStart',
      'onPlay',
      'onTimeEvent',
      'onSchedule',
      'currentTime 1',
      'onPause',
      'currentTime 2',
      'onResume',
      'onPlay',
      'onTimeEvent',
      'onSchedule',
      'currentTime 3',
      'onStop',
      'currentTime 4',
    ])
  })
})
