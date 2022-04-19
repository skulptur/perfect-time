import { ClockContext } from './clock'
import { Queue, isQueued, removeEvent, insertEvent } from './queue'

export type EventCallback = (event: ClockEvent) => void
export type Tolerance = { early: number; late: number }

export type ClockEvent = {
  context: ClockContext
  _cleared: boolean // Flag used to clear an event inside onEvent
  _latestTime: number | null
  _earliestTime: number | null
  toleranceLate: number
  toleranceEarly: number
  time: number
  interval: number | null
  _limit: number
  count: number
  onEvent: EventCallback
  onExpire: EventCallback
  queue: Queue
}

// Updates cached times
export const refreshEarlyLateDates = (clockEvent: ClockEvent) => {
  clockEvent._latestTime = clockEvent.time + clockEvent.toleranceLate
  clockEvent._earliestTime = clockEvent.time - clockEvent.toleranceEarly
}

// Unschedules the event
export const clear = (clockEvent: ClockEvent) => {
  removeEvent(clockEvent, clockEvent.queue)
  clockEvent._cleared = true
  return clockEvent
}

// Sets the event to repeat every `time` seconds, for `limit` times
export const repeat = (interval: number, clockEvent: ClockEvent) => {
  const safeRepeatTime = Math.max(Number.MIN_VALUE, interval)

  clockEvent.interval = safeRepeatTime

  if (!isQueued(clockEvent, clockEvent.queue)) {
    schedule(clockEvent.time + clockEvent.interval, clockEvent)
  }
  return clockEvent
}

// // Sets the event to repeat every `time` seconds, for `limit` times
// export const repeatN = (interval: number, limit: number, clockEvent: ClockEvent) => {
//   clockEvent._limit = limit
//   return repeat(interval, clockEvent)
// }

export const limit = (limit: number, clockEvent: ClockEvent) => {
  clockEvent._limit = limit
  return clockEvent
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[deadline - early, deadline + late]`
// If the clock fails to execute the event in time, the event will be dropped.
export const setTolerance = (values: Partial<Tolerance>, clockEvent: ClockEvent) => {
  if (typeof values.late === 'number') clockEvent.toleranceLate = values.late
  if (typeof values.early === 'number') clockEvent.toleranceEarly = values.early
  refreshEarlyLateDates(clockEvent)
  if (isQueued(clockEvent, clockEvent.queue)) {
    removeEvent(clockEvent, clockEvent.queue)
    insertEvent(clockEvent, clockEvent.queue)
  }
  return clockEvent
}

// Returns true if the event is repeated, false otherwise
export const isRepeated = (clockEvent: ClockEvent) => {
  return clockEvent.interval !== null
}

// Schedules the event to be ran before `deadline`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
export const schedule = (deadline: number, clockEvent: ClockEvent) => {
  if (clockEvent._limit <= clockEvent.count) return

  clockEvent._cleared = false
  clockEvent.time = deadline
  refreshEarlyLateDates(clockEvent)

  if (clockEvent.context.currentTime >= clockEvent._earliestTime!) {
    execute(clockEvent)
  } else {
    removeEvent(clockEvent, clockEvent.queue)
    insertEvent(clockEvent, clockEvent.queue)
  }
}

export const applyTimeStretch = (timeReference: number, ratio: number, clockEvent: ClockEvent) => {
  if (isRepeated(clockEvent)) clockEvent.interval = clockEvent.interval! * ratio

  let deadline = timeReference + ratio * (clockEvent.time - timeReference)
  // If the deadline is too close or past, and the event has a repeat,
  // we calculate the next repeat possible in the stretched space.
  if (isRepeated(clockEvent)) {
    while (clockEvent.context.currentTime >= deadline - clockEvent.toleranceEarly)
      deadline += clockEvent.interval!
  }
  schedule(deadline, clockEvent)
}

export const execute = (clockEvent: ClockEvent) => {
  removeEvent(clockEvent, clockEvent.queue)

  const callback =
    clockEvent.context.currentTime < clockEvent._latestTime!
      ? clockEvent.onEvent
      : clockEvent.onExpire
  callback(clockEvent)

  clockEvent.count++

  // In the case `schedule` is called inside `onEvent`, we need to avoid
  // overwriting with yet another `schedule`.
  if (!isQueued(clockEvent, clockEvent.queue) && isRepeated(clockEvent) && !clockEvent._cleared) {
    schedule(clockEvent.time + clockEvent.interval!, clockEvent)
  }
}

const eventExpiredWarning = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('ClockEvent: event expired.')
  }
}

export const createClockEvent = (
  context: ClockContext,
  queue: Queue,
  deadline: number,
  onEvent: EventCallback
) => {
  const clockEvent: ClockEvent = {
    _cleared: false, // Flag used to clear an event inside onEvent
    _latestTime: null,
    _earliestTime: null,
    toleranceLate: queue.toleranceLate,
    toleranceEarly: queue.toleranceEarly,
    time: NaN,
    interval: null,
    _limit: Infinity,
    count: 0,
    onEvent: onEvent,
    onExpire: eventExpiredWarning,
    queue,
    context,
  }

  schedule(deadline, clockEvent)

  return clockEvent
}
