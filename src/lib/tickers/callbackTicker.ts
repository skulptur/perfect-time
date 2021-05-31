import { noop } from '../utils/noop'
import { Ticker } from '../../types'

export const createCallbackTicker = (): [Ticker, () => void] => {
  let callback: (() => void) | null = noop

  const ticker: Ticker = {
    start: (onTick) => {
      if (!callback) return
      callback = onTick
    },
    stop: () => {
      if (!callback) return
      callback = noop
    },
    dispose: () => {
      callback = null
    },
  }

  const tick = () => {
    // will error if already disposed
    callback!()
  }

  return [ticker, tick]
}
