import { createPubSub, groupByAction } from 'lightcast'
import { TimeEvent } from './timeEvent'

export type PlayerPubSub = ReturnType<typeof createPlayerPubSub>

export const createPlayerPubSub = () => {
  const pubSub = {
    onStart: createPubSub<void>(),
    onResume: createPubSub<void>(),
    onPlay: createPubSub<void>(),
    onStop: createPubSub<void>(),
    onPause: createPubSub<void>(),
    onEvent: createPubSub<TimeEvent>(),
    onEventExpire: createPubSub<TimeEvent>(),
    onSchedule: createPubSub<void>(),
  }

  return groupByAction(pubSub)
}
