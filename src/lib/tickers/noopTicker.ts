import { noop } from '../utils/noop'
import { Ticker } from '../../types'

export const createNoopTicker = (): Ticker => {
  return {
    start: noop,
    stop: noop,
    dispose: noop,
  }
}
