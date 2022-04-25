import { manual } from './src/manual'
import { timeStretch } from './src/timeStretch'
import { interval } from './src/interval'
import { scriptProcessor } from './src/scriptProcessor'
import { resumeContext } from 'audio-fns'

const example = {
  timeStretch,
  manual,
  interval,
  scriptProcessor,
}

resumeContext(new AudioContext()).then((context) => {
  // console.log('- timeStretch')
  // example.timeStretch(context)

  console.log('- manual')
  example.manual()

  console.log('- interval')
  example.interval(context)

  // console.log('- scriptProcessor')
  // example.scriptProcessor(context)
})
