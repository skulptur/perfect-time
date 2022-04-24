import React from 'react'
import { Home, Search } from 'tabler-icons-react'
import { SpotlightProvider, SpotlightAction } from '@mantine/spotlight'
import { useNavigate } from "react-router-dom";

export type SpotlightProps = {
  children: React.ReactNode
}

export const Spotlight = ({ children }: SpotlightProps): JSX.Element => {
    const navigate = useNavigate();

    const actions: SpotlightAction[] = [
        {
          title: 'Home',
          description: 'Get to home page',
          onTrigger: () => navigate('/'),
          icon: <Home size={18} />,
        },
        {
          title: 'Help',
          description: 'Get to help page',
          onTrigger: () => navigate('/help'),
          icon: <Home size={18} />,
        },
      ]

  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<Search size={18} />}
      searchPlaceholder='Search...'
      shortcut='mod + shift + p'
      nothingFoundMessage='Nothing found...'
    >
      {children}
    </SpotlightProvider>
  )
}
