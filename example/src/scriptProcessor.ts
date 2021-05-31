import { createClock, createScriptProcessorTicker } from '../../src'

export const scriptProcessor = (context: AudioContext) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .every(1, (event) => {
      console.log('script processor', event.count)
    })
    .limit(10)
}
