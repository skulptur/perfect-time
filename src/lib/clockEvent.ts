import { ClockContext } from './clock'
import { Queue } from './queue'

export type EventCallback = (event: ClockEvent) => void
export type Tolerance = { early: number; late: number }

export class ClockEvent {
  private _cleared = false // Flag used to clear an event inside onEvent
  public _latestTime: number | null = null
  public _earliestTime: number | null = null

  public toleranceLate: number
  public toleranceEarly: number
  public time: number = NaN
  public interval: number | null = null
  public _limit: number = Infinity
  public count = 0

  public onEvent: EventCallback
  public onExpire: EventCallback = () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('ClockEvent: event expired.')
    }
  }

  constructor(
    public context: ClockContext,
    public queue: Queue,
    deadline: number,
    onEvent: EventCallback
  ) {
    this.onEvent = onEvent
    this._cleared = false // Flag used to clear an event inside onEvent

    this.toleranceLate = queue.toleranceLate
    this.toleranceEarly = queue.toleranceEarly

    this.schedule(deadline)
  }

  // Unschedules the event
  public clear() {
    this.queue.removeEvent(this)
    this._cleared = true
    return this
  }

  // Sets the event to repeat every `time` seconds, for `limit` times
  public repeat(interval: number, limit: number = Infinity) {
    const safeRepeatTime = Math.max(Number.MIN_VALUE, interval)

    this.interval = safeRepeatTime
    this._limit = limit

    if (!this.queue.isQueued(this)) {
      this.schedule(this.time + this.interval)
    }
    return this
  }

  // Sets the number of times it can run
  public limit(limit: number) {
    this._limit = limit

    return this
  }

  // Sets the time tolerance of the event.
  // The event will be executed in the interval `[deadline - early, deadline + late]`
  // If the clock fails to execute the event in time, the event will be dropped.
  public setTolerance(values: Partial<Tolerance>) {
    if (typeof values.late === 'number') this.toleranceLate = values.late
    if (typeof values.early === 'number') this.toleranceEarly = values.early
    this._refreshEarlyLateDates()
    if (this.queue.isQueued(this)) {
      this.queue.removeEvent(this)
      this.queue.insertEvent(this)
    }
    return this
  }

  // Returns true if the event is repeated, false otherwise
  public isRepeated() {
    return this.interval !== null
  }

  // Schedules the event to be ran before `deadline`.
  // If the time is within the event tolerance, we handle the event immediately.
  // If the event was already scheduled at a different time, it is rescheduled.
  public schedule(deadline: number) {
    if (this._limit <= this.count) return

    this._cleared = false
    this.time = deadline
    this._refreshEarlyLateDates()

    if (this.context.currentTime >= this._earliestTime!) {
      this.run()
    } else {
      this.queue.removeEvent(this)
      this.queue.insertEvent(this)
    }
  }

  public timeStretch(timeReference: number, ratio: number) {
    if (this.isRepeated()) this.interval = this.interval! * ratio

    let deadline = timeReference + ratio * (this.time - timeReference)
    // If the deadline is too close or past, and the event has a repeat,
    // we calculate the next repeat possible in the stretched space.
    if (this.isRepeated()) {
      while (this.context.currentTime >= deadline - this.toleranceEarly) deadline += this.interval!
    }
    this.schedule(deadline)
  }

  // Executes the event
  public run() {
    this.queue.removeEvent(this)

    const callback = this.context.currentTime < this._latestTime! ? this.onEvent : this.onExpire
    callback(this)

    this.count++

    // In the case `schedule` is called inside `onEvent`, we need to avoid
    // overwriting with yet another `schedule`.
    if (!this.queue.isQueued(this) && this.isRepeated() && !this._cleared) {
      this.schedule(this.time + this.interval!)
    }
  }

  // Updates cached times
  private _refreshEarlyLateDates() {
    this._latestTime = this.time + this.toleranceLate
    this._earliestTime = this.time - this.toleranceEarly
  }
}
