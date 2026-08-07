import { createMockClock, Stopwatch } from '@watchstop/core'
import Alpine from 'alpinejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createStopwatch,
  type StopwatchBinding,
} from './create-stopwatch.js'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    binding.init()

    expect(binding.elapsed).toBe(0)

    clock.advance(64)
    expect(binding.elapsed).toBe(0)

    binding.destroy()
  })

  it('drives elapsed through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    binding.init()

    binding.start()
    expect(binding.running).toBe(true)
    clock.advance(16)
    expect(binding.elapsed).toBe(16)

    binding.stop()
    expect(binding.running).toBe(false)
    clock.advance(32)
    expect(binding.elapsed).toBe(16)

    binding.reset()
    expect(binding.elapsed).toBe(0)
    expect(binding.running).toBe(false)

    binding.destroy()
  })

  it('reflects running after start notifies at zero elapsed', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    binding.init()

    expect(binding.running).toBe(false)
    binding.start()
    expect(binding.running).toBe(true)
    expect(binding.elapsed).toBe(0)

    binding.destroy()
  })

  it('keeps control identities stable across updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    binding.init()
    const { start, stop, reset } = binding

    binding.start()
    clock.advance(16)
    clock.advance(16)

    expect(binding.start).toBe(start)
    expect(binding.stop).toBe(stop)
    expect(binding.reset).toBe(reset)

    binding.destroy()
  })

  it('destroys the stopwatch when destroy runs', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    binding.init()
    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    binding.start()
    clock.advance(16)
    const notificationsWhileActive = listener.mock.calls.length
    expect(notificationsWhileActive).toBeGreaterThan(0)
    expect(binding.elapsed).toBe(16)

    binding.destroy()
    clock.advance(160)

    expect(listener.mock.calls.length).toBe(notificationsWhileActive)
    expect(binding.elapsed).toBe(16)
    expect(binding.stopwatch.get()).toBe(16)

    binding.start()
    clock.advance(16)
    expect(binding.stopwatch.get()).toBe(16)
  })

  it('writes elapsed through this so Alpine proxies see updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = createStopwatch({ clock })
    const view: StopwatchBinding = {
      elapsed: -1,
      running: false,
      start: binding.start,
      stop: binding.stop,
      reset: binding.reset,
      stopwatch: binding.stopwatch,
      init: binding.init,
      destroy: binding.destroy,
    }

    view.init()
    expect(view.elapsed).toBe(-1)
    expect(view.running).toBe(false)

    view.start()
    expect(view.running).toBe(true)
    clock.advance(16)
    expect(view.elapsed).toBe(16)
    expect(view.running).toBe(true)

    view.stop()
    expect(view.running).toBe(false)

    view.destroy()
  })

  it('destroys when Alpine removes the owning element', async () => {
    const clock = createMockClock({ frameDelay: 16 })
    let binding: StopwatchBinding | undefined

    Alpine.data('timer', () => {
      binding = createStopwatch({ clock })
      return binding
    })

    const target = document.createElement('div')
    target.setAttribute('x-data', 'timer')
    document.body.append(target)

    Alpine.initTree(target)
    await Promise.resolve()

    if (binding === undefined) {
      throw new Error('Alpine data factory did not run')
    }

    binding.start()
    clock.advance(16)
    expect(binding.elapsed).toBe(16)

    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    Alpine.destroyTree(target)
    target.remove()
    clock.advance(160)

    expect(listener).not.toHaveBeenCalled()
    expect(binding.stopwatch.get()).toBe(16)
  })

  it('shares one stopwatch across two borrowed bindings', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = createStopwatch({ stopwatch: shared })
    const second = createStopwatch({ stopwatch: shared })

    first.start()
    clock.advance(16)
    expect(first.stopwatch.get()).toBe(16)
    expect(second.stopwatch.get()).toBe(16)
    expect(first.stopwatch).toBe(shared)
    expect(second.stopwatch).toBe(shared)
  })

  it('does not destroy a borrowed stopwatch on binding destroy', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const binding = createStopwatch({ stopwatch: shared })
    binding.init()

    binding.start()
    clock.advance(16)
    expect(binding.elapsed).toBe(16)

    binding.destroy()
    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
  })
})
