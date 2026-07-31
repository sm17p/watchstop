import { createMockClock, Stopwatch } from '@watchstop/core'
import { createRoot } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { useStore } from './use-store.js'

describe('useStore', () => {
  it('exposes the initial value and updates from subscribe', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)

    const { disposeRoot, elapsed } = createRoot((disposeRoot) => {
      const elapsed = useStore(stopwatch)
      expect(elapsed()).toBe(0)

      stopwatch.start()
      clock.advance(16)
      expect(elapsed()).toBe(16)

      return { disposeRoot, elapsed }
    })

    disposeRoot()
    clock.advance(16)
    expect(elapsed()).toBe(16)
  })
})
