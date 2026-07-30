import { createMockClock, Stopwatch } from '@watchstop/core'
import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { useStore } from './use-store.js'

describe('useStore', () => {
  it('exposes the initial value and updates from subscribe', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)

    const { disposeRoot, value } = createRoot((disposeRoot) => {
      const value = useStore(stopwatch)
      expect(value()).toBe(0)

      stopwatch.start()
      clock.advance(16)
      expect(value()).toBe(16)

      return { disposeRoot, value }
    })

    disposeRoot()
    clock.advance(16)
    expect(value()).toBe(16)
  })
})
