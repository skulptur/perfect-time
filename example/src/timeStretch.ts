import {
    createPlayer,
    createSetIntervalTicker,
    play,
    timeStretch as stretch,
    createTimeEvent,
    insertEvent,
    getContextTime,
    getScheduledEvents, createQueue, schedule
} from '../../src'

export const timeStretch = (context) => {
    // tweak as fast or slow as you want
    // it might start dropping if too high
    const ticker = createSetIntervalTicker(100)

    const player = createPlayer({
        context,
        ticker,
    })

    const queue = createQueue()

    const events = [
        createTimeEvent(1, 3, Infinity, () => console.log('event A')),
        createTimeEvent(2, 3, Infinity, () => console.log('event B')),
        createTimeEvent(3, 3, Infinity, () => console.log('event C'))
    ]

    events.forEach(event => insertEvent(event, queue))

    play(queue, player)

    // the tempo will be doubled immediately for all events
    stretch(0.5, getContextTime(player), getScheduledEvents(player), player)

    // schedule an event in 5 seconds to change the tempo in half only for the first 2 events
    const changeTempoEvent = createTimeEvent(0, null, 1, (event) => {
            console.log('half tempo')
            stretch(2, event.time, getScheduledEvents(player).slice(0, 2), player)
        })

    schedule(getContextTime(player) + 5, changeTempoEvent, player)

}
