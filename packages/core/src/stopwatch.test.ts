import { describe, expect, test, vi } from 'vitest'

import { createMockClock, Stopwatch } from './index.js'

describe('Stopwatch', () => {
  test('initial get is 0 and not running', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    expect(sw.get()).toBe(0)
    clock.advance(50)
    expect(sw.get()).toBe(0)
  })

  test('get while running is live elapsed', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.start()
    clock.advance(30)
    expect(sw.get()).toBe(30)
    clock.advance(20)
    expect(sw.get()).toBe(50)
  })

  test('start advance get reflects elapsed and ticks notify', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const listener = vi.fn()
    sw.subscribe(listener)
    sw.start()
    clock.advance(100)
    expect(sw.get()).toBe(100)
    expect(listener).toHaveBeenCalled()
    expect(listener).toHaveBeenLastCalledWith(100)
  })

  test('stop freezes elapsed; further advance does not change get', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.start()
    clock.advance(40)
    sw.stop()
    expect(sw.get()).toBe(40)
    clock.advance(100)
    expect(sw.get()).toBe(40)
  })

  test('second start after stop resumes from accumulated total', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.start()
    clock.advance(100)
    sw.stop()
    clock.advance(50)
    sw.start()
    clock.advance(20)
    expect(sw.get()).toBe(120)
  })

  test('double start and double stop are no-ops', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.start()
    clock.advance(10)
    sw.start()
    clock.advance(5)
    expect(sw.get()).toBe(15)
    sw.stop()
    sw.stop()
    expect(sw.get()).toBe(15)
  })

  test('reset sets elapsed to 0 and stops', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const listener = vi.fn()
    sw.subscribe(listener)
    sw.start()
    clock.advance(80)
    sw.reset()
    expect(sw.get()).toBe(0)
    clock.advance(50)
    expect(sw.get()).toBe(0)
    expect(listener).toHaveBeenCalledWith(0)
  })

  test('reset does not notify when already zero', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const listener = vi.fn()
    sw.subscribe(listener)
    sw.reset()
    expect(listener).not.toHaveBeenCalled()
  })

  test('subscribe unsubscribe is idempotent', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const listener = vi.fn()
    const unsubscribe = sw.subscribe(listener)
    sw.start()
    clock.advance(1)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
    unsubscribe()
    clock.advance(1)
    expect(listener).toHaveBeenCalledOnce()
  })

  test('multiple subscribers all receive updates', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const first = vi.fn()
    const second = vi.fn()
    sw.subscribe(first)
    sw.subscribe(second)
    sw.start()
    clock.advance(7)
    expect(first).toHaveBeenCalledWith(7)
    expect(second).toHaveBeenCalledWith(7)
  })

  test('throwing listener does not block other listeners', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const throwing = vi.fn(() => {
      throw new Error('boom')
    })
    const surviving = vi.fn()
    sw.subscribe(throwing)
    sw.subscribe(surviving)
    sw.start()
    clock.advance(3)
    expect(throwing).toHaveBeenCalled()
    expect(surviving).toHaveBeenCalledWith(3)
  })

  test('notify reentrancy: added miss wave, removed skip rest, destroy clears', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const calls: string[] = []
    let unsubscribeSecond: (() => void) | undefined
    const late = vi.fn(() => {
      calls.push('late')
    })
    const first = vi.fn(() => {
      calls.push('first')
      sw.subscribe(late)
      unsubscribeSecond?.()
    })
    const second = vi.fn(() => {
      calls.push('second')
    })
    const third = vi.fn(() => {
      calls.push('third')
      sw.destroy()
    })
    const fourth = vi.fn(() => {
      calls.push('fourth')
    })
    sw.subscribe(first)
    unsubscribeSecond = sw.subscribe(second)
    sw.subscribe(third)
    sw.subscribe(fourth)
    sw.start()
    clock.advance(1)
    expect(calls).toEqual(['first', 'third'])
    expect(late).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
    expect(fourth).not.toHaveBeenCalled()
    expect(sw.get()).toBe(1)
    clock.advance(10)
    expect(sw.get()).toBe(1)
  })

  test('controls from a listener are allowed', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.subscribe(() => {
      sw.stop()
    })
    sw.start()
    clock.advance(5)
    expect(sw.get()).toBe(5)
    clock.advance(20)
    expect(sw.get()).toBe(5)
  })

  test('destroy stops ticks, clears listeners, freezes get, ignores later controls', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    const listener = vi.fn()
    sw.subscribe(listener)
    sw.start()
    clock.advance(12)
    listener.mockClear()
    sw.destroy()
    expect(sw.get()).toBe(12)
    clock.advance(100)
    expect(sw.get()).toBe(12)
    expect(listener).not.toHaveBeenCalled()
    sw.start()
    sw.stop()
    sw.reset()
    expect(sw.get()).toBe(12)
  })

  test('subscribe after destroy does not retain listeners', () => {
    const clock = createMockClock()
    const sw = new Stopwatch(clock)
    sw.destroy()
    const listener = vi.fn()
    const unsubscribe = sw.subscribe(listener)
    unsubscribe()
    sw.start()
    clock.advance(5)
    expect(listener).not.toHaveBeenCalled()
    expect(sw.get()).toBe(0)
  })

  test('default construction uses detectClock without throwing in Node', () => {
    const sw = new Stopwatch()
    expect(sw.get()).toBe(0)
    sw.destroy()
  })
})
