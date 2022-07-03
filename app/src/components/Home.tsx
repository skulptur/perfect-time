import { Box, Text, Button } from '@mantine/core'
import { useRef } from 'react'
import { createPlayer, createSetIntervalTicker, play, createEvent } from '../../../'
import { Blink, useBlink } from './lib/general/Blink'
import { Sequencer } from './lib/Sequencer/Sequencer'
import { resumeContext } from 'audio-fns'

export type HomeProps = {}

export const Home = (props: HomeProps): JSX.Element => {
  const { blink, blinkProps } = useBlink()
  const audioContext = useRef(new AudioContext())

  const playPlayer = () => {
    resumeContext(audioContext.current).then((context) => {
      const player = createPlayer({
        context,
        ticker: createSetIntervalTicker(30),
      })

      createEvent(
        1,
        1,
        Infinity,
        (event) => {
          console.log(event.count)
          blink()
        },
        player
      )

      play(player)
    })
  }

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colors.dark[6],
        width: '100vw',
        height: '100vh',
      })}
    >
      <Text color='gray'>Home</Text>
      <Button onClick={playPlayer}>Play</Button>
      <Blink {...blinkProps} width='100px' height='100px' background='white' />
      <Sequencer />
    </Box>
  )
}
