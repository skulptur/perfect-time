import { manual } from './src/manual'
import { timeStretch } from './src/timeStretch'
import { interval } from './src/interval'
import { resumeContext } from 'audio-fns'

const example = {
  timeStretch,
  manual,
  interval,
}

let isRunning = false
const run = () => {
  if (isRunning) return
  isRunning = true


  console.log('run')
  resumeContext(new AudioContext()).then((context) => {
    // console.log('- timeStretch')
    // example.timeStretch(context)

    // console.log('- manual')
    // example.manual()

    console.log('- interval')
    example.interval(context)
  })
}



document.addEventListener('click', () => run())
