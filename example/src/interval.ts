import {
  createPlayer,
  createSetIntervalTicker,
  play,
  createTimeEvent,
  createQueue,
  TimeEvent
} from '../../src'
import * as Tone from 'tone';

type Note = {
  name: string,
  note: string,
  synth: Tone.FMSynth
} | ((event: TimeEvent<any>) => void)

export const interval = (context) => {
  const synthA = new Tone.FMSynth().toDestination();
  const synthB = new Tone.FMSynth().toDestination();
  const synthC = new Tone.FMSynth().toDestination();

  // tweak as fast or slow as you want
  // it might start dropping if too high
  const ticker = createSetIntervalTicker(1)

  const player = createPlayer<Note>({
    context,
    ticker,
    onEvent: (timeEvent) => {
      if(typeof timeEvent.data === 'function'){
        timeEvent.data(timeEvent)
      }else{
        const {synth, note, name} = timeEvent.data
        const time = timeEvent.time
        console.log(name, time)

        synth.triggerAttackRelease(note, "16n", time);
      }
    }
  })

  const timeEvents = [
    createTimeEvent(0, 0.4, 10, {
      note: 'C2',
      name: 'event A',
      synth: synthA
    }),
    createTimeEvent(0.2, 0.4, 10, {
      note: 'E3',
      name: 'event B',
      synth: synthB
    }),
    createTimeEvent(0.3, 0.4, 10, {
      note: 'G4',
      name: 'event C',
      synth: synthC
    })
  ]

  const queue = createQueue({timeEvents})

  play(queue, player)
}
