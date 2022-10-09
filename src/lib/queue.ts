import { TimeEvent, updateEarlyLateDates } from './timeEvent'
import { indexByTime } from './utils/indexByTime'
import { noop } from "./utils/noop";

export type Queue = {
  timeEvents: Array<TimeEvent>
  _callbacks: QueueCallbacks
}

export type QueueCallbacks = {
  onInsertEvent: (timeEvent: TimeEvent) => void
  onRemoveEvent: (timeEvent: TimeEvent) => void
}

export type QueueProps = {
  timeEvents: Array<TimeEvent>
}  & QueueCallbacks

const defaultOptions: QueueProps = {
  timeEvents: [],
  onInsertEvent: noop,
  onRemoveEvent: noop,
}

export const createQueue = (props: Partial<QueueProps> = {}): Queue => {
  return {
    timeEvents: props.timeEvents || defaultOptions.timeEvents,
    _callbacks: {
      onInsertEvent: props.onInsertEvent || defaultOptions.onInsertEvent,
      onRemoveEvent: props.onRemoveEvent || defaultOptions.onRemoveEvent,
    }
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

// Inserts an existing event in the queue
export const insertEvent = (timeEvent: TimeEvent, queue: Queue) => {
  queue.timeEvents.splice(indexByTime(timeEvent._earliestTime!, queue.timeEvents), 0, timeEvent)
  queue._callbacks.onInsertEvent(timeEvent)
}

// Removes an event from the queue
export const removeEvent = (timeEvent: TimeEvent, queue: Queue) => {
  const index = queue.timeEvents.indexOf(timeEvent)
  if (index !== -1) {
    queue.timeEvents.splice(index, 1)
    queue._callbacks.onRemoveEvent(timeEvent)
  }
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
