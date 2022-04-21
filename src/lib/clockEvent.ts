import { ClockContext } from './clock'

export type EventCallback = (event: ClockEvent) => void
export type Tolerance = { early: number; late: number }

export type ClockEvent = {
  _cleared: boolean // Flag used to clear an event inside onEvent
  _latestTime: number | null
  _earliestTime: number | null
  _limit: number
  onEvent: EventCallback
  onExpire: EventCallback
  toleranceLate: number
  toleranceEarly: number
  interval: number | null
  count: number
  time: number
  context: ClockContext
}

const eventExpiredWarning = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('ClockEvent: event expired.')
  }
}

export const createClockEvent = (
  context: ClockContext,
  toleranceEarly: number,
  toleranceLate: number,
  onEvent: EventCallback
): ClockEvent => {
  return {
    _cleared: false, // Flag used to clear an event inside onEvent
    _latestTime: null,
    _earliestTime: null,
    _limit: Infinity,
    onEvent: onEvent,
    onExpire: eventExpiredWarning,
    toleranceLate,
    toleranceEarly,
    interval: null,
    time: NaN,
    count: 0,
    context,
  }
}

// TODO: this is used for perf, but violates single source of truth... at least should try to use getter/setter to keep updated
// Updates cached times
export const refreshEarlyLateDates = (clockEvent: ClockEvent) => {
  clockEvent._latestTime = clockEvent.time + clockEvent.toleranceLate
  clockEvent._earliestTime = clockEvent.time - clockEvent.toleranceEarly
}

// Returns true if the event is repeated, false otherwise
export const isRepeated = (clockEvent: ClockEvent) => {
  return clockEvent.interval !== null
}
