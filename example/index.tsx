import { createClock, createScriptProcessorTicker } from '../src'
import { resumeContext } from 'audio-fns'

resumeContext(new AudioContext()).then((context) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .atTime(0, (event) => {
      console.log('played', event)
    })
    .repeat(1)
})
