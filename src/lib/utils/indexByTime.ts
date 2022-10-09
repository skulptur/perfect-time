import {TimeEvent} from "../timeEvent";

// Returns the index of the first event whose time is >= to `time`

export const indexByTime = (time: number, events: Array<TimeEvent<any>>) => {
  // performs a binary search
  let low = 0,
    high = events.length,
    mid
  while (low < high) {
    mid = Math.floor((low + high) / 2)
    if (events[mid]._earliestTime! < time) low = mid + 1
    else high = mid
  }
  return low
}
