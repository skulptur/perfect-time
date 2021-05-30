import { Ticker } from '../../types'

// ScriptProcessorNode is deprecated but still widely available. Avoid using, included for completeness.
export const createScriptProcessorTicker = (
  audioContext: AudioContext,
  bufferSize: number = 256
): Ticker => {
  let isDisposed = false
  let node: ScriptProcessorNode | null = null

  return {
    start: (onTick) => {
      if (node || isDisposed) return
      node = audioContext.createScriptProcessor(bufferSize, 1, 1)
      node.connect(audioContext.destination)
      node.onaudioprocess = function() {
        process.nextTick(function() {
          onTick() // TODO: does it have to be nested like this?
        })
      }
    },
    stop: () => {
      node && node.disconnect()
    },
    dispose: () => {
      node && node.disconnect()
      isDisposed = true
    },
  }
}
