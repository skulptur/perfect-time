import { Clock, ClockOptions, createClock } from './clock'
import { secondsToBeats, beatsToSeconds } from 'audio-fns'
import { EventCallback } from './clockEvent'

const defaultOptions: MusicClockOptions = {
  tempo: 120,
}

export type MusicClockOptions = {
  tempo: number
}

class _MusicClock {
  private tempo: number

  constructor(private clock: Clock, options: Partial<MusicClockOptions> = {}) {
    this.tempo = options.tempo || defaultOptions.tempo
  }

  public start = this.clock.start
  public stop = this.clock.stop
  public now = this.clock.now
  public atTime = this.clock.atTime
  public setTimeout = this.clock.setTimeout

  public currentBeat() {
    return secondsToBeats(this.clock.context.currentTime, this.tempo)
  }

  // Schedules `callback` to run before `deadline` given in beats.
  public atBeat(deadline: number, callback: EventCallback) {
    return this.clock.atTime(beatsToSeconds(deadline, this.tempo), callback)
  }

  public setTempo = (tempo: number) => {
    const ratio = this.tempo / tempo
    this.tempo = tempo
    return this.clock.queue.timeStretch(ratio, this.clock.now())
  }

  public getTempo = () => {
    return this.tempo
  }
}

export type MusicClock = _MusicClock

export const createMusicClock = (options?: Partial<MusicClockOptions & ClockOptions>) => {
  return new _MusicClock(createClock(options), options)
}
