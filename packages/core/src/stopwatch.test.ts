import { describe, expect, test, vi } from 'vitest'

import { createMockClock, Stopwatch } from './index.js'

describe('Stopwatch', () => {
  test('reports zero elapsed and ignores time until it is started', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    expect(stopwatch.get()).toBe(0)
    mockClock.advance(50)
    expect(stopwatch.get()).toBe(0)
  })

  test('reports live elapsed while running', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    mockClock.advance(30)
    expect(stopwatch.get()).toBe(30)
    mockClock.advance(20)
    expect(stopwatch.get()).toBe(50)
  })

  test('notifies subscribers with the elapsed time on each tick', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const listener = vi.fn()
    stopwatch.subscribe(listener)
    stopwatch.start()
    mockClock.advance(100)
    expect(stopwatch.get()).toBe(100)
    expect(listener).toHaveBeenCalled()
    expect(listener).toHaveBeenLastCalledWith(100)
  })

  test('freezes elapsed once stopped', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.start()
    mockClock.advance(40)
    stopwatch.stop()
    expect(stopwatch.get()).toBe(40)
    mockClock.advance(100)
    expect(stopwatch.get()).toBe(40)
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
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
    unsubscribe()
    mockClock.advance(1)
    expect(listener).toHaveBeenCalledOnce()
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

  test('skips listeners added or removed mid-notification and halts the wave on destroy', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    const notifiedListenerNames: string[] = []
    let unsubscribeSecondListener: (() => void) | undefined
    const listenerAddedDuringNotification = vi.fn(() => {
      notifiedListenerNames.push('addedDuringNotification')
    })
    const firstListener = vi.fn(() => {
      notifiedListenerNames.push('first')
      stopwatch.subscribe(listenerAddedDuringNotification)
      unsubscribeSecondListener?.()
    })
    const secondListener = vi.fn(() => {
      notifiedListenerNames.push('second')
    })
    const destroyingListener = vi.fn(() => {
      notifiedListenerNames.push('destroying')
      stopwatch.destroy()
    })
    const fourthListener = vi.fn(() => {
      notifiedListenerNames.push('fourth')
    })
    stopwatch.subscribe(firstListener)
    unsubscribeSecondListener = stopwatch.subscribe(secondListener)
    stopwatch.subscribe(destroyingListener)
    stopwatch.subscribe(fourthListener)
    stopwatch.start()
    mockClock.advance(1)
    expect(notifiedListenerNames).toEqual(['first', 'destroying'])
    expect(listenerAddedDuringNotification).not.toHaveBeenCalled()
    expect(secondListener).not.toHaveBeenCalled()
    expect(fourthListener).not.toHaveBeenCalled()
    expect(stopwatch.get()).toBe(1)
    mockClock.advance(10)
    expect(stopwatch.get()).toBe(1)
  })

  test('honours stop called from inside a listener', () => {
    const mockClock = createMockClock()
    const stopwatch = new Stopwatch(mockClock)
    stopwatch.subscribe(() => {
      stopwatch.stop()
    })
    stopwatch.start()
    mockClock.advance(5)
    expect(stopwatch.get()).toBe(5)
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
    mockClock.advance(100)
    expect(stopwatch.get()).toBe(12)
    expect(listener).not.toHaveBeenCalled()
    stopwatch.start()
    stopwatch.stop()
    stopwatch.reset()
    expect(stopwatch.get()).toBe(12)
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
