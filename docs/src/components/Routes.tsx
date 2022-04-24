import React from 'react'
import { Routes as ReactRoutes, Route } from 'react-router-dom'
import { App } from './App'

export type RoutesProps = {}

export const Routes = (props: RoutesProps): JSX.Element => {
  return (
    <ReactRoutes>
      <Route path='/' element={<App />} />
      <Route path='/help' element={<App />} />
    </ReactRoutes>
  )
}
