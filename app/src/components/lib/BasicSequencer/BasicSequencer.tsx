import React from 'react'

import { sequencer } from './sequencer'
import { resumeContext } from 'audio-fns'

let isRunning = false
const run = () => {
  if (isRunning) return
  isRunning = true
  console.log('run')
  resumeContext(new AudioContext()).then((context) => {
    console.log('- sequencer')
    sequencer(context)
  })
}

document.addEventListener('click', () => run())

export type BasicSequencerProps = {}

export const BasicSequencer = ({}: BasicSequencerProps): JSX.Element => {
  return <div />
}
