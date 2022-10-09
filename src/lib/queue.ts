import { TimeEvent, updateEarlyLateDates } from './timeEvent'
import { indexByTime } from './utils/indexByTime'
import { noop } from "./utils/noop";

export type Queue<T> = {
  timeEvents: Array<TimeEvent<T>>
  _callbacks: QueueCallbacks<T>
}

export type QueueCallbacks<T> = {
  onInsertEvent: (timeEvent: TimeEvent<T>) => void
  onRemoveEvent: (timeEvent: TimeEvent<T>) => void
}

export type QueueProps<T> = {
  timeEvents: Array<TimeEvent<T>>
}  & QueueCallbacks<T>

const defaultOptions: QueueProps<unknown> = {
  timeEvents: [],
  onInsertEvent: noop,
  onRemoveEvent: noop,
}

export const createQueue = <T>(props: Partial<QueueProps<T>> = {}): Queue<T> => {
  return {
    timeEvents: props.timeEvents || (defaultOptions as QueueProps<T>).timeEvents,
    _callbacks: {
      onInsertEvent: props.onInsertEvent || (defaultOptions as QueueProps<T>).onInsertEvent,
      onRemoveEvent: props.onRemoveEvent || (defaultOptions as QueueProps<T>).onRemoveEvent,
    }
  }
}

export const clear = (queue: Queue<unknown>) => {
  queue.timeEvents = []
}

// Returns true if `event` is in queue, false otherwise
export const isQueued = <T>(event: TimeEvent<T>, queue: Queue<T>) => {
  return queue.timeEvents.includes(event)
}

export const updateIndex = <T>(timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  removeEvent(timeEvent, queue)
  insertEvent(timeEvent, queue)
}

// Inserts an existing event in the queue
export const insertEvent = <T>(timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  queue.timeEvents.splice(indexByTime(timeEvent._earliestTime!, queue.timeEvents), 0, timeEvent)
  queue._callbacks.onInsertEvent(timeEvent)
}

// Removes an event from the queue
export const removeEvent = <T>(timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  const index = queue.timeEvents.indexOf(timeEvent)
  if (index !== -1) {
    queue.timeEvents.splice(index, 1)
    queue._callbacks.onRemoveEvent(timeEvent)
  }
}

// change the event time and update index
export const moveTimeEvent = <T>(time: number, timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  timeEvent.time = time
  updateEarlyLateDates(timeEvent)
  isQueued(timeEvent, queue) && updateIndex(timeEvent, queue)
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[time - early, time + late]`
// If the clock fails to execute the event in time, the event will be dropped.
export const setTolerance = <T>(toleranceEarly: number, toleranceLate: number, timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  timeEvent.toleranceEarly = toleranceEarly
  timeEvent.toleranceLate = toleranceLate
  updateEarlyLateDates(timeEvent)
  isQueued(timeEvent, queue) && updateIndex(timeEvent, queue)

  return timeEvent
}

export const limit = <T>(limit: number, timeEvent: TimeEvent<T>, queue: Queue<T>) => {
  timeEvent._limit = limit
  if (timeEvent._limit <= timeEvent.count) return removeEvent(timeEvent, queue)
  return timeEvent
}
