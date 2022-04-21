import { Clock, ClockOptions, createClock, getCurrentTime, atTime } from './clock'
import { timeStretch, repeat } from './queue'
import { secondsToBeats, beatsToSeconds } from 'audio-fns'
import { EventCallback } from './clockEvent'

export type MusicClockOptions = {
  tempo: number
}

const defaultOptions: MusicClockOptions = {
  tempo: 120,
}

export type MusicClock = MusicClockOptions & Clock

export const createMusicClock = (options: Partial<MusicClockOptions & ClockOptions> = {}): MusicClock => {
  return {
    ...createClock(options),
    tempo: options.tempo || defaultOptions.tempo,
  }
}

export const getCurrentBeat = (musicClock: MusicClock) => {
  return secondsToBeats(getCurrentTime(musicClock), musicClock.tempo)
}

export const setTempo = (tempo: number, musicClock: MusicClock) => {
  const ratio = musicClock.tempo / tempo
  musicClock.tempo = tempo
  return timeStretch(ratio, getCurrentTime(musicClock), musicClock.queue._events, musicClock.queue)
}

// Schedules `callback` to run before `time` given in beats.
export const atBeat = (timeInBeats: number, callback: EventCallback, musicClock: MusicClock) => {
  return atTime(beatsToSeconds(timeInBeats, musicClock.tempo), callback, musicClock)
}

// Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
export const everyBeat = (beatInterval: number, onEvent: EventCallback, musicClock: MusicClock) => {
  const event = atBeat(beatInterval, onEvent, musicClock)
  return repeat(beatsToSeconds(beatInterval, musicClock.tempo), event, musicClock.queue)
}
