import {
    createPlayer,
    createSetIntervalTicker,
    play,
    timeStretch as stretch,
    createTimeEvent,
    getContextTime,
    getScheduledEvents, createQueue, schedule, TimeEvent
} from '../../src'
import * as Tone from 'tone';

type Note = {
    name: string,
    note: string,
    synth: Tone.FMSynth
} | ((event: TimeEvent<any>) => void)

export const timeStretch = (context) => {

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
        createTimeEvent(0, 3, 10, {
            note: 'C2',
            name: 'event A',
            synth: synthA
        }),
        createTimeEvent(1, 3, 10, {
            note: 'E3',
            name: 'event B',
            synth: synthB
        }),
        createTimeEvent(2, 3, 10, {
            note: 'G4',
            name: 'event C',
            synth: synthC
        })
    ]

    const queue = createQueue({timeEvents})

    play(queue, player)
    // the tempo will be doubled immediately for all events
    stretch(0.5, getContextTime(player), getScheduledEvents(player), player)

    // schedule an event in 5 seconds to change the tempo in half for all events
    const changeTempoEvent = createTimeEvent(0, null, 1, (event) => {
            console.log('half tempo', event.time)
            stretch(2, event.time, timeEvents, player)
        })

    // TODO: it's letting us schedule an event of different T because player is unknown. Maybe player should be never by default
    schedule(getContextTime(player) + 3, changeTempoEvent, player)


}
