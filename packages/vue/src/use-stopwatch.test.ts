import { createMockClock, type Clock } from '@watchstop/core'
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

  it('skips elapsed framework updates on ticks when reactiveElapsed is false', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const scope = effectScope()
    let binding: StopwatchBinding | undefined
    scope.run(() => {
      binding = useStopwatch({ clock, reactiveElapsed: false })
    })
    if (binding === undefined) {
      throw new Error('effect scope did not run the composable')
    }

    binding.start()
    expect(binding.running.value).toBe(true)
    expect(binding.elapsed.value).toBe(0)

    clock.advance(16)
    clock.advance(16)
    expect(binding.stopwatch.get()).toBe(32)
    expect(binding.elapsed.value).toBe(0)
    expect(binding.running.value).toBe(true)

    binding.stop()
    expect(binding.running.value).toBe(false)
    expect(binding.elapsed.value).toBe(32)

    scope.stop()
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
})
