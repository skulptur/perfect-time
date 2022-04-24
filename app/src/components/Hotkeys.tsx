import React from 'react'
import { useHotkeys } from '@mantine/hooks';

export type HotkeysProps = {}

export const Hotkeys = (props: HotkeysProps): JSX.Element | null => {
    useHotkeys([
        ['l', () => console.log('logging')],
      ]);

    return null
}
