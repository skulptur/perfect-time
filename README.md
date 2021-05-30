## `perfect-time`

A generic clock to schedule time events with precision in Typescript.

Events have a configurable tolerance zone in which they must be executed or otherwise get dropped. This allows you to use the latest application state, for example with the Web Audio API. It also solves the issues with unreliable JS timers by accepting user or library provided tickers which can run on a separate thread.

## Get started

Install

```bash
yarn add perfect-time
# or
npm install --save perfect-time
```

Use

```typescript
import { createClock, createScriptProcessorTicker } from 'perfect-time'

const context = new AudioContext() // make sure it is resumed

const clock = createClock({
  context,
  ticker: createScriptProcessorTicker(context),
})

clock.start()

clock
  .every(1, (event) => {
    console.log('every second:', event.count)
  })
  .limit(10) // 10 times
```

## API

Note that AudioContext is used just for the sake of the examples as the clock is generic and can work with any `{ currentTime: number }`.

**Create a clock**

```typescript
import { createClock, createScriptProcessorTicker } from 'perfect-time'

const clock = createClock({
  // For audio you'll want to pass AudioContext.
  context: audioContext,
  // The ticker is what periodically runs the check for events.
  // It should run on another thread if possible to prevent dropping events.
  ticker: createScriptProcessorTicker(context), // for this one you actually need it to be an AudioContext for ScriptProcessorNode
})
```

**Schedule Events**

```typescript
const callback = (event) => {
  // use event.time to schedule precisely (for example using AudioContext)
  console.log('event time:', event.time)
}

// callback gets called right before context.currentTime reaches 10
clock.atTime(10, callback)

// callback gets called right before 10 seconds elapsed and repeats
clock.every(10, callback)

// callback gets called right before 10 seconds elapsed
clock.setTimeout(10, callback)

// callback gets called right before 10 seconds elapsed and repeats
clock.setInterval(10, callback)
```

**Control Events**

You can also control the event directly, for example to schedule repetition in the future or limiting repeats.

```typescript
// callback called right before context.currentTime reaches 10, and then every second 3 times
// clock.atTime returns an event, which we call .repeat on
clock.atTime(10, callback).repeat(1, 3)

// equivalent to the above
clock
  .atTime(10, callback)
  .repeat(1)
  .limit(3)
```

**Cancel Events**

```typescript
// start an oscillator node at context.currentTime = 13
const event = clock.every(1, (event) => {
  oscNode.start(event.time)
})

// cancel
event.clear()
```

**Change speed of a group of events**

```typescript
const eventA = clock.atTime(1, () => console.log('event A')).repeat(3)
const eventB = clock.atTime(2, () => console.log('event B')).repeat(3)
const eventC = clock.atTime(3, () => console.log('event B')).repeat(3)

// the speed will be doubled in 9 seconds only for eventA and eventB
clock.setTimeout(9, (event) => {
  clock.timeStretch(0.5, event.time, [eventA, eventB])
})
```

[Examples](https://github.com/skulptur/perfect-time/tree/master/example)
