import { ClockContext } from './clock'
import { Queue } from './queue'

export type EventCallback = (event: ClockEvent) => void

export class ClockEvent {
  public callback: EventCallback
  private _cleared = false // Flag used to clear an event inside callback

  public toleranceLate: number
  public toleranceEarly: number
  public _latestTime: number | null = null
  public _earliestTime: number | null = null
  public time: number = NaN
  public repeatTime: number | null = null

  constructor(
    public context: ClockContext,
    public queue: Queue,
    deadline: number,
    callback: EventCallback
  ) {
    this.callback = callback
    this._cleared = false // Flag used to clear an event inside callback

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

  // Sets the event to repeat every `time` seconds.
  public repeat(time: number) {
    if (time === 0) throw new Error('delay cannot be 0')

    this.repeatTime = time
    if (!this.queue.isQueued(this)) this.schedule(this.time + this.repeatTime)
    return this
  }

  // Sets the time tolerance of the event.
  // The event will be executed in the interval `[deadline - early, deadline + late]`
  // If the clock fails to execute the event in time, the event will be dropped.
  public tolerance(values: Partial<{ early: number; late: number }>) {
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
    return this.repeatTime !== null
  }

  // Schedules the event to be ran before `deadline`.
  // If the time is within the event tolerance, we handle the event immediately.
  // If the event was already scheduled at a different time, it is rescheduled.
  public schedule(deadline: number) {
    this._cleared = false
    this.time = deadline
    this._refreshEarlyLateDates()

    if (this.context.currentTime >= this._earliestTime!) {
      this.run()
    } else if (this.queue.isQueued(this)) {
      this.queue.removeEvent(this)
      this.queue.insertEvent(this)
    } else this.queue.insertEvent(this)
  }

  public timeStretch(tRef: number, ratio: number) {
    if (this.isRepeated()) this.repeatTime = this.repeatTime! * ratio

    let deadline = tRef + ratio * (this.time - tRef)
    // If the deadline is too close or past, and the event has a repeat,
    // we calculate the next repeat possible in the stretched space.
    if (this.isRepeated()) {
      while (this.context.currentTime >= deadline - this.toleranceEarly)
        deadline += this.repeatTime!
    }
    this.schedule(deadline)
  }

  // Executes the event
  public run() {
    // TODO: fix or remove
    // if (this.queue.started === false) return

    this.queue.removeEvent(this)

    if (this.context.currentTime < this._latestTime!) this.callback(this)
    else {
      // TODO: fix
      // @ts-expect-error
      if (this.onexpired) this.onexpired(this)
      console.warn('event expired')
    }
    // In the case `schedule` is called inside `callback`, we need to avoid
    // overwriting with yet another `schedule`.
    if (!this.queue.isQueued(this) && this.isRepeated() && !this._cleared)
      this.schedule(this.time + this.repeatTime!)
  }

  // Updates cached times
  private _refreshEarlyLateDates() {
    this._latestTime = this.time + this.toleranceLate
    this._earliestTime = this.time - this.toleranceEarly
  }
}
