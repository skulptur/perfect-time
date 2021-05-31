import { noop } from '../utils/noop'
import { Ticker } from '../../types'
import { createCallbackTicker } from './callbackTicker'

const interval = (time: number, callback: () => void) => {
  const intervalId = setInterval(callback, time)

  return () => {
    clearInterval(intervalId)
  }
}

export const createSetIntervalTicker = (time: number): Ticker => {
  const [ticker, tick] = createCallbackTicker()
  let stopInterval = noop

  return {
    start: (onTick) => {
      ticker.start(onTick)
      stopInterval = interval(time, tick)
    },
    stop: () => {
      ticker.stop()
      stopInterval()
    },
    dispose: () => {
      ticker.dispose()
      stopInterval()
    },
  }
}
