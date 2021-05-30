import { ClockEvent } from '../clockEvent'

// Returns the index of the first event whose deadline is >= to `deadline`
export const indexByTime = (deadline: number, events: Array<ClockEvent>) => {
  // performs a binary search
  let low = 0,
    high = events.length,
    mid
  while (low < high) {
    mid = Math.floor((low + high) / 2)
    if (events[mid]._earliestTime! < deadline) low = mid + 1
    else high = mid
  }
  return low
}
