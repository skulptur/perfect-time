import { hasInterval, TimeEvent, updateEarlyLateDates } from './timeEvent'
import { createQueue, Queue, clear, removeEvent, updateIndex, isQueued, moveTimeEvent } from './queue'
import { Ticker } from '../types'
import { createNoopTicker } from './tickers/noopTicker'
import { noop } from './utils/noop'

const defaultOptions: PlayerProps<null> = {
  ticker: createNoopTicker(),
  context: {
    currentTime: 0,
  },
  onStart: noop,
  onResume: noop,
  onPlay: noop,
  onStop: noop,
  onPause: noop,
  onEvent: noop,
  onEventExpire: noop,
  onSchedule: noop,
}

export type PlayerContext = {
  currentTime: number
}

export type PlayerProps<T> = {
  ticker: Ticker
  context: PlayerContext
} & PlayerCallbacks<T>

export type PlayerCallbacks<T> = {
  onStart: () => void
  onResume: () => void
  onPlay: () => void
  onStop: () => void
  onPause: () => void
  onEvent: (timeEvent: TimeEvent<T>) => void
  onEventExpire: (timeEvent: TimeEvent<T>) => void
  onSchedule: () => void
}

export type Player<T> = {
  context: PlayerContext
  ticker: Ticker
  _callbacks: PlayerCallbacks<T>
  _playbackQueue: Queue<T>
  _startTime: number | null
  _pauseTime: number | null
}

export const createPlayer = <T>(props: Partial<PlayerProps<T>> = {}): Player<T> => {
  return {
    ticker: props.ticker || defaultOptions.ticker,
    context: props.context || defaultOptions.context,
    _callbacks: {
      onStart: props.onStart || noop,
      onResume: props.onResume || noop,
      onPlay: props.onPlay || noop,
      onStop: props.onStop || noop,
      onPause: props.onPause || noop,
      onEvent: props.onEvent || noop,
      onEventExpire: props.onEventExpire || noop,
      onSchedule: props.onSchedule || noop,
    },
    _playbackQueue: createQueue(),
    _startTime: null,
    _pauseTime: null,
  }
}

export const getContextTime = (player: Player<any>) => {
  return player.context.currentTime
}

export const getElapsedTime = (player: Player<any>) => {
  return player._startTime === null ? 0 : getContextTime(player) - player._startTime
}

export const isStopped = (player: Player<any>) => {
  return player._startTime === null && player._pauseTime === null
}

export const isPaused = (player: Player<any>) => {
  return player._pauseTime !== null
}

export const isPlaying = (player: Player<any>) => {
  return player._startTime !== null && player._pauseTime === null
}

export const resume = (player: Player<any>) => {
  if (!isPaused(player)) return

  const pauseDuration = getContextTime(player) - player._pauseTime!
  // shift startTime so it's like it was never paused
  player._startTime = player._startTime! + pauseDuration
  player._pauseTime = null
  // shift all queued events times
  player._playbackQueue.timeEvents.forEach((timeEvent) => {
    moveTimeEvent(timeEvent.time + pauseDuration, timeEvent, player._playbackQueue)
  })

  player._callbacks.onResume()
}

export const start = <T>(queue: Queue<T>, player: Player<T>) => {
  if (!isStopped(player)) return

  const currentTime = getContextTime(player)

  player._startTime = currentTime
  // The events get copied over, at least that is the current behavior
  // Alternatively we could use the provided queue itself,
  // but it has some implications such as playing mutates the original queue.
  queue.timeEvents.forEach((timeEvent) => {
    // TODO: extract into function?
    // resets the timeEvent so it can be played again as if just added
    timeEvent.time = timeEvent._originalTime
    timeEvent.count = 0

    schedule(timeEvent.time + currentTime, timeEvent, player)
  })
  player._callbacks.onStart()
}

export const play = <T>(queue: Queue<T>, player: Player<T>) => {
  if (isPlaying(player)) return

  resume(player)
  start(queue, player)
  player.ticker.start(() => update(getContextTime(player), player))
  player._callbacks.onPlay()
}

export const stop = (player: Player<any>) => {
  if (isStopped(player)) return

  player._startTime = null
  player._pauseTime = null
  clear(player._playbackQueue)
  player.ticker.stop()
  player._callbacks.onStop()
}

export const pause = (player: Player<any>) => {
  if (isPaused(player)) return

  player._pauseTime = getContextTime(player)
  player.ticker.stop()
  player._callbacks.onPause()
}

// Stretches `time` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `timeReference`, equivalent to changing the tempo.
export const timeStretch = <T>(ratio: number, timeReference: number, timeEvents: Array<TimeEvent<T>>, player: Player<T>) => {
  if (ratio === 1) return

  timeEvents.forEach((timeEvent) => {
    let time = timeReference + ratio * (timeEvent.time - timeReference)
    // If the time is too close or past, and the event has a repeat,
    // calculate the next repeat possible in the stretched space.
    if (hasInterval(timeEvent)) {
      timeEvent.interval = timeEvent.interval! * ratio
      while (player.context.currentTime >= time - timeEvent.toleranceEarly) time += timeEvent.interval!
    }
    schedule(time, timeEvent, player)
  })

  return timeEvents
}

// This function is ran periodically
// at each tick it executes events for which `currentTime` is included in their tolerance interval.
const update = (currentTime: number, player: Player<any>) => {
  const queue = player._playbackQueue
  let timeEvent = queue.timeEvents.shift()

  while (timeEvent && timeEvent._earliestTime! <= currentTime) {
    execute(timeEvent, player)
    timeEvent = queue.timeEvents.shift()
  }

  // Put back the last event
  if (timeEvent) queue.timeEvents.unshift(timeEvent)
}

const execute = <T>(timeEvent: TimeEvent<T>, player: Player<T>) => {
  removeEvent(timeEvent, player._playbackQueue)

  if (player.context.currentTime < timeEvent._latestTime!) {
    player._callbacks.onEvent(timeEvent)
    timeEvent.onEvent(timeEvent)
  } else {
    player._callbacks.onEventExpire(timeEvent)
    timeEvent.onExpire(timeEvent)
  }

  timeEvent.count++

  // In the case `schedule` is called inside `onEvent`, we need to avoid
  // overwriting with yet another `schedule`.
  if (hasInterval(timeEvent) && !isQueued(timeEvent, player._playbackQueue)) {
    schedule(timeEvent.time + timeEvent.interval!, timeEvent, player)
  }
}

// Schedules the event to run before `time`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
export const schedule = <T>(time: number, timeEvent: TimeEvent<T>, player: Player<T>) => {
  if (timeEvent._limit <= timeEvent.count) {
    removeEvent(timeEvent, player._playbackQueue)
    return false
  }

  timeEvent.time = time
  updateEarlyLateDates(timeEvent)
  player._callbacks.onSchedule()

  player.context.currentTime >= timeEvent._earliestTime!
    ? execute(timeEvent, player)
    : updateIndex(timeEvent, player._playbackQueue)

  return true
}

// Sets the event to repeat every `time` time, for `limit` times
export const repeat = <T>(interval: number, timeEvent: TimeEvent<T>, player: Player<T>) => {
  const safeRepeatTime = Math.max(Number.MIN_VALUE, interval)

  timeEvent.interval = safeRepeatTime

  if (!isQueued(timeEvent, player._playbackQueue)) {
    schedule(timeEvent.time + timeEvent.interval, timeEvent, player)
  }
  return timeEvent
}

export const getScheduledEvents = <T>(player: Player<T>) => {
  return player._playbackQueue.timeEvents
}
