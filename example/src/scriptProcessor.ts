import { createTimeline, createScriptProcessorTicker, play, createEvent, limit } from '../../src'

export const scriptProcessor = (context: AudioContext) => {
  const timeline = createTimeline({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  createEvent(1, 1, 10, (event) => console.log('script processor', event.count), timeline)

  play(timeline)
}
