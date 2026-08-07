import { createMockClock, Stopwatch, type Clock } from '@watchstop/core'
import { effectScope, type EffectScope } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useStopwatch, type StopwatchBinding } from './use-stopwatch.js'

type ScopedStopwatch = {
  scope: EffectScope
  binding: StopwatchBinding
}

function runInScope(clock: Clock): ScopedStopwatch {
  const scope = effectScope()
  let binding: StopwatchBinding | undefined
  scope.run(() => {
    binding = useStopwatch({ clock })
  })
  if (binding === undefined) {
    throw new Error('effect scope did not run the composable')
  }
  return { scope, binding }
}

describe('useStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInScope(clock)

    expect(binding.elapsed.value).toBe(0)

    clock.advance(64)
    expect(binding.elapsed.value).toBe(0)
  })

  it('drives elapsed through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInScope(clock)

    binding.start()
    expect(binding.running.value).toBe(true)
    clock.advance(16)
    expect(binding.elapsed.value).toBe(16)

    binding.stop()
    expect(binding.running.value).toBe(false)
    clock.advance(32)
    expect(binding.elapsed.value).toBe(16)

    binding.reset()
    expect(binding.elapsed.value).toBe(0)
    expect(binding.running.value).toBe(false)
  })

  it('reflects running after start notifies at zero elapsed', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInScope(clock)

    expect(binding.running.value).toBe(false)
    binding.start()
    expect(binding.running.value).toBe(true)
    expect(binding.elapsed.value).toBe(0)
  })

  it('keeps control identities stable across updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInScope(clock)
    const { start, stop, reset } = binding

    binding.start()
    clock.advance(16)
    clock.advance(16)

    expect(binding.start).toBe(start)
    expect(binding.stop).toBe(stop)
    expect(binding.reset).toBe(reset)
  })

  it('destroys the stopwatch when the owning scope stops', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { scope, binding } = runInScope(clock)
    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    binding.start()
    clock.advance(16)
    const notificationsWhileActive = listener.mock.calls.length
    expect(notificationsWhileActive).toBeGreaterThan(0)
    expect(binding.elapsed.value).toBe(16)

    scope.stop()
    clock.advance(160)

    expect(listener.mock.calls.length).toBe(notificationsWhileActive)
    expect(binding.elapsed.value).toBe(16)
    expect(binding.stopwatch.get()).toBe(16)

    binding.start()
    clock.advance(16)
    expect(binding.stopwatch.get()).toBe(16)
  })

  it('shares one stopwatch across two borrowed bindings', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const firstScope = effectScope()
    const secondScope = effectScope()
    let first: StopwatchBinding | undefined
    let second: StopwatchBinding | undefined
    firstScope.run(() => {
      first = useStopwatch({ stopwatch: shared })
    })
    secondScope.run(() => {
      second = useStopwatch({ stopwatch: shared })
    })
    if (first === undefined || second === undefined) {
      throw new Error('effect scope did not run the composable')
    }

    first.start()
    clock.advance(16)
    expect(first.elapsed.value).toBe(16)
    expect(second.elapsed.value).toBe(16)
    expect(first.stopwatch).toBe(shared)
    expect(second.stopwatch).toBe(shared)
  })

  it('does not destroy a borrowed stopwatch when the scope stops', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const scope = effectScope()
    let binding: StopwatchBinding | undefined
    scope.run(() => {
      binding = useStopwatch({ stopwatch: shared })
    })
    if (binding === undefined) {
      throw new Error('effect scope did not run the composable')
    }

    binding.start()
    clock.advance(16)
    expect(binding.elapsed.value).toBe(16)

    scope.stop()
    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
  })
})
