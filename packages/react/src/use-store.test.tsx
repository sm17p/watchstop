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

  it('getSnapshot stays stable between notifications', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = new Stopwatch(clock)
    const snapshots: number[] = []
    const { result, rerender } = renderHook(() => {
      const value = useStore(stopwatch)
      snapshots.push(value)
      return value
    })

    act(() => {
      stopwatch.start()
      clock.advance(16)
    })
    expect(result.current).toBe(16)

    const afterTick = snapshots.at(-1)
    rerender()
    expect(snapshots.at(-1)).toBe(afterTick)
  })
})
