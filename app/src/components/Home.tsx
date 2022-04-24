import { Box, Text, Button } from '@mantine/core'
import { useRef } from 'react'
import { createTimeline, createSetIntervalTicker, play, createEvent } from '../../../'
import { Blink, useBlink } from './lib/Blink'
import { resumeContext } from 'audio-fns'

export type HomeProps = {}

export const Home = (props: HomeProps): JSX.Element => {
  const { blink, blinkProps } = useBlink()
  const audioContext = useRef(new AudioContext())

  const playTimeline = () => {
    resumeContext(audioContext.current).then((context) => {
      const timeline = createTimeline({
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
        timeline
      )

      play(timeline)
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
      <Button onClick={playTimeline}>Play</Button>
      <Blink {...blinkProps} width='100px' height='100px' background='white' />
    </Box>
  )
}
