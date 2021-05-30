import { Clock } from './clock'

export type EventCallback = (event: ClockEvent) => void

export class ClockEvent {
  public clock: Clock
  public callback: EventCallback
  public _cleared = false // Flag used to clear an event inside callback

  public toleranceLate: number
  public toleranceEarly: number
  public _latestTime: number | null = null
  public _earliestTime: number | null = null
  public time: number = NaN
  public repeatTime: number | null = null

  constructor(clock: Clock, deadline: number, callback: EventCallback) {
    this.clock = clock
    this.callback = callback
    this._cleared = false // Flag used to clear an event inside callback

    this.toleranceLate = clock.toleranceLate
    this.toleranceEarly = clock.toleranceEarly

    this.schedule(deadline)
  }

  // Unschedules the event
  public clear() {
    this.clock._removeEvent(this)
    this._cleared = true
    return this
  }

  // Sets the event to repeat every `time` seconds.
  public repeat(time: number) {
    if (time === 0) throw new Error('delay cannot be 0')
    this.repeatTime = time
    if (!this.clock._hasEvent(this)) this.schedule(this.time + this.repeatTime)
    return this
  }

  // Sets the time tolerance of the event.
  // The event will be executed in the interval `[deadline - early, deadline + late]`
  // If the clock fails to execute the event in time, the event will be dropped.
  public tolerance(values: Partial<{ early: number; late: number }>) {
    // TODO: this check is useless if the type is correct :)
    if (typeof values.late === 'number') this.toleranceLate = values.late
    if (typeof values.early === 'number') this.toleranceEarly = values.early
    this._refreshEarlyLateDates()
    if (this.clock._hasEvent(this)) {
      this.clock._removeEvent(this)
      this.clock._insertEvent(this)
    }
    return this
  }

  // Returns true if the event is repeated, false otherwise
  public isRepeated() {
    return this.repeatTime !== null
  }

  // Schedules the event to be ran before `deadline`.
  // If the time is within the event tolerance, we handle the event immediately.
  // If the event was already scheduled at a different time, it is rescheduled.
  public schedule(deadline: number) {
    this._cleared = false
    this.time = deadline
    this._refreshEarlyLateDates()

    if (this.clock.audioContext.currentTime >= this._earliestTime!) {
      this._execute()
    } else if (this.clock._hasEvent(this)) {
      this.clock._removeEvent(this)
      this.clock._insertEvent(this)
    } else this.clock._insertEvent(this)
  }

  public timeStretch(tRef: number, ratio: number) {
    if (this.isRepeated()) this.repeatTime = this.repeatTime! * ratio

    let deadline = tRef + ratio * (this.time - tRef)
    // If the deadline is too close or past, and the event has a repeat,
    // we calculate the next repeat possible in the stretched space.
    if (this.isRepeated()) {
      while (this.clock.audioContext.currentTime >= deadline - this.toleranceEarly)
        deadline += this.repeatTime!
    }
    this.schedule(deadline)
  }

  // Executes the event
  public _execute() {
    if (this.clock._started === false) return
    this.clock._removeEvent(this)

    if (this.clock.audioContext.currentTime < this._latestTime!) this.callback(this)
    else {
      // TODO: fix
      // @ts-expect-error
      if (this.onexpired) this.onexpired(this)
      console.warn('event expired')
    }
    // In the case `schedule` is called inside `callback`, we need to avoid
    // overwriting with yet another `schedule`.
    if (!this.clock._hasEvent(this) && this.isRepeated() && !this._cleared)
      this.schedule(this.time + this.repeatTime!)
  }

  // Updates cached times
  public _refreshEarlyLateDates() {
    this._latestTime = this.time + this.toleranceLate
    this._earliestTime = this.time - this.toleranceEarly
  }
}
