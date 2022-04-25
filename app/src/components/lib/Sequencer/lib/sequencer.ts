import { times } from 'data-fns'
import { Step } from './step'

export type Range = {
  start: number
  end: number
}

export type StepProps = {
  globalStep: number
  partStep: number
  partIndex: number
}

export const getSequenceRange = (range: Range, stepGenerator: (props: StepProps) => Step): Array<Step> => {
  const length = range.end - range.start
  return times(length, (index) => {
    const globalStep = index + range.start
    // TODO: calculate part step
    const partStep = globalStep
    return stepGenerator({ globalStep, partStep, partIndex: 0 })
  })
}
