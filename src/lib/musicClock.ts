import { Clock, ClockOptions, createClock } from './clock'
import { timeStretch } from './queue'
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

  public toSeconds(beats: number) {
    return beatsToSeconds(beats, this.tempo)
  }

  public toBeats(seconds: number) {
    return secondsToBeats(seconds, this.tempo)
  }

  public now() {
    return this.toBeats(this.clock.now())
  }

  public start = this.clock.start.bind(this.clock)
  public stop = this.clock.stop.bind(this.clock)
  public timeStretch = this.clock.timeStretch.bind(this.clock)

  // Schedules `callback` to run before `deadline` given in beats.
  public atBeat(deadline: number, callback: EventCallback) {
    return this.clock.atTime(this.toSeconds(deadline), callback)
  }

  // Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
  public every(beatInterval: number, onEvent: EventCallback) {
    return this.atBeat(beatInterval, onEvent).repeat(this.toSeconds(beatInterval))
  }

  public setTempo = (tempo: number) => {
    const ratio = this.tempo / tempo
    this.tempo = tempo
    return timeStretch(ratio, this.clock.now(), this.clock.queue._events)
  }

  public getTempo = () => {
    return this.tempo
  }
}

export type MusicClock = _MusicClock

export const createMusicClock = (options?: Partial<MusicClockOptions & ClockOptions>) => {
  return new _MusicClock(createClock(options), options)
}
