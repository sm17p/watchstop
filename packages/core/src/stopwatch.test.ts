import { describe, expect, test, vi } from 'vitest'

import { createMockClock, Stopwatch } from './index.js'

describe('Stopwatch', () => {
  test('reports zero elapsed and ignores time until it is started', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    expect(stopwatch.get()).toBe(0)
    expect(stopwatch.running).toBe(false)
    mockClock.advance(50)
    expect(stopwatch.get()).toBe(0)
    expect(stopwatch.running).toBe(false)
  })

  test('reports live elapsed while running', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    expect(stopwatch.running).toBe(true)
    mockClock.advance(30)
    expect(stopwatch.get()).toBe(30)
    mockClock.advance(20)
    expect(stopwatch.get()).toBe(50)
  })

  test('notifies subscribers on start even when elapsed stays zero', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith(0)
    expect(stopwatch.running).toBe(true)
    stopwatch.start()
    expect(listener).toHaveBeenCalledOnce()
  })

  test('freezes elapsed once stopped', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    mockClock.advance(40)
    stopwatch.stop()
    expect(stopwatch.get()).toBe(40)
    expect(stopwatch.running).toBe(false)
    mockClock.advance(100)
    expect(stopwatch.get()).toBe(40)
  })

  test('notifies subscribers with the final elapsed time on stop', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    mockClock.advance(40)
    listener.mockClear()
    stopwatch.stop()
    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenLastCalledWith(40)
  })

  test('resumes from the accumulated total when started again', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    mockClock.advance(100)
    stopwatch.stop()
    mockClock.advance(50)
    stopwatch.start()
    mockClock.advance(20)
    expect(stopwatch.get()).toBe(120)
  })

  test('ignores a repeated start and a repeated stop', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    mockClock.advance(10)
    stopwatch.start()
    mockClock.advance(5)
    expect(stopwatch.get()).toBe(15)
    stopwatch.stop()
    stopwatch.stop()
    expect(stopwatch.get()).toBe(15)
  })

  test('returns elapsed to zero, stops running and notifies on reset', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    mockClock.advance(80)
    stopwatch.reset()
    expect(stopwatch.get()).toBe(0)
    mockClock.advance(50)
    expect(stopwatch.get()).toBe(0)
    expect(listener).toHaveBeenCalledWith(0)
  })

  test('stays silent when reset while already at zero', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.reset()
    expect(listener).not.toHaveBeenCalled()
  })

  test('stops notifying after unsubscribe and tolerates unsubscribing twice', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    const unsubscribe = stopwatch.subscribe(listener)
    stopwatch.start()
    mockClock.advance(1)
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    unsubscribe()
    mockClock.advance(1)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  test('notifies every subscriber with the same elapsed time', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const firstListener = vi.fn()
    const secondListener = vi.fn()
    stopwatch.subscribe(firstListener)
    stopwatch.subscribe(secondListener)
    stopwatch.start()
    mockClock.advance(7)
    expect(firstListener).toHaveBeenCalledWith(7)
    expect(secondListener).toHaveBeenCalledWith(7)
  })

  test('ticks on the frame cadence of a clock with a frame delay', () => {
    const frameDelay = 10
    const mockClock = createMockClock({ frameDelay })
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenLastCalledWith(0)
    mockClock.advance(frameDelay - 1)
    expect(listener).toHaveBeenCalledOnce()
    mockClock.advance(1)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenLastCalledWith(frameDelay)
    mockClock.advance(frameDelay)
    expect(listener).toHaveBeenCalledTimes(3)
    expect(listener).toHaveBeenLastCalledWith(frameDelay * 2)
  })

  test('keeps notifying the remaining listeners when one throws', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const throwingListener = vi.fn(() => {
      throw new Error('boom')
    })
    const survivingListener = vi.fn()
    stopwatch.subscribe(throwingListener)
    stopwatch.subscribe(survivingListener)
    stopwatch.start()
    mockClock.advance(3)
    expect(throwingListener).toHaveBeenCalled()
    expect(survivingListener).toHaveBeenCalledWith(3)
  })

  test('never notifies a listener subscribed during the wave that added it', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listenerAddedDuringNotification = vi.fn()
    const subscribingListener = vi.fn(() => {
      stopwatch.subscribe(listenerAddedDuringNotification)
    })
    stopwatch.start()
    stopwatch.subscribe(subscribingListener)
    mockClock.advance(1)
    expect(subscribingListener).toHaveBeenCalledOnce()
    expect(listenerAddedDuringNotification).not.toHaveBeenCalled()
  })

  test('skips a listener unsubscribed earlier in the same wave', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    let unsubscribeSecondListener: (() => void) | undefined
    const firstListener = vi.fn(() => {
      unsubscribeSecondListener?.()
    })
    const secondListener = vi.fn()
    stopwatch.start()
    stopwatch.subscribe(firstListener)
    unsubscribeSecondListener = stopwatch.subscribe(secondListener)
    mockClock.advance(1)
    expect(firstListener).toHaveBeenCalledOnce()
    expect(secondListener).not.toHaveBeenCalled()
  })

  test('halts the wave when a listener destroys the stopwatch', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const notifiedListenerNames: string[] = []
    const firstListener = vi.fn(() => {
      notifiedListenerNames.push('first')
    })
    const destroyingListener = vi.fn(() => {
      notifiedListenerNames.push('destroying')
      stopwatch.destroy()
    })
    const listenerAfterDestroy = vi.fn(() => {
      notifiedListenerNames.push('afterDestroy')
    })
    stopwatch.start()
    stopwatch.subscribe(firstListener)
    stopwatch.subscribe(destroyingListener)
    stopwatch.subscribe(listenerAfterDestroy)
    mockClock.advance(1)
    expect(notifiedListenerNames).toEqual(['first', 'destroying'])
    expect(listenerAfterDestroy).not.toHaveBeenCalled()
    expect(stopwatch.running).toBe(false)
  })

  test('honours stop called from inside a listener', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.subscribe((elapsed) => {
      if (elapsed === 0) {
        return
      }
      stopwatch.stop()
    })
    stopwatch.start()
    mockClock.advance(5)
    expect(stopwatch.get()).toBe(5)
    expect(stopwatch.running).toBe(false)
    mockClock.advance(20)
    expect(stopwatch.get()).toBe(5)
  })

  test('freezes elapsed, drops listeners and ignores every control after destroy', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    mockClock.advance(12)
    listener.mockClear()
    stopwatch.destroy()
    expect(stopwatch.get()).toBe(12)
    expect(stopwatch.running).toBe(false)
    mockClock.advance(100)
    expect(stopwatch.get()).toBe(12)
    expect(listener).not.toHaveBeenCalled()
    stopwatch.start()
    stopwatch.stop()
    stopwatch.reset()
    expect(stopwatch.get()).toBe(12)
    expect(stopwatch.running).toBe(false)
  })

  test('never notifies a listener subscribed after destroy', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.destroy()
    const listener = vi.fn()
    const unsubscribe = stopwatch.subscribe(listener)
    unsubscribe()
    stopwatch.start()
    mockClock.advance(5)
    expect(listener).not.toHaveBeenCalled()
    expect(stopwatch.get()).toBe(0)
  })

  test('starts at zero on the auto-detected clock when no clock is given', () => {
    const stopwatch = new Stopwatch()
    expect(stopwatch.get()).toBe(0)
    stopwatch.destroy()
  })
})
