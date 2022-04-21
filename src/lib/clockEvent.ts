import { ClockContext } from './clock'

export type EventCallback = (event: ClockEvent) => void

export type ClockEvent = {
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

export const createClockEvent = (context: ClockContext, onEvent: EventCallback): ClockEvent => {
  return {
    _latestTime: null,
    _earliestTime: null,
    _limit: Infinity,
    onEvent: onEvent,
    onExpire: eventExpiredWarning,
    toleranceLate: 0.1,
    toleranceEarly: 0.001,
    interval: null,
    time: NaN,
    count: 0,
    context,
  }
}

// TODO: this is used for perf, but violates single source of truth... at least should try to use getter/setter to keep updated
// Updates cached times
export const updateEarlyLateDates = (clockEvent: ClockEvent) => {
  clockEvent._earliestTime = clockEvent.time - clockEvent.toleranceEarly
  clockEvent._latestTime = clockEvent.time + clockEvent.toleranceLate
}

// Returns true if the event is repeated, false otherwise
export const hasInterval = (clockEvent: ClockEvent) => {
  return clockEvent.interval !== null
}
