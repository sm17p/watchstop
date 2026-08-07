import { StrictMode } from 'react'
import { createMockClock, Stopwatch, type Clock } from '@watchstop/core'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useStopwatch } from './use-stopwatch.js'

type CountingClock = {
  clock: Clock
  advance: (ms: number) => void
  readScheduleCount: () => number
}

function createCountingClock(): CountingClock {
  const mockClock = createMockClock({ frameDelay: 16 })
  let scheduleCount = 0

  return {
    clock: {
      now: (): number => mockClock.now(),
      schedule: (callback: () => void): unknown => {
        scheduleCount += 1
        return mockClock.schedule(callback)
      },
      cancel: (handle: unknown): void => {
        mockClock.cancel(handle)
      },
    },
    advance: (ms: number): void => {
      mockClock.advance(ms)
    },
    readScheduleCount: (): number => scheduleCount,
  }
}

describe('useStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { result } = renderHook(() => useStopwatch({ clock }))

    expect(result.current.elapsed).toBe(0)

    act(() => {
      clock.advance(64)
    })
    expect(result.current.elapsed).toBe(0)
  })

  it('drives elapsed through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { result } = renderHook(() => useStopwatch({ clock }))

    act(() => {
      result.current.start()
    })
    expect(result.current.running).toBe(true)
    act(() => {
      clock.advance(16)
    })
    expect(result.current.elapsed).toBe(16)

    act(() => {
      result.current.stop()
    })
    expect(result.current.running).toBe(false)
    act(() => {
      clock.advance(32)
    })
    expect(result.current.elapsed).toBe(16)

    act(() => {
      result.current.reset()
    })
    expect(result.current.elapsed).toBe(0)
    expect(result.current.running).toBe(false)
  })

  it('reflects running after start notifies at zero elapsed', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { result } = renderHook(() => useStopwatch({ clock }))

    expect(result.current.running).toBe(false)
    act(() => {
      result.current.start()
    })
    expect(result.current.running).toBe(true)
    expect(result.current.elapsed).toBe(0)
  })

  it('renders the elapsed delivered by subscribe, not live elapsed', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const renderedElapsed: number[] = []
    const { result, rerender } = renderHook(() => {
      const binding = useStopwatch({ clock })
      renderedElapsed.push(binding.elapsed)
      return binding
    })

    act(() => {
      result.current.start()
    })
    act(() => {
      clock.advance(16)
    })
    expect(renderedElapsed.at(-1)).toBe(16)

    clock.advance(8)
    expect(result.current.stopwatch.get()).toBe(24)

    const rendersBeforeRerender = renderedElapsed.length
    rerender()
    expect(renderedElapsed[rendersBeforeRerender]).toBe(16)

    act(() => {
      clock.advance(8)
    })
    expect(result.current.elapsed).toBe(32)
  })

  it('keeps control identities stable across renders and ticks', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { result, rerender } = renderHook(() => useStopwatch({ clock }))
    const { start, stop, reset } = result.current

    rerender()
    act(() => {
      result.current.start()
    })
    act(() => {
      clock.advance(16)
    })

    expect(result.current.start).toBe(start)
    expect(result.current.stop).toBe(stop)
    expect(result.current.reset).toBe(reset)
  })

  it('destroys the stopwatch on unmount so later ticks notify nobody', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { result, unmount } = renderHook(() => useStopwatch({ clock }))
    const { stopwatch } = result.current
    const listener = vi.fn()
    stopwatch.subscribe(listener)

    act(() => {
      result.current.start()
    })
    act(() => {
      clock.advance(16)
    })
    const notificationsWhileMounted = listener.mock.calls.length
    expect(notificationsWhileMounted).toBeGreaterThan(0)

    unmount()
    clock.advance(160)

    expect(listener.mock.calls.length).toBe(notificationsWhileMounted)
    expect(stopwatch.get()).toBe(16)

    stopwatch.start()
    clock.advance(16)
    expect(stopwatch.get()).toBe(16)
  })

  it('survives Strict Mode double invoke without orphaning a ticking stopwatch', () => {
    const counting = createCountingClock()
    const { result, unmount } = renderHook(
      () => useStopwatch({ clock: counting.clock }),
      { wrapper: StrictMode },
    )

    expect(counting.readScheduleCount()).toBe(0)

    act(() => {
      result.current.start()
    })
    expect(counting.readScheduleCount()).toBe(1)

    act(() => {
      counting.advance(16)
    })
    expect(result.current.elapsed).toBe(16)
    expect(result.current.stopwatch.get()).toBe(16)
    expect(counting.readScheduleCount()).toBe(2)

    const { stopwatch } = result.current
    unmount()
    counting.advance(160)

    expect(counting.readScheduleCount()).toBe(2)
    expect(stopwatch.get()).toBe(16)
  })

  it('shares one stopwatch across two borrowed bindings', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = renderHook(() => useStopwatch({ stopwatch: shared }))
    const second = renderHook(() => useStopwatch({ stopwatch: shared }))

    act(() => {
      clock.advance(64)
    })
    expect(first.result.current.elapsed).toBe(0)
    expect(second.result.current.elapsed).toBe(0)

    act(() => {
      first.result.current.start()
    })
    act(() => {
      clock.advance(16)
    })

    expect(first.result.current.elapsed).toBe(16)
    expect(second.result.current.elapsed).toBe(16)
    expect(first.result.current.stopwatch).toBe(shared)
    expect(second.result.current.stopwatch).toBe(shared)
  })

  it('does not destroy a borrowed stopwatch on unmount', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = renderHook(() => useStopwatch({ stopwatch: shared }))
    const second = renderHook(() => useStopwatch({ stopwatch: shared }))

    act(() => {
      first.result.current.start()
    })
    act(() => {
      clock.advance(16)
    })
    expect(first.result.current.elapsed).toBe(16)
    expect(second.result.current.elapsed).toBe(16)

    first.unmount()
    shared.start()
    act(() => {
      clock.advance(16)
    })
    expect(shared.get()).toBe(32)
    expect(first.result.current.elapsed).toBe(16)
    expect(second.result.current.elapsed).toBe(32)
  })

  it('survives Strict Mode double invoke without destroying a borrowed stopwatch', () => {
    const counting = createCountingClock()
    const shared = new Stopwatch(counting.clock)
    const { result, unmount } = renderHook(
      () => useStopwatch({ stopwatch: shared }),
      { wrapper: StrictMode },
    )

    expect(counting.readScheduleCount()).toBe(0)
    expect(result.current.elapsed).toBe(0)

    act(() => {
      counting.advance(64)
    })
    expect(result.current.elapsed).toBe(0)

    act(() => {
      result.current.start()
    })
    expect(counting.readScheduleCount()).toBe(1)

    act(() => {
      counting.advance(16)
    })
    expect(result.current.elapsed).toBe(16)
    expect(shared.get()).toBe(16)

    unmount()
    shared.start()
    counting.advance(16)
    expect(shared.get()).toBe(32)
  })

  it('does not exceed update depth while a live borrowed stopwatch is mounted', () => {
    let nowMs = 0
    const pending = new Map<symbol, () => void>()
    const clock: Clock = {
      now: (): number => {
        nowMs += 1
        return nowMs
      },
      schedule: (callback: () => void): unknown => {
        const handle = Symbol('tick')
        pending.set(handle, callback)
        return handle
      },
      cancel: (handle: unknown): void => {
        if (typeof handle === 'symbol') {
          pending.delete(handle)
        }
      },
    }
    const shared = new Stopwatch(clock)
    shared.start()

    const { result, rerender } = renderHook(() =>
      useStopwatch({ stopwatch: shared }),
    )

    expect(result.current.running).toBe(true)
    const elapsedBefore = result.current.elapsed

    rerender()
    rerender()
    expect(result.current.elapsed).toBe(elapsedBefore)

    act(() => {
      const tick = pending.values().next().value
      tick?.()
    })
    expect(result.current.elapsed).toBeGreaterThan(elapsedBefore)
  })
})
