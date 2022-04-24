import { Routes as ReactRoutes, Route } from 'react-router-dom'
import { Home } from './Home'

export type RoutesProps = {}

export const Routes = (props: RoutesProps): JSX.Element => {
  return (
    <ReactRoutes>
      {/* <Route path='/help' element={<Home />} /> */}
      <Route path='/' element={<Home />} />
    </ReactRoutes>
  )
}
