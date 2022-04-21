import { ClockContext } from './clock'
import { ClockEvent, EventCallback, createClockEvent, updateEarlyLateDates, hasInterval } from './clockEvent'
import { indexByTime } from './utils/indexByTime'

export type Queue = {
  _events: Array<ClockEvent>
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
export const isQueued = (event: ClockEvent, queue: Queue) => {
  return queue._events.includes(event)
}

// Creates an event and insert it to the list
export const createEvent = (context: ClockContext, time: number, callback: EventCallback, queue: Queue) => {
  const clockEvent = createClockEvent(context, callback)
  schedule(time, clockEvent, queue)
  return clockEvent
}

export const updateIndex = (clockEvent: ClockEvent, queue: Queue) => {
  removeEvent(clockEvent, queue)
  insertEvent(clockEvent, queue)
}

// Inserts an event to the list
export const insertEvent = (clockEvent: ClockEvent, queue: Queue) => {
  queue._events.splice(indexByTime(clockEvent._earliestTime!, queue._events), 0, clockEvent)
}

// Removes an event from the list
export const removeEvent = (event: ClockEvent, queue: Queue) => {
  const index = queue._events.indexOf(event)
  if (index !== -1) queue._events.splice(index, 1)
}

// Stretches `time` and `repeat` of all scheduled `events` by `ratio`, keeping
// their relative distance to `timeReference`, equivalent to changing the tempo.
export const timeStretch = (ratio: number, timeReference: number, clockEvents: Array<ClockEvent>, queue: Queue) => {
  if (ratio === 1) return

  clockEvents.forEach((clockEvent) => {
    let time = timeReference + ratio * (clockEvent.time - timeReference)
    // If the time is too close or past, and the event has a repeat,
    // calculate the next repeat possible in the stretched space.
    if (hasInterval(clockEvent)) {
      clockEvent.interval = clockEvent.interval! * ratio
      while (clockEvent.context.currentTime >= time - clockEvent.toleranceEarly) time += clockEvent.interval!
    }
    schedule(time, clockEvent, queue)
  })

  return clockEvents
}

// This function is ran periodically
// at each tick it executes events for which `currentTime` is included in their tolerance interval.
export const run = (currentTime: number, queue: Queue) => {
  let clockEvent = queue._events.shift()
  while (clockEvent && clockEvent._earliestTime! <= currentTime) {
    execute(clockEvent, queue)
    clockEvent = queue._events.shift()
  }

  // Put back the last event
  if (clockEvent) queue._events.unshift(clockEvent)
}

// Schedules the event to be ran before `time`.
// If the time is within the event tolerance, we handle the event immediately.
// If the event was already scheduled at a different time, it is rescheduled.
export const schedule = (time: number, clockEvent: ClockEvent, queue: Queue) => {
  if (clockEvent._limit <= clockEvent.count) return removeEvent(clockEvent, queue)

  clockEvent.time = time
  updateEarlyLateDates(clockEvent)

  clockEvent.context.currentTime >= clockEvent._earliestTime!
    ? execute(clockEvent, queue)
    : updateIndex(clockEvent, queue)
}

// Sets the time tolerance of the event.
// The event will be executed in the interval `[time - early, time + late]`
// If the clock fails to execute the event in time, the event will be dropped.
export const setTolerance = (toleranceEarly: number, toleranceLate: number, clockEvent: ClockEvent, queue: Queue) => {
  clockEvent.toleranceEarly = toleranceEarly
  clockEvent.toleranceLate = toleranceLate
  updateEarlyLateDates(clockEvent)
  isQueued(clockEvent, queue) && updateIndex(clockEvent, queue)

  return clockEvent
}

export const execute = (clockEvent: ClockEvent, queue: Queue) => {
  removeEvent(clockEvent, queue)

  const callback = clockEvent.context.currentTime < clockEvent._latestTime! ? clockEvent.onEvent : clockEvent.onExpire
  callback(clockEvent)

  clockEvent.count++

  // In the case `schedule` is called inside `onEvent`, we need to avoid
  // overwriting with yet another `schedule`.
  if (!isQueued(clockEvent, queue) && hasInterval(clockEvent)) {
    schedule(clockEvent.time + clockEvent.interval!, clockEvent, queue)
  }
}

// Sets the event to repeat every `time` seconds, for `limit` times
export const repeat = (interval: number, clockEvent: ClockEvent, queue: Queue) => {
  const safeRepeatTime = Math.max(Number.MIN_VALUE, interval)

  clockEvent.interval = safeRepeatTime

  if (!isQueued(clockEvent, queue)) {
    schedule(clockEvent.time + clockEvent.interval, clockEvent, queue)
  }
  return clockEvent
}

export const limit = (limit: number, clockEvent: ClockEvent, queue: Queue) => {
  clockEvent._limit = limit
  if (clockEvent._limit <= clockEvent.count) return removeEvent(clockEvent, queue)
  return clockEvent
}
