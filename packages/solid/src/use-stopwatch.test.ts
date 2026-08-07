import { createMockClock, Stopwatch, type Clock } from '@watchstop/core'
import { createRoot } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { useStopwatch, type StopwatchBinding } from './use-stopwatch.js'

type RootedStopwatch = {
  disposeRoot: () => void
  binding: StopwatchBinding
}

function runInRoot(clock: Clock): RootedStopwatch {
  return createRoot((disposeRoot) => ({
    disposeRoot,
    binding: useStopwatch({ clock }),
  }))
}

describe('useStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInRoot(clock)

    expect(binding.elapsed()).toBe(0)

    clock.advance(64)
    expect(binding.elapsed()).toBe(0)
  })

  it('drives elapsed through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInRoot(clock)

    binding.start()
    expect(binding.running()).toBe(true)
    clock.advance(16)
    expect(binding.elapsed()).toBe(16)

    binding.stop()
    expect(binding.running()).toBe(false)
    clock.advance(32)
    expect(binding.elapsed()).toBe(16)

    binding.reset()
    expect(binding.elapsed()).toBe(0)
    expect(binding.running()).toBe(false)
  })

  it('reflects running after start notifies at zero elapsed', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInRoot(clock)

    expect(binding.running()).toBe(false)
    binding.start()
    expect(binding.running()).toBe(true)
    expect(binding.elapsed()).toBe(0)
  })

  it('keeps control identities stable across updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInRoot(clock)
    const { start, stop, reset } = binding

    binding.start()
    clock.advance(16)
    clock.advance(16)

    expect(binding.start).toBe(start)
    expect(binding.stop).toBe(stop)
    expect(binding.reset).toBe(reset)
  })

  it('destroys the stopwatch when the owning root disposes', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { disposeRoot, binding } = runInRoot(clock)
    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    binding.start()
    clock.advance(16)
    const notificationsWhileActive = listener.mock.calls.length
    expect(notificationsWhileActive).toBeGreaterThan(0)
    expect(binding.elapsed()).toBe(16)

    disposeRoot()
    clock.advance(160)

    expect(listener.mock.calls.length).toBe(notificationsWhileActive)
    expect(binding.elapsed()).toBe(16)
    expect(binding.stopwatch.get()).toBe(16)

    binding.start()
    clock.advance(16)
    expect(binding.stopwatch.get()).toBe(16)
  })

  it('shares one stopwatch across two borrowed bindings', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = createRoot((disposeRoot) => ({
      disposeRoot,
      binding: useStopwatch({ stopwatch: shared }),
    }))
    const second = createRoot((disposeRoot) => ({
      disposeRoot,
      binding: useStopwatch({ stopwatch: shared }),
    }))

    first.binding.start()
    clock.advance(16)
    expect(first.binding.elapsed()).toBe(16)
    expect(second.binding.elapsed()).toBe(16)
    expect(first.binding.stopwatch).toBe(shared)
    expect(second.binding.stopwatch).toBe(shared)

    first.disposeRoot()
    second.disposeRoot()
  })

  it('does not destroy a borrowed stopwatch when the root disposes', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = createRoot((disposeRoot) => ({
      disposeRoot,
      binding: useStopwatch({ stopwatch: shared }),
    }))
    const second = createRoot((disposeRoot) => ({
      disposeRoot,
      binding: useStopwatch({ stopwatch: shared }),
    }))

    clock.advance(64)
    expect(first.binding.elapsed()).toBe(0)
    expect(second.binding.elapsed()).toBe(0)

    first.binding.start()
    clock.advance(16)
    expect(first.binding.elapsed()).toBe(16)
    expect(second.binding.elapsed()).toBe(16)

    first.disposeRoot()
    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
    expect(first.binding.elapsed()).toBe(16)
    expect(second.binding.elapsed()).toBe(32)

    second.disposeRoot()
  })
})
