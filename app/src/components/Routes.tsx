import { Routes as ReactRoutes, Route } from 'react-router-dom'
import { Home } from './Home'
import { BasicSequencer } from './lib/BasicSequencer/BasicSequencer'

export type RoutesProps = {}

export const Routes = (props: RoutesProps): JSX.Element => {
  return (
    <ReactRoutes>
      <Route path='/' element={<BasicSequencer />} />
      <Route path='/help' element={<Home />} />
    </ReactRoutes>
  )
}
