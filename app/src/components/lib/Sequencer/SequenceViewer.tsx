import { Text } from "@mantine/core";
import { StepDot } from "./StepDot";
import { times } from "data-fns";
import { getStepVelocity, getTriggerVelocity, Step } from "./lib";

// TODO: not working with 8, 16, 32 (32 nevr happens??)
// TODO: move to utils
const moduloMap = (n: number, nMap: Record<number, number>) => {
  const keys = Object.keys(nMap).sort();
  const keyMatch = keys.filter((key) => n % parseFloat(key) === 0)[0];

  return keyMatch ? nMap[keyMatch as any] : null;
};

export type SequenceViewerProps = {
  label: string;
  channels: Array<Array<Step>>;
  offset: number;
  inline: boolean;
};

const size = 30; // for the dots, refactor

export const SequenceViewer = ({
  label,
  channels,
  offset,
  inline
}: SequenceViewerProps): JSX.Element => {
  const length = channels[0]?.length || 0;
  return (
    <div style={inline ? { display: "inline-block" } : {}}>
      <Text color="gray" weight={700} size="sm">
        {label}
      </Text>
      {channels.map((channel) => {
        return (
          <div>
            {channel.reverse().map((step) => {
              // indigo
              const isActive = !!step.trigger.length;
              return (
                <StepDot
                  color="indigo"
                  intensity={isActive ? getStepVelocity(step)[0] : 0.2}
                  active={isActive}
                  size={size}
                >
                  {step.trigger.map((trig, index) => {
                    const trigVel = getTriggerVelocity(step, index);

                    const height = Math.round(30 * trigVel);
                    return (
                      <div
                        style={{
                          position: "absolute",
                          width: 1,
                          height,
                          marginLeft: -0.5 + trig * size,
                          marginTop: -(height / 2),
                          background: "white"
                        }}
                      />
                    );
                  })}
                </StepDot>
              );
            })}
          </div>
        );
      })}
      {times(length, (index) => {
        const step = offset + index;
        const intensities = [0, 0.1, 0.15, 0.2];
        const colors = ["red", "orange", "yellow", "lime"] as const;
        const styleIndex =
          moduloMap(step, {
            8: 1,
            16: 2,
            32: 3
          }) || 0;

        return (
          <StepDot
            color={colors[styleIndex]}
            intensity={intensities[styleIndex]}
            active={styleIndex > 0}
            size={size}
          />
        );
      })}
    </div>
  );
};
