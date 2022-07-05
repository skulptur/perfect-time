export type EventCallback = (event: TimeEvent) => void

export type TimeEvent = {
  _originalTime: number,
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
}

const eventExpiredWarning = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('ClockEvent: event expired.')
  }
}

export const createTimeEvent = (
  time: number,
  interval: number | null,
  limit: number,
  onEvent: EventCallback
): TimeEvent => {
  return {
    _originalTime: time,
    _latestTime: null,
    _earliestTime: null,
    _limit: limit,
    onEvent: onEvent,
    onExpire: eventExpiredWarning,
    toleranceLate: 0.1,
    toleranceEarly: 0.001,
    count: 0,
    interval,
    time,
  }
}

// TODO: this is used for perf, but violates single source of truth... at least should try to use getter/setter to keep updated
// Updates cached times
export const updateEarlyLateDates = (timeEvent: TimeEvent) => {
  timeEvent._earliestTime = timeEvent.time - timeEvent.toleranceEarly
  timeEvent._latestTime = timeEvent.time + timeEvent.toleranceLate
}

// Returns true if the event is repeated, false otherwise
export const hasInterval = (timeEvent: TimeEvent) => {
  return timeEvent.interval !== null
}
