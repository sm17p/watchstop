import { createMockClock, Stopwatch } from '@watchstop/core'
import { describe, expect, it, vi } from 'vitest'
import { fromStore } from './from-store.js'

describe('fromStore', () => {
  it('invokes the subscriber with the current value on subscribe', () => {
    const clock = createMockClock()
    const stopwatch = new Stopwatch(clock)
    const readable = fromStore(stopwatch)
    const listener = vi.fn()

    const unsubscribe = readable.subscribe(listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(0)

    unsubscribe()
  })

  it('forwards store updates through subscribe', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const readable = fromStore(stopwatch)
    const values: number[] = []

    const unsubscribe = readable.subscribe((value) => {
      values.push(value)
    })

    stopwatch.start()
    clock.advance(16)
    expect(values).toEqual([0, 16])

    unsubscribe()
    clock.advance(16)
    expect(values).toEqual([0, 16])
  })
})
