import { EventCallback } from './clockEvent'
import { createQueue, Queue, createEvent, clear, run, repeat } from './queue'
import { Ticker } from '../types'
import { createNoopTicker } from './tickers/noopTicker'
import { toAbsoluteTime } from './utils/toAbsoluteTime'

const defaultOptions: ClockOptions = {
  ticker: createNoopTicker(),
  context: {
    currentTime: 0,
  },
}

export type ClockContext = {
  currentTime: number
}

export type ClockOptions = {
  ticker: Ticker
  context: ClockContext
}

export type Clock = {
  context: ClockContext
  ticker: Ticker
  queue: Queue
  _started: boolean
}

export const createClock = (options: Partial<ClockOptions> = {}): Clock => {
  return {
    ticker: options.ticker || defaultOptions.ticker,
    context: options.context || defaultOptions.context,
    queue: createQueue(),
    _started: false,
  }
}

// Get current time
export const getCurrentTime = (clock: Clock) => {
  return clock.context.currentTime
}

// Removes all scheduled events and start
export const start = (clock: Clock) => {
  if (clock._started) return

  clock._started = true
  clear(clock.queue)
  clock.ticker.start(() => run(clock.context.currentTime, clock.queue))
}

// Stops the clock
export const stop = (clock: Clock) => {
  if (!clock._started) return

  clock._started = false
  clock.ticker.stop()
}

// Schedules `callback` to run after `delay` seconds.
export const setTimeout = (delay: number, onEvent: EventCallback, clock: Clock) => {
  return createEvent(clock.context, toAbsoluteTime(delay, getCurrentTime(clock)), onEvent, clock.queue)
}

// Schedules `callback` to run after `delay` seconds and repeat indefinitely (until the event is manually cancelled or limited).
export const setInterval = (delay: number, onEvent: EventCallback, clock: Clock) => {
  const event = setTimeout(delay, onEvent, clock)
  return repeat(delay, event, clock.queue)
}

// Schedules `callback` to run before `time`.
export const atTime = (time: number, onEvent: EventCallback, clock: Clock) => {
  return createEvent(clock.context, time, onEvent, clock.queue)
}

// Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
export const every = (interval: number, onEvent: EventCallback, clock: Clock) => {
  const event = atTime(getCurrentTime(clock), onEvent, clock)
  return repeat(interval, event, clock.queue)
}
