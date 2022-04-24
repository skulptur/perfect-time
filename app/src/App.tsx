import { NotificationsProvider } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { MantineProvider } from '@mantine/core'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from './components/Routes'
import { Hotkeys } from './components/Hotkeys'
import { Spotlight } from './components/Spotlight'

export const App = (): JSX.Element => {
  return (
    <MantineProvider theme={{ colorScheme: 'dark', focusRing: 'never' }}>
      <NotificationsProvider>
        <ModalsProvider>
          <BrowserRouter>
            <Spotlight>
              <Hotkeys />
              <Routes />
            </Spotlight>
          </BrowserRouter>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  )
}
