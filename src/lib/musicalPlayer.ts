import { Player, PlayerOptions, createPlayer, getContextTime, timeStretch, repeat } from './player'
import { secondsToBeats, beatsToSeconds } from 'audio-fns'
import { EventCallback } from './timeEvent'
import {addEvent, Queue} from "./queue";


export type MusicalPlayerOptions = {
  tempo: number
}

const defaultOptions: MusicalPlayerOptions = {
  tempo: 120,
}

export type MusicalPlayer = MusicalPlayerOptions & Player

export const createMusicalPlayer = (options: Partial<MusicalPlayerOptions & PlayerOptions> = {}): MusicalPlayer => {
  return {
    ...createPlayer(options),
    tempo: options.tempo || defaultOptions.tempo,
  }
}

export const getCurrentBeat = (musicalPlayer: MusicalPlayer) => {
  return secondsToBeats(getContextTime(musicalPlayer), musicalPlayer.tempo)
}

export const setTempo = (tempo: number, musicalPlayer: MusicalPlayer) => {
  const ratio = musicalPlayer.tempo / tempo
  musicalPlayer.tempo = tempo
  return timeStretch(ratio, getContextTime(musicalPlayer), musicalPlayer._playbackQueue.timeEvents, musicalPlayer)
}

// Schedules `callback` to run before `time` given in beats.
export const atBeat = (timeInBeats: number, callback: EventCallback, musicalPlayer: MusicalPlayer, queue: Queue) => {
  return addEvent(beatsToSeconds(timeInBeats, musicalPlayer.tempo), null, 0, callback, queue)
}

// Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
export const everyBeat = (beatInterval: number, onEvent: EventCallback, musicalPlayer: MusicalPlayer, queue: Queue) => {
  const event = atBeat(beatInterval, onEvent, musicalPlayer, queue)
  return repeat(beatsToSeconds(beatInterval, musicalPlayer.tempo), event, musicalPlayer)
}
