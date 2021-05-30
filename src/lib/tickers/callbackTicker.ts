import { noop } from '../utils/noop'
import { Ticker } from '../../types'

export const createCallbackTicker = (): [Ticker, () => void] => {
  let _callback: (() => void) | null = noop

  const ticker: Ticker = {
    start: (callback) => {
      if (!_callback) return
      _callback = callback
    },
    stop: () => {
      if (!_callback) return
      _callback = noop
    },
    dispose: () => {
      _callback = null
    },
  }

  const tick = () => {
    // will error if already disposed
    _callback!()
  }

  return [ticker, tick]
}
