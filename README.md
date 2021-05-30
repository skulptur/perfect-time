## `perfect-time`

A clock to schedule time events with precision in Typescript.

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
import { resumeContext } from 'audio-fns'

resumeContext(new AudioContext()).then((context) => {
  const clock = createClock({
    context,
    ticker: createScriptProcessorTicker(context),
  })

  clock.start()

  clock
    .every(1, (event) => {
      console.log('interval', event.count)
    })
    .limit(10)
})
```

[Examples](https://github.com/skulptur/perfect-time/tree/master/example)
