import React from 'react'
import { Box, Text } from '@mantine/core'

export type AppProps = {}

export const App = (props: AppProps): JSX.Element => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        width: "100vw",
        height: "100vh"
      })}
    >
      <Text color="gray">App</Text>
    </Box>
  )
}
