import { createMockClock, Stopwatch } from '@watchstop/core'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStore } from './use-store.js'

describe('useStore', () => {
  it('returns the initial store value', () => {
    const clock = createMockClock()
    const stopwatch = new Stopwatch(clock)
    const { result } = renderHook(() => useStore(stopwatch))
    expect(result.current).toBe(0)
  })

  it('updates from subscribe notifications, not live get between ticks', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const { result } = renderHook(() => useStore(stopwatch))

    act(() => {
      stopwatch.start()
    })

    const beforeAdvance = result.current
    clock.advance(8)
    expect(result.current).toBe(beforeAdvance)

    act(() => {
      clock.advance(8)
    })
    expect(result.current).toBe(16)
  })

  it('returns the same value across rerenders without a notification', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const rendered: number[] = []
    const { result, rerender } = renderHook(() => {
      const elapsed = useStore(stopwatch)
      rendered.push(elapsed)
      return elapsed
    })

    act(() => {
      stopwatch.start()
      clock.advance(16)
    })
    expect(result.current).toBe(16)

    const afterTick = rendered.at(-1)
    rerender()
    expect(rendered.at(-1)).toBe(afterTick)
  })
})
