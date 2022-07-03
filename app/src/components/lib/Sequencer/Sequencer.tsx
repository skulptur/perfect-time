import { ScrollArea, Switch, ActionIcon, Group, NumberInput } from '@mantine/core'
import { PlayerPlay, PlayerStop } from 'tabler-icons-react'
import { resumeContext } from 'audio-fns'
import { createPlayer, createSetIntervalTicker, createEvent, play, getContextTime } from '../../../../../'
import { useState } from 'react'
import { SequenceViewer } from './SequenceViewer'
import { Container } from './Container'
import { tracks } from './examples'

// TODO: there needs to be a way to map from the sequence to the clock
// looks like perfect time needs to be updated to have a way to identify what event is playing
const parts = tracks[0]
const audioContext = new AudioContext()

resumeContext(audioContext).then((context) => {
  const player = createPlayer({
    context,
    ticker: createSetIntervalTicker(30),
  })

  parts.forEach((part) => {
    part.channels.forEach((steps) => {
      steps.forEach((step, index) => {
        createEvent(index, null, 0, () => console.log('triggered'), player)
      })
    })
  })

  play(player)
  console.log(player._playbackQueue)
})

// TODO: would be nice to add a marker track with dots for 8, 16 and 32 bars
export const Sequencer = (): JSX.Element => {
  const [value, setValue] = useState('triggers')
  const [isStacked, setIsStacked] = useState(true)

  const sequencerViewers = parts.map((part) => {
    return <SequenceViewer label={part.name} channels={part.channels} offset={part.offset} inline={!isStacked} />
  })

  return (
    <div>
      {/* <SegmentedControl
        value={value}
        onChange={setValue}
        data={[
          { label: "None", value: "none" },
          { label: "Triggers", value: "triggers" },
          { label: "Velocity", value: "velocity" },
          { label: "Pitch", value: "pitch" },
          { label: "Pan", value: "pan" }
        ]}
      /> */}

      <Group>
        <ActionIcon variant='filled'>
          <PlayerPlay size={16} />
        </ActionIcon>
        <ActionIcon variant='filled'>
          <PlayerStop size={16} />
        </ActionIcon>
        <Switch
          checked={isStacked}
          onChange={(event) => setIsStacked(event.currentTarget.checked)}
          label='stack parts'
        />
        <NumberInput defaultValue={120} placeholder='BPM' label='BPM' />
      </Group>

      <ScrollArea>
        {isStacked ? (
          sequencerViewers.map((viewer) => <Container>{viewer}</Container>)
        ) : (
          <Container>{sequencerViewers}</Container>
        )}
      </ScrollArea>
    </div>
  )
}
