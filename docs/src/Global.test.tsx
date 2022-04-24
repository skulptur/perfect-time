import React from 'react'
import { render, screen } from '@testing-library/react'
import { Global } from './Global'

test('renders learn react link', () => {
  render(<Global />)
  const linkElement = screen.getByText(/learn react/i)
  expect(linkElement).toBeInTheDocument()
})
