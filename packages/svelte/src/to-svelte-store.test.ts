import { createMockClock, Stopwatch } from '@watchstop/core'
import { describe, expect, it, vi } from 'vitest'
import { toSvelteStore } from './to-svelte-store.js'

describe('toSvelteStore', () => {
  it('invokes the subscriber with the current value on subscribe', () => {
    const clock = createMockClock()
    const stopwatch = new Stopwatch(clock)
    const elapsed = toSvelteStore(stopwatch)
    const listener = vi.fn()

    const unsubscribe = elapsed.subscribe(listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(0)

    unsubscribe()
  })

  it('forwards store updates through subscribe', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const elapsed = toSvelteStore(stopwatch)
    const received: number[] = []

    const unsubscribe = elapsed.subscribe((value) => {
      received.push(value)
    })

    stopwatch.start()
    clock.advance(16)
    expect(received).toEqual([0, 16])

    unsubscribe()
    clock.advance(16)
    expect(received).toEqual([0, 16])
  })
})
