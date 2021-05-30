import { Clock, ClockOptions, createScriptProcessorTicker } from '../src'
import { resumeContext } from 'audio-fns'

const createClock = (audioContext: AudioContext, options?: Partial<ClockOptions>) => {
  return new Clock(audioContext, options)
}

resumeContext(new AudioContext()).then((context) => {
  const clock = createClock(context, {
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .atTime(0, () => {
      console.log('played')
    })
    .repeat(1)
})
