import { TimeEvent, updateEarlyLateDates } from './timeEvent'
import { indexByTime } from './utils/indexByTime'

export type Queue = {
  _events: Array<TimeEvent>
}

export const createQueue = (): Queue => {
  return {
    _events: [],
  }
}

export const clear = (queue: Queue) => {
  queue._events = []
}

// Returns true if `event` is in queue, false otherwise
export const isQueued = (event: TimeEvent, queue: Queue) => {
  return queue._events.includes(event)
}

export const updateIndex = (timeEvent: TimeEvent, queue: Queue) => {
  removeEvent(timeEvent, queue)
  insertEvent(timeEvent, queue)
}

// Inserts an event to the list
export const insertEvent = (timeEvent: TimeEvent, queue: Queue) => {
  queue._events.splice(indexByTime(timeEvent._earliestTime!, queue._events), 0, timeEvent)
}

// Removes an event from the list
export const removeEvent = (event: TimeEvent, queue: Queue) => {
  const index = queue._events.indexOf(event)
  if (index !== -1) queue._events.splice(index, 1)
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
