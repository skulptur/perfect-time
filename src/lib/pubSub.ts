import { createPubSub, groupByAction } from 'lightcast'
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

  return groupByAction(pubSub)
}
