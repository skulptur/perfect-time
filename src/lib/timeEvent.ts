import { noop } from "./utils/noop";

export type EventCallback<T> = (event: TimeEvent<T>) => void

export type TimeEvent<T> = {
  _originalTime: number,
  _latestTime: number | null
  _earliestTime: number | null
  _limit: number
  data: T
  onEvent: EventCallback<T>
  onExpire: EventCallback<T>
  toleranceLate: number
  toleranceEarly: number
  interval: number | null
  count: number
  time: number
}

const eventExpiredWarning = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('TimeEvent: event expired.')
  }
}

export const createTimeEvent = <T>(
  time: number,
  interval: number | null,
  limit: number,
  data: T,
  onEvent: EventCallback<T> = noop
): TimeEvent<T> => {
  return {
    _originalTime: time,
    _latestTime: null,
    _earliestTime: null,
    _limit: limit,
    data,
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
export const updateEarlyLateDates = (timeEvent: TimeEvent<any>) => {
  timeEvent._earliestTime = timeEvent.time - timeEvent.toleranceEarly
  timeEvent._latestTime = timeEvent.time + timeEvent.toleranceLate
}

// Returns true if the event is repeated, false otherwise
export const hasInterval = (timeEvent: TimeEvent<any>) => {
  return timeEvent.interval !== null
}
