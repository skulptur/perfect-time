import {
  createPlayer,
  //   Player,
  //   PlayerOptions,
  //   PlayerContext,
  pause,
  play,
  stop,
  addEvent,
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

  const player = createPlayer({
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

  addEvent(1, 1, 10, () => {}, player)

  play(player)
  advance(1)
  pause(player)
  advance(1)
  play(player)
  advance(1)
  stop(player)
  advance(1)

  return logs
}

describe('end to end player integration', () => {
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
