import { ClockEvent, EventCallback } from './clockEvent'
import { createQueue, Queue, timeStretch, createEvent, clear, run } from './queue'
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
class _Clock {
  public context: ClockContext
  public ticker: Ticker
  public queue: Queue = createQueue()
  private _started: boolean = false

  constructor(options: Partial<ClockOptions> = {}) {
    this.ticker = options.ticker || defaultOptions.ticker
    this.context = options.context || defaultOptions.context
  }

  // Get current time
  public now() {
    return this.context.currentTime
  }

  // Removes all scheduled events and start
  public start() {
    if (this._started) return

    this._started = true
    clear(this.queue)
    this.ticker.start(() => run(this.context.currentTime, this.queue))
  }

  // Stops the clock
  public stop() {
    if (!this._started) return

    this._started = false
    this.ticker.stop()
  }

  // alias with default for `timeReference`
  public timeStretch(
    ratio: number,
    timeReference: number = this.context.currentTime,
    events?: Array<ClockEvent>
  ) {
    return timeStretch(ratio, timeReference, events || [])
  }

  // Schedules `callback` to run after `delay` seconds.
  public setTimeout(delay: number, onEvent: EventCallback) {
    return createEvent(this.context, toAbsoluteTime(delay, this.now()), onEvent, this.queue)
  }

  // Schedules `callback` to run after `delay` seconds and repeat indefinitely (until the event is manually cancelled or limited).
  public setInterval(delay: number, onEvent: EventCallback) {
    return this.setTimeout(delay, onEvent).repeat(delay)
  }

  // Schedules `callback` to run before `time`.
  public atTime(time: number, onEvent: EventCallback) {
    return createEvent(this.context, time, onEvent, this.queue)
  }

  // Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
  public every(interval: number, onEvent: EventCallback) {
    return this.atTime(this.now(), onEvent).repeat(interval)
  }
}

export type Clock = _Clock

export const createClock = (options?: Partial<ClockOptions>) => {
  return new _Clock(options)
}
