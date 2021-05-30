// Converts from absolute time to relative time
export const toRelativeTime = (absoluteTime: number, currentTime: number) => {
  return absoluteTime - currentTime
}
