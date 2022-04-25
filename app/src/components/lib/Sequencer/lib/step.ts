// notice that everything is an array...
// trigger is the main one, and if the others are shorter there can be multiple ways of resolving, such as looping or interpolating
// TODO: this is actually quite limitting, there needs to be a function for generating the step, velocity and pitch by passing x triggers
export type Step = {
  trigger: Array<number> // unit - although close to 1 will not be played due to duration
  velocity: Array<number> // unit
  pitch: Array<number> // -24 to 24 for example
  pan: Array<number> // unit
}

const emptyStep: Step = {
  trigger: [],
  velocity: [],
  pitch: [],
  pan: [],
}

// for use in UI and sound engine
const fallbackStep: Step = {
  trigger: [],
  velocity: [0.7],
  pitch: [0],
  pan: [0.5],
}

export const getStepVelocity = (step: Step): Array<number> => {
  return step.velocity.length ? step.velocity : fallbackStep.velocity
}

const wrapIndex = (length: number, index: number) => {
  return index % length
}

export const getTriggerVelocity = (step: Step, triggerIndex: number, accessMethod = wrapIndex) => {
  const stepVelocity = getStepVelocity(step)

  return stepVelocity[accessMethod(stepVelocity.length, triggerIndex)]
}

export const getStepPiches = (step: Step): Array<number> => {
  return step.pitch.length ? step.pitch : fallbackStep.pitch
}

export const getStep = (partialStep: Partial<Step>): Step => {
  return {
    ...emptyStep,
    ...partialStep,
  }
}

// other utils
export const booleanToTriggers = (isActive: boolean): Array<number> => {
  return isActive ? [0] : []
}
