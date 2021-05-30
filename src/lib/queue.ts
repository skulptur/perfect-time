import { ClockContext } from './clock'
import { ClockEvent, EventCallback } from './clockEvent'
import { indexByTime } from './utils/indexByTime'

const defaultOptions: QueueOptions = {
  toleranceLate: 0.1,
  toleranceEarly: 0.001,
}

export type QueueOptions = {
  toleranceEarly: number
  toleranceLate: number
}

class _Queue {
  public toleranceEarly: number
  public toleranceLate: number
  public _events: Array<ClockEvent> = []

  constructor(options: Partial<QueueOptions> = {}) {
    this.toleranceEarly = options.toleranceEarly || defaultOptions.toleranceEarly
    this.toleranceLate = options.toleranceLate || defaultOptions.toleranceLate
  }

  public clear() {
    this._events = []
  }

  // Returns true if `event` is in queue, false otherwise
  public isQueued(event: ClockEvent) {
    return this._events.includes(event)
  }

  // Creates an event and insert it to the list
  public createEvent(context: ClockContext, deadline: number, callback: EventCallback) {
    return new ClockEvent(context, this, deadline, callback)
  }

  // Inserts an event to the list
  public insertEvent(event: ClockEvent) {
    this._events.splice(indexByTime(event._earliestTime!, this._events), 0, event)
  }

  // Removes an event from the list
  public removeEvent(event: ClockEvent) {
    let index = this._events.indexOf(event)
    if (index !== -1) this._events.splice(index, 1)
  }

  // Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
  // their relative distance to `timeReference`, equivalent to changing the tempo.
  public timeStretch(
    ratio: number = 1,
    timeReference: number,
    events: Array<ClockEvent> = this._events
  ) {
    if (ratio === 1) return
    events.forEach((event) => {
      event.timeStretch(timeReference, ratio)
    })
    return events
  }

  // This function is ran periodically, and at each tick it executes
  // events for which `currentTime` is included in their tolerance interval.
  public run(currentTime: number) {
    let event = this._events.shift()
    while (event && event._earliestTime! <= currentTime) {
      event.run()
      event = this._events.shift()
    }

    // Put back the last event
    if (event) this._events.unshift(event)
  }
}

export type Queue = ReturnType<typeof createQueue>

export const createQueue = (options?: Partial<QueueOptions>) => {
  return new _Queue(options)
}
