import { noop } from '../utils/noop'
import { Ticker } from '../../types'

export const createCallbackTicker = (): [Ticker, () => void] => {
  let _callback = noop

  const ticker = {
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
    _callback()
  }

  return [ticker, tick]
}
