import { EventCallback } from './clockEvent'
import { createQueue, Queue } from './queue'
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

  // Removes all scheduled events and start
  public start() {
    if (this._started) return
    this._started = true

    this.queue.clear()

    this.ticker.start(() => {
      this.queue.run(this.context.currentTime)
    })
  }

  // Stops the clock
  public stop() {
    if (!this._started) return

    this._started = false
    this.ticker.stop()
  }

  public now() {
    return this.context.currentTime
  }

  // Schedules `callback` to run after `delay` seconds.
  public setTimeout(delay: number, callback: EventCallback) {
    return this.queue.createEvent(
      this.context,
      toAbsoluteTime(delay, this.context.currentTime),
      callback
    )
  }

  // Schedules `callback` to run before `deadline`.
  public atTime(deadline: number, callback: EventCallback) {
    return this.queue.createEvent(this.context, deadline, callback)
  }
}

export type Clock = _Clock

export const createClock = (options?: Partial<ClockOptions>) => {
  return new _Clock(options)
}
