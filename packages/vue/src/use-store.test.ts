import { createMockClock, Stopwatch } from '@watchstop/core'
import { effectScope } from 'vue'
import { describe, expect, it } from 'vitest'
import { useStore } from './use-store.js'

describe('useStore', () => {
  it('exposes the initial value and updates from subscribe', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const scope = effectScope()
    const elapsed = scope.run(() => useStore(stopwatch))

    expect(elapsed?.value).toBe(0)

    stopwatch.start()
    clock.advance(16)
    expect(elapsed?.value).toBe(16)

    scope.stop()
    clock.advance(16)
    expect(elapsed?.value).toBe(16)
  })
})
