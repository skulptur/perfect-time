import { Player, PlayerProps, createPlayer, getContextTime, timeStretch } from './player'
import { secondsToBeats } from 'audio-fns'
// import { EventCallback, createTimeEvent } from './timeEvent'
// import { insertEvent, Queue} from "./queue";

export type MusicalPlayerOptions = {
  tempo: number
}

const defaultOptions: MusicalPlayerOptions = {
  tempo: 120,
}

export type MusicalPlayer<T> = MusicalPlayerOptions & Player<T>

export const createMusicalPlayer = <T>(options: Partial<MusicalPlayerOptions & PlayerProps<T>> = {}): MusicalPlayer<T> => {
  return {
    ...createPlayer(options),
    tempo: options.tempo || defaultOptions.tempo,
  }
}

export const getCurrentBeat = <T>(musicalPlayer: MusicalPlayer<T>) => {
  return secondsToBeats(getContextTime(musicalPlayer), musicalPlayer.tempo)
}

export const setTempo = <T>(tempo: number, musicalPlayer: MusicalPlayer<T>) => {
  const ratio = musicalPlayer.tempo / tempo
  musicalPlayer.tempo = tempo
  return timeStretch(ratio, getContextTime(musicalPlayer), musicalPlayer._playbackQueue.timeEvents, musicalPlayer)
}
//
// // Schedules `callback` to run before `time` given in beats.
// export const atBeat = <T>(timeInBeats: number, callback: EventCallback<T>, musicalPlayer: MusicalPlayer<T>, queue: Queue<T>) => {
//   const event = createTimeEvent(beatsToSeconds(timeInBeats, musicalPlayer.tempo), null, 0, callback)
//   insertEvent(event, queue)
//   return event
// }
//
// // Schedules `callback` to run immediately and repeat with `delay` seconds indefinitely (until the event is manually cancelled).
// export const everyBeat = <T>(beatInterval: number, onEvent: EventCallback<T>, musicalPlayer: MusicalPlayer<T>, queue: Queue<T>) => {
//   const event = atBeat(beatInterval, onEvent, musicalPlayer, queue)
//   return repeat(beatsToSeconds(beatInterval, musicalPlayer.tempo), event, musicalPlayer)
// }
