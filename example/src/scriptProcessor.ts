import { createClock, createScriptProcessorTicker } from '../../src'

export const scriptProcessor = (context: AudioContext) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .every(1, (event) => {
      console.log('interval', event.count)
    })
    .limit(10)
}
