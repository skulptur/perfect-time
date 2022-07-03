import {createTimeEvent, EventCallback, TimeEvent, updateEarlyLateDates} from './timeEvent'
import { indexByTime } from './utils/indexByTime'

export type Queue = {
  timeEvents: Array<TimeEvent>
}

export const createQueue = (timeEvents: Array<TimeEvent> = []): Queue => {
  return {
    timeEvents,
  }
}

export const clear = (queue: Queue) => {
  queue.timeEvents = []
}

// Returns true if `event` is in queue, false otherwise
export const isQueued = (event: TimeEvent, queue: Queue) => {
  return queue.timeEvents.includes(event)
}

export const updateIndex = (timeEvent: TimeEvent, queue: Queue) => {
  removeEvent(timeEvent, queue)
  insertEvent(timeEvent, queue)
}

// Creates an event and insert it to the queue
export const addEvent = (
    time: number,
    interval: number | null,
    limit: number,
    callback: EventCallback,
    queue: Queue
) => {
  const timeEvent = createTimeEvent(time, interval, limit, callback)
  queue.timeEvents.push(timeEvent)
  return timeEvent
}

// Inserts an existing event in the queue
export const insertEvent = (timeEvent: TimeEvent, queue: Queue) => {
  queue.timeEvents.splice(indexByTime(timeEvent._earliestTime!, queue.timeEvents), 0, timeEvent)
}

// Removes an event from the queue
export const removeEvent = (event: TimeEvent, queue: Queue) => {
  const index = queue.timeEvents.indexOf(event)
  if (index !== -1) queue.timeEvents.splice(index, 1)
}

// change the event time and update index
export const moveTimeEvent = (time: number, timeEvent: TimeEvent, queue: Queue) => {
  timeEvent.time = time
  updateEarlyLateDates(timeEvent)
  isQueued(timeEvent, queue) && updateIndex(timeEvent, queue)
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[time - early, time + late]`
// If the clock fails to execute the event in time, the event will be dropped.
export const setTolerance = (toleranceEarly: number, toleranceLate: number, timeEvent: TimeEvent, queue: Queue) => {
  timeEvent.toleranceEarly = toleranceEarly
  timeEvent.toleranceLate = toleranceLate
  updateEarlyLateDates(timeEvent)
  isQueued(timeEvent, queue) && updateIndex(timeEvent, queue)

  return timeEvent
}

export const limit = (limit: number, timeEvent: TimeEvent, queue: Queue) => {
  timeEvent._limit = limit
  if (timeEvent._limit <= timeEvent.count) return removeEvent(timeEvent, queue)
  return timeEvent
}
