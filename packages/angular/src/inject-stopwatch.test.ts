import { createMockClock, Stopwatch, type Clock } from '@watchstop/core'
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  injectStopwatch,
  type StopwatchBinding,
} from './inject-stopwatch.js'

type InjectedStopwatch = {
  binding: StopwatchBinding
  destroyHost: () => void
}

function runInjected(clock: Clock): InjectedStopwatch {
  const parent = TestBed.inject(EnvironmentInjector)
  const host = createEnvironmentInjector(
    [provideZonelessChangeDetection()],
    parent,
  )
  const binding = runInInjectionContext(host, () =>
    injectStopwatch({ clock }),
  )
  return {
    binding,
    destroyHost: (): void => {
      host.destroy()
    },
  }
}

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
})

afterEach(() => {
  TestBed.resetTestingModule()
})

describe('injectStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInjected(clock)

    expect(binding.elapsed()).toBe(0)

    clock.advance(64)
    expect(binding.elapsed()).toBe(0)
  })

  it('drives elapsed through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInjected(clock)

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
    const { binding } = runInjected(clock)

    expect(binding.running()).toBe(false)
    binding.start()
    expect(binding.running()).toBe(true)
    expect(binding.elapsed()).toBe(0)
  })

  it('keeps control identities stable across updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding } = runInjected(clock)
    const { start, stop, reset } = binding

    binding.start()
    clock.advance(16)
    clock.advance(16)

    expect(binding.start).toBe(start)
    expect(binding.stop).toBe(stop)
    expect(binding.reset).toBe(reset)
  })

  it('destroys the stopwatch when DestroyRef cleans up', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { binding, destroyHost } = runInjected(clock)
    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    binding.start()
    clock.advance(16)
    const notificationsWhileActive = listener.mock.calls.length
    expect(notificationsWhileActive).toBeGreaterThan(0)
    expect(binding.elapsed()).toBe(16)

    destroyHost()
    clock.advance(160)

    expect(listener.mock.calls.length).toBe(notificationsWhileActive)
    expect(binding.elapsed()).toBe(16)
    expect(binding.stopwatch.get()).toBe(16)

    binding.start()
    clock.advance(16)
    expect(binding.stopwatch.get()).toBe(16)
  })

  it('requires an injection context', () => {
    const clock = createMockClock({ frameDelay: 16 })
    expect(() => injectStopwatch({ clock })).toThrow()
  })

  it('runs inside runInInjectionContext', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const injector = TestBed.inject(EnvironmentInjector)
    const binding = runInInjectionContext(injector, () =>
      injectStopwatch({ clock }),
    )

    expect(binding.elapsed()).toBe(0)
    binding.start()
    clock.advance(16)
    expect(binding.elapsed()).toBe(16)
  })

  it('shares one stopwatch across two borrowed bindings', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = runInInjectionContext(
      TestBed.inject(EnvironmentInjector),
      () => injectStopwatch({ stopwatch: shared }),
    )
    const second = runInInjectionContext(
      TestBed.inject(EnvironmentInjector),
      () => injectStopwatch({ stopwatch: shared }),
    )

    first.start()
    clock.advance(16)
    expect(first.elapsed()).toBe(16)
    expect(second.elapsed()).toBe(16)
    expect(first.stopwatch).toBe(shared)
    expect(second.stopwatch).toBe(shared)
  })

  it('does not destroy a borrowed stopwatch when DestroyRef cleans up', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const parent = TestBed.inject(EnvironmentInjector)
    const firstHost = createEnvironmentInjector(
      [provideZonelessChangeDetection()],
      parent,
    )
    const secondHost = createEnvironmentInjector(
      [provideZonelessChangeDetection()],
      parent,
    )
    const first = runInInjectionContext(firstHost, () =>
      injectStopwatch({ stopwatch: shared }),
    )
    const second = runInInjectionContext(secondHost, () =>
      injectStopwatch({ stopwatch: shared }),
    )

    clock.advance(64)
    expect(first.elapsed()).toBe(0)
    expect(second.elapsed()).toBe(0)

    first.start()
    clock.advance(16)
    expect(first.elapsed()).toBe(16)
    expect(second.elapsed()).toBe(16)

    firstHost.destroy()
    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
    expect(first.elapsed()).toBe(16)
    expect(second.elapsed()).toBe(32)

    secondHost.destroy()
  })
})
