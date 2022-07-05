import {
  createPlayer,
  //   Player,
  //   PlayerOptions,
  //   PlayerContext,
  pause,
  play,
  stop,
  //   getCurrentTime,
  //   timeStretch,
  //   repeat,
  //   getScheduledEvents,
  createCallbackTicker, createQueue, createTimeEvent, insertEvent,
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

  const queue = createQueue()
  const event = createTimeEvent(1, 1, 10, (event) => {
    logs.push('onEvent ' + JSON.stringify(event))
  })
  insertEvent(event, queue)
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
    onSchedule: () => logs.push('onSchedule'),
  })

  play(queue, player)
  advance(1)
  pause(player)
  advance(1)
  play(queue, player)
  advance(1)
  stop(player)
  advance(1)

  return logs
}

describe('end to end player integration', () => {
  it('', () => {
    expect(test()).toEqual([
      'onSchedule',
      'onStart',
      'onPlay',
      'onTimeEvent',
      'onEvent {\"_latestTime\":1.1,\"_earliestTime\":0.999,\"_limit\":10,\"toleranceLate\":0.1,\"toleranceEarly\":0.001,\"count\":0,\"interval\":1,\"time\":1}',
      'onSchedule',
      'currentTime 1',
      'onPause',
      'currentTime 2',
      'onResume',
      'onPlay',
      'onTimeEvent',
      'onEvent {\"_latestTime\":3.1,\"_earliestTime\":2.999,\"_limit\":10,\"toleranceLate\":0.1,\"toleranceEarly\":0.001,\"count\":1,\"interval\":1,\"time\":3}',
      'onSchedule',
      'currentTime 3',
      'onStop',
      'currentTime 4',
    ])
  })
})
