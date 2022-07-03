// player
export {
    createPlayer,
    getContextTime,
    getElapsedTime,
    isStopped,
    isPaused,
    isPlaying,
    resume,
    start,
    play,
    stop,
    pause,
    timeStretch,
    schedule,
    repeat,
    getScheduledEvents,
} from './lib/player'
export type {
    PlayerContext,
    PlayerOptions,
    PlayerDispatchers, Player
} from './lib/player'
export {
    createQueue,
    clear,
    isQueued,
    updateIndex,
    addEvent,
    insertEvent,
    removeEvent,
    moveTimeEvent,
    setTolerance,
    limit
} from './lib/queue'
export type {Queue} from './lib/queue'

export type {TimeEvent, EventCallback} from './lib/timeEvent'


// music player
export {createMusicalPlayer} from './lib/musicalPlayer'
export type {MusicalPlayer, MusicalPlayerOptions} from './lib/musicalPlayer'

// pubSub
export {createPlayerPubSub} from './lib/pubSub'

// tickers
export type {Ticker} from './types'
export {createCallbackTicker} from './lib/tickers/callbackTicker'
export {createSetIntervalTicker} from './lib/tickers/setIntervalTicker'
export {createNoopTicker} from './lib/tickers/noopTicker'
export {createWorkerSetIntervalTicker} from './lib/tickers/workerSetIntervalTicker'

