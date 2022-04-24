import { createPubSub } from 'lightcast'
import { TimeEvent } from './timeEvent'

export type TimelinePubSub = ReturnType<typeof createTimelinePubSub>

export const createTimelinePubSub = () => {
  const pubSub = {
    onStart: createPubSub<void>(),
    onResume: createPubSub<void>(),
    onPlay: createPubSub<void>(),
    onStop: createPubSub<void>(),
    onPause: createPubSub<void>(),
    onEvent: createPubSub<TimeEvent>(),
    onEventExpire: createPubSub<TimeEvent>(),
    onCreateEvent: createPubSub<TimeEvent>(),
    onSchedule: createPubSub<void>(),
  }

  return {
    subscribe: {
      onStart: pubSub.onStart.subscribe,
      onResume: pubSub.onResume.subscribe,
      onPlay: pubSub.onPlay.subscribe,
      onStop: pubSub.onStop.subscribe,
      onPause: pubSub.onPause.subscribe,
      onEvent: pubSub.onEvent.subscribe,
      onEventExpire: pubSub.onEventExpire.subscribe,
      onCreateEvent: pubSub.onCreateEvent.subscribe,
      onSchedule: pubSub.onSchedule.subscribe,
    },
    dispatch: {
      onStart: pubSub.onStart.dispatch,
      onResume: pubSub.onResume.dispatch,
      onPlay: pubSub.onPlay.dispatch,
      onStop: pubSub.onStop.dispatch,
      onPause: pubSub.onPause.dispatch,
      onEvent: pubSub.onEvent.dispatch,
      onEventExpire: pubSub.onEventExpire.dispatch,
      onCreateEvent: pubSub.onCreateEvent.dispatch,
      onSchedule: pubSub.onSchedule.dispatch,
    },
  }
}
