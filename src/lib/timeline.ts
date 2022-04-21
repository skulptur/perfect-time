import { createTimeEvent, EventCallback, hasInterval, TimeEvent, updateEarlyLateDates } from './timeEvent'
import { createQueue, Queue, clear, removeEvent, updateIndex, isQueued } from './queue'
import { Ticker } from '../types'
import { createNoopTicker } from './tickers/noopTicker'

export type Tolerance = { early: number; late: number }

const defaultOptions: TimelineOptions = {
  ticker: createNoopTicker(),
  context: {
    currentTime: 0,
  },
}

export type TimelineContext = {
  currentTime: number
}

export type TimelineOptions = {
  ticker: Ticker
  context: TimelineContext
}

export type Timeline = {
  context: TimelineContext
  ticker: Ticker
  _timeEvents: Array<TimeEvent>
  _playbackQueue: Queue
  _startTime: number
  _pauseTime: number
}

export const createTimeline = (options: Partial<TimelineOptions> = {}): Timeline => {
  return {
    ticker: options.ticker || defaultOptions.ticker,
    context: options.context || defaultOptions.context,
    _timeEvents: [],
    _playbackQueue: createQueue(),
    _startTime: NaN,
    _pauseTime: NaN,
  }
}

// Get current time
export const getCurrentTime = (timeline: Timeline) => {
  return timeline.context.currentTime
}

export const isStopped = (timeline: Timeline) => {
  return timeline._startTime === NaN && timeline._pauseTime === NaN
}

export const isPaused = (timeline: Timeline) => {
  return timeline._pauseTime !== NaN
}

export const isPlaying = (timeline: Timeline) => {
  return timeline._startTime !== NaN && timeline._pauseTime === NaN
}

export const play = (timeline: Timeline) => {
  if (isPlaying(timeline)) return

  const currentTime = getCurrentTime(timeline)
  // TODO: implement pause time math
  timeline._startTime = currentTime
  timeline._timeEvents.forEach((timeEvent) => schedule(timeEvent.time + currentTime, { ...timeEvent }, timeline))

  timeline.ticker.start(() => update(getCurrentTime(timeline), timeline))
}

export const stop = (timeline: Timeline) => {
  if (isStopped(timeline)) return

  timeline._startTime = NaN
  timeline._pauseTime = NaN
  clear(timeline._playbackQueue)
  timeline.ticker.stop()
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

  const callback = timeline.context.currentTime < timeEvent._latestTime! ? timeEvent.onEvent : timeEvent.onExpire
  callback(timeEvent)

  timeEvent.count++

  // In the case `schedule` is called inside `onEvent`, we need to avoid
  // overwriting with yet another `schedule`.
  if (!isQueued(timeEvent, timeline._playbackQueue) && hasInterval(timeEvent)) {
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

// Creates an event and insert it to the list
export const createEvent = (
  time: number,
  interval: number | null,
  limit: number,
  callback: EventCallback,
  timeline: Timeline
) => {
  const timeEvent = createTimeEvent(time, interval, limit, callback)
  timeline._timeEvents.push(timeEvent)
  return timeEvent
}

export const getScheduledEvents = (timeline: Timeline) => {
  return timeline._playbackQueue._events
}
