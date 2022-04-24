import {
  Step,
  StepProps,
  every,
  booleanToTriggers,
  getStep,
  getSequenceRange
} from "../../lib";

const getStepGenerator = (space: number) => {
  const getTriggers = (props: StepProps) => {
    return booleanToTriggers(every(props.globalStep, space));
  };

  return (props: StepProps): Step => {
    const triggers = getTriggers(props);
    const getVelocities = (triggers: Array<number>) => {
      return triggers.map((_trigger, index) => {
        return index % 2 === 0 && props.globalStep % 2 === 0 ? 0.3 : 1;
      });
    };

    const trigger = triggers.length ? [...triggers, 0.2, 0.5] : triggers;

    return getStep({
      trigger,
      velocity: getVelocities(trigger)
    });
  };
};

const parts = [
  {
    name: "intro",
    length: 16
  },
  {
    name: "verse",
    length: 16
  },
  {
    name: "break",
    length: 8
  },
  {
    name: "drop",
    length: 16
  },
  {
    name: "outro",
    length: 16
  }
];

// TODO: refactor into fn at least
let offset = 0;
export const track1 = parts.map((part, index) => {
  const range = {
    start: offset,
    end: offset + part.length
  };
  const partSequence = {
    ...part,
    offset,
    channels: [
      getSequenceRange(range, getStepGenerator(4 + index)),
      getSequenceRange(range, getStepGenerator(3 + index)),
      getSequenceRange(range, getStepGenerator(2 + index))
    ]
  };
  offset = range.end;
  return partSequence;
});
