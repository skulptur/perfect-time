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

export type Queue = {
  toleranceEarly: number
  toleranceLate: number
  _events: Array<ClockEvent>
}

export const createQueue = (options: Partial<QueueOptions> = {}): Queue => {
  return {
    toleranceEarly: options.toleranceEarly || defaultOptions.toleranceEarly,
    toleranceLate: options.toleranceLate || defaultOptions.toleranceLate,
    _events: [],
  }
}

export const clear = (queue: Queue) => {
  queue._events = []
}

// Returns true if `event` is in queue, false otherwise
export const isQueued = (event: ClockEvent, queue: Queue) => {
  return queue._events.includes(event)
}

// Creates an event and insert it to the list
export const createEvent = (
  context: ClockContext,
  deadline: number,
  callback: EventCallback,
  queue: Queue
) => {
  return new ClockEvent(context, queue, deadline, callback)
}

// Inserts an event to the list
export const insertEvent = (event: ClockEvent, queue: Queue) => {
  queue._events.splice(indexByTime(event._earliestTime!, queue._events), 0, event)
}

// Removes an event from the list
export const removeEvent = (event: ClockEvent, queue: Queue) => {
  const index = queue._events.indexOf(event)
  if (index !== -1) queue._events.splice(index, 1)
}

// Stretches `deadline` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `timeReference`, equivalent to changing the tempo.
export const timeStretch = (ratio: number, timeReference: number, events: Array<ClockEvent>) => {
  if (ratio === 1) return
  events.forEach((event) => {
    event.timeStretch(timeReference, ratio)
  })
  return events
}

// This function is ran periodically
// at each tick it executes events for which `currentTime` is included in their tolerance interval.
export const run = (currentTime: number, queue: Queue) => {
  let event = queue._events.shift()
  while (event && event._earliestTime! <= currentTime) {
    event.execute()
    event = queue._events.shift()
  }

  // Put back the last event
  if (event) queue._events.unshift(event)
}
