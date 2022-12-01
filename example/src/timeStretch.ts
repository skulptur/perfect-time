import {
    createPlayer,
    createSetIntervalTicker,
    play,
    timeStretch as stretch,
    createTimeEvent,
    getContextTime,
    getScheduledEvents, createQueue, schedule, Player
} from '../../src'

// export const playerWithLogger = (player: Player, log = console.log): Player => {
//     return {
//         ...player,
//         _callbacks: {
//             onStart: () => {
//                 log('onStart')
//                 player._callbacks.onStart()
//             },
//             onResume: () => {
//                 log('onResume')
//                 player._callbacks.onResume()
//             },
//             onPlay: () => {
//                 log('onPlay')
//                 player._callbacks.onPlay()
//             },
//             onStop: () => {
//                 log('onStop')
//                 player._callbacks.onStop()
//             },
//             onPause: () => {
//                 log('onPause')
//                 player._callbacks.onPause()
//             },
//             onEvent: (timeEvent) => {
//                 log('onEvent', timeEvent)
//                 player._callbacks.onEvent(timeEvent)
//             },
//             onEventExpire: (timeEvent) => {
//                 log('onEventExpire', timeEvent)
//                 player._callbacks.onEventExpire(timeEvent)
//             },
//             onSchedule: () => {
//                 log('onSchedule')
//                 player._callbacks.onSchedule()
//             }
//         }
//     }
// }

export const timeStretch = (context) => {
    // tweak as fast or slow as you want
    // it might start dropping if too high
    const ticker = createSetIntervalTicker(100)

    const player = createPlayer({
        context,
        ticker,
        onEvent: (timeEvent) => {
            if(typeof timeEvent.data === 'function'){
                timeEvent.data(timeEvent)
            }else{
                console.log(timeEvent.data)
            }

        }
    })

    const timeEvents = [
        createTimeEvent(1, 3, Infinity, 'event A'),
        createTimeEvent(2, 3, Infinity, 'event B'),
        createTimeEvent(3, 3, Infinity, 'event C')
    ]

    const queue = createQueue({timeEvents})

    play(queue, player)

    // the tempo will be doubled immediately for all events
    stretch(0.5, getContextTime(player), getScheduledEvents(player), player)

    // schedule an event in 5 seconds to change the tempo in half only for the first 2 events
    const changeTempoEvent = createTimeEvent(0, null, 1, (event) => {
            console.log('half tempo')

            stretch(2, event.time, timeEvents.slice(0, 2), player)
        })

    // TODO: it's letting us schedule an event of different T because player is unknown. Maybe player should be never by default
    schedule(getContextTime(player) + 5, changeTempoEvent, player)

}
