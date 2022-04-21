import { Timeline, TimelineOptions, createTimeline, getCurrentTime, createEvent, timeStretch, repeat } from './timeline'
import { secondsToBeats, beatsToSeconds } from 'audio-fns'
import { EventCallback } from './timeEvent'

export type MusicTimelineOptions = {
  tempo: number
}

const defaultOptions: MusicTimelineOptions = {
  tempo: 120,
}

export type MusicTimeline = MusicTimelineOptions & Timeline

export const createMusicTimeline = (options: Partial<MusicTimelineOptions & TimelineOptions> = {}): MusicTimeline => {
  return {
    ...createTimeline(options),
    tempo: options.tempo || defaultOptions.tempo,
  }
}

export const getCurrentBeat = (musicTimeline: MusicTimeline) => {
  return secondsToBeats(getCurrentTime(musicTimeline), musicTimeline.tempo)
}

export const setTempo = (tempo: number, musicTimeline: MusicTimeline) => {
  const ratio = musicTimeline.tempo / tempo
  musicTimeline.tempo = tempo
  return timeStretch(ratio, getCurrentTime(musicTimeline), musicTimeline._playbackQueue._events, musicTimeline)
}

// Schedules `callback` to run before `time` given in beats.
export const atBeat = (timeInBeats: number, callback: EventCallback, musicTimeline: MusicTimeline) => {
  return createEvent(beatsToSeconds(timeInBeats, musicTimeline.tempo), null, 0, callback, musicTimeline)
}

// Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
export const everyBeat = (beatInterval: number, onEvent: EventCallback, musicTimeline: MusicTimeline) => {
  const event = atBeat(beatInterval, onEvent, musicTimeline)
  return repeat(beatsToSeconds(beatInterval, musicTimeline.tempo), event, musicTimeline)
}
