import { Box, Text } from '@mantine/core'
import { useEffect } from 'react'
import { createTimeline, createCallbackTicker, play, pause, stop, createEvent, getElapsedTime } from '../../../'

const test = () => {
  const logs: Array<string> = []
  const [ticker, tick] = createCallbackTicker()
  const context = {
    currentTime: 0,
  }

  const next = () => {
    context.currentTime++
    tick()
  }

  const advance = (times: number) =>
    Array.from(Array(times)).forEach(() => {
      next()
      logs.push(`context.currentTime ${context.currentTime}; timelime elapsed time ${getElapsedTime(timeline)}`)
    })

  const timeline = createTimeline({
    context,
    ticker,
    onStart: () => logs.push('onStart'),
    onResume: () => logs.push('onResume'),
    onPlay: () => logs.push('onPlay'),
    onStop: () => logs.push('onStop'),
    onPause: () => logs.push('onPause'),
    onEvent: () => logs.push('onTimeEvent'),
    onEventExpire: (timeEvent) =>
      logs.push(
        `onTimeEventExpired, event.time ${timeEvent.time}, event._latestTime ${timeEvent._latestTime}, currentTime: ${timeline.context.currentTime}`
      ),
    onCreateEvent: () => logs.push('onCreateEvent'),
    onSchedule: () => logs.push('onSchedule'),
  })

  createEvent(1, 1, 10, () => {}, timeline)

  play(timeline)
  advance(1)
  pause(timeline)
  advance(1)
  play(timeline)
  advance(1)
  stop(timeline)
  advance(1)

  return logs
}

export type HomeProps = {}

export const Home = (props: HomeProps): JSX.Element => {
  useEffect(() => {
    test().forEach((l) => console.log(l))
  }, [])

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colors.dark[6],
        width: '100vw',
        height: '100vh',
      })}
    >
      <Text color='gray'>Home</Text>
    </Box>
  )
}
