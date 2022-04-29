import { Text, Button } from '@mantine/core'
import { useRef } from 'react'
import { Blink, useBlink } from './lib/general/Blink'
import { Sequencer } from './lib/Sequencer/Sequencer'
import { resumeContext } from 'audio-fns'
import { sequencer } from './sequencer'
import { times, getItemCyclic } from 'data-fns'

export type HomeProps = {}

let isRunning = false

export const Home = (props: HomeProps): JSX.Element => {
  const blinks = times(3, useBlink)

  // const audioContext = useRef(new AudioContext())

  const run = () => {
    if (isRunning) return
    isRunning = true
    console.log('run')
    resumeContext(new AudioContext()).then((context) => {
      console.log('- sequencer')
      sequencer(context, (id) => getItemCyclic(id, blinks).blink())
    })
  }

  return (
    <>
      <Text color='gray'>Home</Text>
      <Button onClick={run}>Play</Button>
      {blinks.map(({ blinkProps }, id) => (
        <Blink {...blinkProps} key={id} width='50px' height='50px' background='white' />
      ))}

      <Sequencer />
    </>
  )
}
