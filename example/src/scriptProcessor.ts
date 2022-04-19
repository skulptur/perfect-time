import { createClock, createScriptProcessorTicker, start, every, limit } from '../../src'

export const scriptProcessor = (context: AudioContext) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  start(clock)

  const event = every(
    1,
    (event) => {
      console.log('script processor', event.count)
    },
    clock
  )

  limit(10, event)
}
