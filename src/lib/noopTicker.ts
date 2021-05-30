import { Ticker } from '../types'

const noop = () => {}

export const createNoopTicker = (): Ticker => {
  return {
    start: noop,
    stop: noop,
    dispose: noop,
  }
}
