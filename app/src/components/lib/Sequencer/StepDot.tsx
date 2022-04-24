import { MantineColor, Box } from "@mantine/core";

const getCircleStyles = (intensity: number, containerSize: number) => {
  const minimumSize = 2;
  const multiplier = 25;
  const size = intensity * multiplier + minimumSize;
  const margin = (containerSize - size) / 2;

  return {
    padding: size / 2,
    margin
  };
};

export type StepDotProps = {
  color: MantineColor;
  intensity: number; // 0..1
  active?: boolean;
  size: number;
  children?: React.ReactNode;
};

export const StepDot = ({
  color,
  intensity,
  active = true,
  size,
  children
}: StepDotProps): JSX.Element => {
  return (
    <Box
      sx={(theme) => ({
        ...getCircleStyles(intensity, size),
        backgroundColor: theme.colors[color][5],
        borderRadius: 100,
        display: "inline-block",
        position: "relative",
        opacity: active ? 1 : 0.3
      })}
    >
      {children}
    </Box>
  );
};
