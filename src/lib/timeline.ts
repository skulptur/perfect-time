import { createTimeEvent, EventCallback, hasInterval, TimeEvent, updateEarlyLateDates } from './timeEvent'
import { createQueue, Queue, clear, removeEvent, updateIndex, isQueued, moveTimeEvent } from './queue'
import { Ticker } from '../types'
import { createNoopTicker } from './tickers/noopTicker'
import { noop } from './utils/noop'

const defaultOptions: TimelineOptions = {
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
  onCreateEvent: noop,
  onSchedule: noop,
}

export type TimelineContext = {
  currentTime: number
}

export type TimelineOptions = {
  ticker: Ticker
  context: TimelineContext
} & TimelineDispatchers

export type TimelineDispatchers = {
  onStart: () => void
  onResume: () => void
  onPlay: () => void
  onStop: () => void
  onPause: () => void
  onEvent: (timeEvent: TimeEvent) => void
  onEventExpire: (timeEvent: TimeEvent) => void
  onCreateEvent: (timeEvent: TimeEvent) => void
  onSchedule: () => void
}

export type Timeline = {
  context: TimelineContext
  ticker: Ticker
  dispatch: TimelineDispatchers
  _timeEvents: Array<TimeEvent>
  _playbackQueue: Queue
  _startTime: number | null
  _pauseTime: number | null
}

export const createTimeline = (options: Partial<TimelineOptions> = {}): Timeline => {
  return {
    ticker: options.ticker || defaultOptions.ticker,
    context: options.context || defaultOptions.context,
    dispatch: {
      onStart: options.onStart || noop,
      onResume: options.onResume || noop,
      onPlay: options.onPlay || noop,
      onStop: options.onStop || noop,
      onPause: options.onPause || noop,
      onEvent: options.onEvent || noop,
      onEventExpire: options.onEventExpire || noop,
      onCreateEvent: options.onCreateEvent || noop,
      onSchedule: options.onSchedule || noop,
    },
    _timeEvents: [],
    _playbackQueue: createQueue(),
    _startTime: null,
    _pauseTime: null,
  }
}

export const getContextTime = (timeline: Timeline) => {
  return timeline.context.currentTime
}

export const getElapsedTime = (timeline: Timeline) => {
  return timeline._startTime === null ? 0 : getContextTime(timeline) - timeline._startTime
}

export const isStopped = (timeline: Timeline) => {
  return timeline._startTime === null && timeline._pauseTime === null
}

export const isPaused = (timeline: Timeline) => {
  return timeline._pauseTime !== null
}

export const isPlaying = (timeline: Timeline) => {
  return timeline._startTime !== null && timeline._pauseTime === null
}

const resume = (timeline: Timeline) => {
  if (!isPaused(timeline)) return

  const pauseDuration = getContextTime(timeline) - timeline._pauseTime!
  // shift startTime so it's like it was never paused
  timeline._startTime = timeline._startTime! + pauseDuration
  timeline._pauseTime = null
  // shift all queued events times
  timeline._playbackQueue._events.forEach((timeEvent) => {
    moveTimeEvent(timeEvent.time + pauseDuration, timeEvent, timeline._playbackQueue)
  })

  timeline.dispatch.onResume()
}

const start = (timeline: Timeline) => {
  if (!isStopped(timeline)) return

  const currentTime = getContextTime(timeline)

  timeline._startTime = currentTime
  timeline._timeEvents.forEach((timeEvent) => schedule(timeEvent.time + currentTime, { ...timeEvent }, timeline))
  timeline.dispatch.onStart()
}

export const play = (timeline: Timeline) => {
  if (isPlaying(timeline)) return

  resume(timeline)
  start(timeline)
  timeline.dispatch.onPlay()
  timeline.ticker.start(() => update(getContextTime(timeline), timeline))
}

export const stop = (timeline: Timeline) => {
  if (isStopped(timeline)) return

  timeline._startTime = null
  timeline._pauseTime = null
  clear(timeline._playbackQueue)
  timeline.ticker.stop()
  timeline.dispatch.onStop()
}

export const pause = (timeline: Timeline) => {
  if (isPaused(timeline)) return

  timeline._pauseTime = getContextTime(timeline)
  timeline.ticker.stop()
  timeline.dispatch.onPause()
}

// Stretches `time` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `timeReference`, equivalent to changing the tempo.
export const timeStretch = (ratio: number, timeReference: number, timeEvents: Array<TimeEvent>, timeline: Timeline) => {
  if (ratio === 1) return

  timeEvents.forEach((timeEvent) => {
    let time = timeReference + ratio * (timeEvent.time - timeReference)
    // If the time is too close or past, and the event has a repeat,
    // calculate the next repeat possible in the stretched space.
    if (hasInterval(timeEvent)) {
      timeEvent.interval = timeEvent.interval! * ratio
      while (timeline.context.currentTime >= time - timeEvent.toleranceEarly) time += timeEvent.interval!
    }
    schedule(time, timeEvent, timeline)
  })

  return timeEvents
}

// This function is ran periodically
// at each tick it executes events for which `currentTime` is included in their tolerance interval.
const update = (currentTime: number, timeline: Timeline) => {
  const queue = timeline._playbackQueue
  let timeEvent = queue._events.shift()

  while (timeEvent && timeEvent._earliestTime! <= currentTime) {
    execute(timeEvent, timeline)
    timeEvent = queue._events.shift()
  }

  // Put back the last event
  if (timeEvent) queue._events.unshift(timeEvent)
}

const execute = (timeEvent: TimeEvent, timeline: Timeline) => {
  removeEvent(timeEvent, timeline._playbackQueue)

  if (timeline.context.currentTime < timeEvent._latestTime!) {
    timeline.dispatch.onEvent(timeEvent)
    timeEvent.onEvent(timeEvent)
  } else {
    timeline.dispatch.onEventExpire(timeEvent)
    timeEvent.onExpire(timeEvent)
  }

  timeEvent.count++

  // In the case `schedule` is called inside `onEvent`, we need to avoid
  // overwriting with yet another `schedule`.
  if (hasInterval(timeEvent) && !isQueued(timeEvent, timeline._playbackQueue)) {
    schedule(timeEvent.time + timeEvent.interval!, timeEvent, timeline)
  }
}

// Schedules the event to be ran before `time`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
export const schedule = (time: number, timeEvent: TimeEvent, timeline: Timeline) => {
  if (timeEvent._limit <= timeEvent.count) return removeEvent(timeEvent, timeline._playbackQueue)

  timeEvent.time = time
  updateEarlyLateDates(timeEvent)
  timeline.dispatch.onSchedule()

  timeline.context.currentTime >= timeEvent._earliestTime!
    ? execute(timeEvent, timeline)
    : updateIndex(timeEvent, timeline._playbackQueue)
}

// Sets the event to repeat every `time` time, for `limit` times
export const repeat = (interval: number, timeEvent: TimeEvent, timeline: Timeline) => {
  const safeRepeatTime = Math.max(Number.MIN_VALUE, interval)

  timeEvent.interval = safeRepeatTime

  if (!isQueued(timeEvent, timeline._playbackQueue)) {
    schedule(timeEvent.time + timeEvent.interval, timeEvent, timeline)
  }
  return timeEvent
}

// Creates an event and insert it to the persistent queue
export const createEvent = (
  time: number,
  interval: number | null,
  limit: number,
  callback: EventCallback,
  timeline: Timeline
) => {
  const timeEvent = createTimeEvent(time, interval, limit, callback)
  timeline._timeEvents.push(timeEvent)
  timeline.dispatch.onCreateEvent(timeEvent)
  return timeEvent
}

export const getScheduledEvents = (timeline: Timeline) => {
  return timeline._playbackQueue._events
}
