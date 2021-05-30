export type Ticker = {
  start: (onTick: () => void) => void
  stop: () => void
  dispose: () => void
}
