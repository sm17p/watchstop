import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  createBrowserClock,
  createMockClock,
  createTimerClock,
  detectClock,
} from './index.js'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createMockClock', () => {
  test('now starts at 0 and increases only via advance', () => {
    const clock = createMockClock()
    expect(clock.now()).toBe(0)
    clock.advance(25)
    expect(clock.now()).toBe(25)
    clock.advance(10)
    expect(clock.now()).toBe(35)
  })

  test('schedule never runs synchronously and uses dueTime now + frameDelay', () => {
    const clock = createMockClock({ frameDelay: 5 })
    const callback = vi.fn()
    clock.schedule(callback)
    expect(callback).not.toHaveBeenCalled()
    clock.advance(4)
    expect(callback).not.toHaveBeenCalled()
    clock.advance(1)
    expect(callback).toHaveBeenCalledOnce()
  })

  test('default frameDelay is 0', () => {
    const clock = createMockClock()
    const callback = vi.fn()
    clock.schedule(callback)
    clock.advance(0)
    expect(callback).toHaveBeenCalledOnce()
  })

  test('advance throws for non-finite or negative ms', () => {
    const clock = createMockClock()
    expect(() => clock.advance(Number.NaN)).toThrow(RangeError)
    expect(() => clock.advance(Number.POSITIVE_INFINITY)).toThrow(RangeError)
    expect(() => clock.advance(-1)).toThrow(RangeError)
  })

  test('frameDelay throws when invalid', () => {
    expect(() => createMockClock({ frameDelay: -1 })).toThrow(RangeError)
    expect(() => createMockClock({ frameDelay: Number.NaN })).toThrow(RangeError)
  })

  test('advance single-pass flush; nested schedule waits for later advance', () => {
    const clock = createMockClock()
    const order: string[] = []
    clock.schedule(() => {
      order.push('first')
      clock.schedule(() => {
        order.push('nested')
      })
    })
    clock.advance(0)
    expect(order).toEqual(['first'])
    clock.advance(0)
    expect(order).toEqual(['first', 'nested'])
  })

  test('flush is stable by due time then insertion order', () => {
    const clock = createMockClock()
    const order: number[] = []
    clock.schedule(() => {
      order.push(1)
    })
    clock.schedule(() => {
      order.push(2)
    })
    clock.advance(0)
    expect(order).toEqual([1, 2])
  })

  test('cancel is idempotent and prevents the callback', () => {
    const clock = createMockClock()
    const callback = vi.fn()
    const handle = clock.schedule(callback)
    clock.cancel(handle)
    clock.cancel(handle)
    clock.cancel(Symbol('unknown'))
    clock.advance(0)
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('createTimerClock', () => {
  test('uses intervalMs for setTimeout', async () => {
    vi.useFakeTimers()
    const clock = createTimerClock({ intervalMs: 40 })
    const callback = vi.fn()
    clock.schedule(callback)
    expect(callback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(39)
    expect(callback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(callback).toHaveBeenCalledOnce()
  })

  test('throws when intervalMs is not finite > 0', () => {
    expect(() => createTimerClock({ intervalMs: 0 })).toThrow(RangeError)
    expect(() => createTimerClock({ intervalMs: -5 })).toThrow(RangeError)
    expect(() => createTimerClock({ intervalMs: Number.NaN })).toThrow(RangeError)
  })

  test('cancel prevents the callback', async () => {
    vi.useFakeTimers()
    const clock = createTimerClock({ intervalMs: 10 })
    const callback = vi.fn()
    const handle = clock.schedule(callback)
    clock.cancel(handle)
    clock.cancel(handle)
    await vi.advanceTimersByTimeAsync(50)
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('createBrowserClock', () => {
  test('throws when requestAnimationFrame is missing', () => {
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    expect(() => createBrowserClock()).toThrow()
  })

  test('schedules with rAF and does not run synchronously', () => {
    const pending = new Map<number, FrameRequestCallback>()
    let nextId = 1
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback): number => {
        const id = nextId
        nextId += 1
        pending.set(id, callback)
        return id
      },
    )
    vi.stubGlobal('cancelAnimationFrame', (id: number): void => {
      pending.delete(id)
    })

    const clock = createBrowserClock()
    const callback = vi.fn()
    const handle = clock.schedule(callback)
    expect(callback).not.toHaveBeenCalled()
    expect(typeof clock.now()).toBe('number')
    expect(typeof handle).toBe('number')
    if (typeof handle === 'number') {
      const queued = pending.get(handle)
      expect(queued).toBeTypeOf('function')
      if (queued !== undefined) {
        queued(0)
      }
    }
    expect(callback).toHaveBeenCalledOnce()

    const cancelled = vi.fn()
    const cancelledHandle = clock.schedule(cancelled)
    clock.cancel(cancelledHandle)
    clock.cancel(cancelledHandle)
    if (typeof cancelledHandle === 'number') {
      expect(pending.has(cancelledHandle)).toBe(false)
    }
  })
})

describe('detectClock', () => {
  test('returns browser clock when requestAnimationFrame is a function', () => {
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback): number => {
        callback(0)
        return 1
      },
    )
    vi.stubGlobal('cancelAnimationFrame', (): void => {})
    const clock = detectClock()
    const callback = vi.fn()
    clock.schedule(callback)
    expect(callback).toHaveBeenCalledOnce()
  })

  test('returns timer clock when requestAnimationFrame is absent', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    const clock = detectClock()
    const callback = vi.fn()
    clock.schedule(callback)
    await vi.advanceTimersByTimeAsync(16)
    expect(callback).toHaveBeenCalledOnce()
  })
})
