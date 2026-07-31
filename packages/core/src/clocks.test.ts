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
  test('starts at zero and moves forward only when advanced', () => {
    const mockClock = createMockClock()
    expect(mockClock.now()).toBe(0)
    mockClock.advance(25)
    expect(mockClock.now()).toBe(25)
    mockClock.advance(10)
    expect(mockClock.now()).toBe(35)
  })

  test('runs a scheduled callback only once the frame delay has elapsed', () => {
    const frameDelay = 5
    const mockClock = createMockClock({ frameDelay })
    const scheduledCallback = vi.fn()
    mockClock.schedule(scheduledCallback)
    expect(scheduledCallback).not.toHaveBeenCalled()
    mockClock.advance(frameDelay - 1)
    expect(scheduledCallback).not.toHaveBeenCalled()
    mockClock.advance(1)
    expect(scheduledCallback).toHaveBeenCalledOnce()
  })

  test('rejects advancing by a negative or non-finite duration', () => {
    const mockClock = createMockClock()
    expect(() => mockClock.advance(Number.NaN)).toThrow(RangeError)
    expect(() => mockClock.advance(Number.POSITIVE_INFINITY)).toThrow(RangeError)
    expect(() => mockClock.advance(-1)).toThrow(RangeError)
  })

  test('rejects a negative or non-finite frame delay', () => {
    expect(() => createMockClock({ frameDelay: -1 })).toThrow(RangeError)
    expect(() => createMockClock({ frameDelay: Number.NaN })).toThrow(RangeError)
  })

  test('defers a callback scheduled from inside a callback to the next advance', () => {
    const mockClock = createMockClock()
    const callbackRunOrder: string[] = []
    mockClock.schedule(() => {
      callbackRunOrder.push('first')
      mockClock.schedule(() => {
        callbackRunOrder.push('nested')
      })
    })
    mockClock.advance(0)
    expect(callbackRunOrder).toEqual(['first'])
    mockClock.advance(0)
    expect(callbackRunOrder).toEqual(['first', 'nested'])
  })

  test('runs callbacks due on the next advance, in scheduling order', () => {
    const mockClock = createMockClock()
    const callbackRunOrder: number[] = []
    mockClock.schedule(() => {
      callbackRunOrder.push(1)
    })
    mockClock.schedule(() => {
      callbackRunOrder.push(2)
    })
    mockClock.advance(0)
    expect(callbackRunOrder).toEqual([1, 2])
  })

  test('never runs a cancelled callback and ignores repeated or unknown cancels', () => {
    const mockClock = createMockClock()
    const cancelledCallback = vi.fn()
    const scheduleHandle = mockClock.schedule(cancelledCallback)
    mockClock.cancel(scheduleHandle)
    mockClock.cancel(scheduleHandle)
    mockClock.cancel(Symbol('unknown'))
    mockClock.advance(0)
    expect(cancelledCallback).not.toHaveBeenCalled()
  })
})

describe('createTimerClock', () => {
  test('runs a scheduled callback once the configured interval has elapsed', async () => {
    vi.useFakeTimers()
    const intervalMs = 40
    const timerClock = createTimerClock({ intervalMs })
    const scheduledCallback = vi.fn()
    timerClock.schedule(scheduledCallback)
    expect(scheduledCallback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(intervalMs - 1)
    expect(scheduledCallback).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(scheduledCallback).toHaveBeenCalledOnce()
  })

  test('rejects an interval that is not a finite positive number', () => {
    expect(() => createTimerClock({ intervalMs: 0 })).toThrow(RangeError)
    expect(() => createTimerClock({ intervalMs: -5 })).toThrow(RangeError)
    expect(() => createTimerClock({ intervalMs: Number.NaN })).toThrow(RangeError)
  })

  test('never runs a cancelled callback and tolerates cancelling twice', async () => {
    vi.useFakeTimers()
    const intervalMs = 10
    const timerClock = createTimerClock({ intervalMs })
    const cancelledCallback = vi.fn()
    const scheduleHandle = timerClock.schedule(cancelledCallback)
    timerClock.cancel(scheduleHandle)
    timerClock.cancel(scheduleHandle)
    await vi.advanceTimersByTimeAsync(intervalMs * 5)
    expect(cancelledCallback).not.toHaveBeenCalled()
  })
})

describe('createBrowserClock', () => {
  test('refuses to be created without requestAnimationFrame', () => {
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    expect(() => createBrowserClock()).toThrow()
  })

  test('defers callbacks to the next animation frame and drops cancelled ones', () => {
    const pendingFrameCallbacks = new Map<number, FrameRequestCallback>()
    let nextFrameId = 1
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback): number => {
        const frameId = nextFrameId
        nextFrameId += 1
        pendingFrameCallbacks.set(frameId, callback)
        return frameId
      },
    )
    vi.stubGlobal('cancelAnimationFrame', (frameId: number): void => {
      pendingFrameCallbacks.delete(frameId)
    })

    const browserClock = createBrowserClock()
    const scheduledCallback = vi.fn()
    const scheduleHandle = browserClock.schedule(scheduledCallback)
    expect(scheduledCallback).not.toHaveBeenCalled()
    expect(typeof browserClock.now()).toBe('number')
    expect(typeof scheduleHandle).toBe('number')
    if (typeof scheduleHandle === 'number') {
      const queuedFrameCallback = pendingFrameCallbacks.get(scheduleHandle)
      expect(queuedFrameCallback).toBeTypeOf('function')
      if (queuedFrameCallback !== undefined) {
        queuedFrameCallback(0)
      }
    }
    expect(scheduledCallback).toHaveBeenCalledOnce()

    const cancelledCallback = vi.fn()
    const cancelledHandle = browserClock.schedule(cancelledCallback)
    browserClock.cancel(cancelledHandle)
    browserClock.cancel(cancelledHandle)
    if (typeof cancelledHandle === 'number') {
      expect(pendingFrameCallbacks.has(cancelledHandle)).toBe(false)
    }
  })
})

describe('detectClock', () => {
  test('picks the browser clock when requestAnimationFrame is available', () => {
    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback): number => {
        callback(0)
        return 1
      },
    )
    vi.stubGlobal('cancelAnimationFrame', (): void => {})
    const detectedClock = detectClock()
    const scheduledCallback = vi.fn()
    detectedClock.schedule(scheduledCallback)
    expect(scheduledCallback).toHaveBeenCalledOnce()
  })

  test('falls back to the timer clock without requestAnimationFrame', async () => {
    const defaultTimerIntervalMs = 16
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', undefined)
    const detectedClock = detectClock()
    const scheduledCallback = vi.fn()
    detectedClock.schedule(scheduledCallback)
    await vi.advanceTimersByTimeAsync(defaultTimerIntervalMs)
    expect(scheduledCallback).toHaveBeenCalledOnce()
  })
})
