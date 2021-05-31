import { manual } from './src/manual'
import { scriptProcessor } from './src/scriptProcessor'
import { resumeContext } from 'audio-fns'

const example = {
  manual,
  scriptProcessor,
}

resumeContext(new AudioContext()).then((context) => {
  console.log('- manual')
  example.manual()

  console.log('- scriptProcessor')
  example.scriptProcessor(context)
})
