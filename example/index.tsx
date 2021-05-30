import { Clock, ClockOptions } from '../src'
import { resumeContext } from 'audio-fns'

const createClock = (audioContext: AudioContext, options?: Partial<ClockOptions>) => {
  return new Clock(audioContext, options)
}

resumeContext(new AudioContext()).then((context) => {
  const clock = createClock(context)

  clock.start()

  clock.atTime(0, () => {
    console.log('played')
  })
})
