import { Ticker } from '../../types'

// https://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
const workerFunction = (fn: () => void) => {
  return new Worker(window.URL.createObjectURL(new Blob(['(' + fn.toString() + ')()'], { type: 'text/javascript' })))
}

export const createWorkerSetIntervalTicker = (time: number): Ticker => {
  const fn = workerFunction(() => {
    let intervalId: any = null
    // @ts-ignore
    self.onmessage = (msg) => {
      if (!msg.data && intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
        return
      }
      
      intervalId = setInterval(() => {
        // @ts-ignore
        self.postMessage(undefined)
      }, msg.data)
    }
  })

  return {
    start: (onTick) => {
      fn.onmessage = onTick
      fn.postMessage(time)
    },
    stop: () => {
      fn.postMessage(false)
    },
    dispose: () => {
      fn.postMessage(false)
      fn.terminate()
    },
  }
}
