import { Box } from "@mantine/core";

export type ContainerProps = {
  children: React.ReactNode;
};

export const Container = ({ children }: ContainerProps): JSX.Element => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colors.dark[8],
        borderRadius: theme.radius.sm,
        whiteSpace: "nowrap",
        padding: theme.spacing.xs,
        marginTop: theme.spacing.xs
      })}
    >
      {children}
    </Box>
  );
};
