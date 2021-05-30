// Converts from relative time to absolute time
export const toAbsoluteTime = (relativeTime: number, currentTime: number) => {
  return relativeTime + currentTime
}
