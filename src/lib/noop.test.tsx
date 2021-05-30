import { noop } from './noop'

describe('it', () => {
  it('does nothing', () => {
    expect(noop()).toBe(undefined)
  })
})
