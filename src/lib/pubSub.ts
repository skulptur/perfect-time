import { createPubSub, groupByAction } from 'lightcast'
import { TimeEvent } from './timeEvent'

export type PlayerPubSub = ReturnType<typeof createPlayerPubSub>

export const createPlayerPubSub = <T>() => {
  const pubSub = {
    onStart: createPubSub<void>(),
    onResume: createPubSub<void>(),
    onPlay: createPubSub<void>(),
    onStop: createPubSub<void>(),
    onPause: createPubSub<void>(),
    onEvent: createPubSub<TimeEvent<T>>(),
    onEventExpire: createPubSub<TimeEvent<T>>(),
    onSchedule: createPubSub<void>(),
  }

  return groupByAction(pubSub)
}
