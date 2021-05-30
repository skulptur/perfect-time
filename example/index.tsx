import { createClock, createScriptProcessorTicker } from '../src'
import { resumeContext } from 'audio-fns'

resumeContext(new AudioContext()).then((context) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .every(0.1, (event) => {
      console.log('interval', event.count)
    })
    .limit(10)
})
