import { createMockClock, Stopwatch } from '@watchstop/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockSignal<T> = {
  value: T
}

type VisibleTaskContext = {
  cleanup: (callback: () => void) => void
}

const cleanups: Array<() => void> = []

vi.mock('@qwik.dev/core', () => ({
  useSignal: <T,>(initial: T): MockSignal<T> => ({ value: initial }),
  noSerialize: <T,>(value: T): T => value,
  $: <T,>(value: T): T => value,
  useVisibleTask$: (task: (context: VisibleTaskContext) => void): void => {
    task({
      cleanup: (callback: () => void): void => {
        cleanups.push(callback)
      },
    })
  },
}))

const { useStopwatch } = await import('./use-stopwatch.js')

beforeEach(() => {
  cleanups.length = 0
})

describe('useStopwatch', () => {
  it('owns an inert stopwatch until start is called', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = useStopwatch({ clock })

    expect(binding.elapsed.value).toBe(0)

    clock.advance(64)
    expect(binding.elapsed.value).toBe(0)
  })

  it('drives elapsed through start, stop, and reset on the client bridge', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = useStopwatch({ clock })

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
    const binding = useStopwatch({ clock })

    expect(binding.running.value).toBe(false)
    binding.start()
    expect(binding.running.value).toBe(true)
    expect(binding.elapsed.value).toBe(0)
  })

  it('keeps control identities stable across updates', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = useStopwatch({ clock })
    const { start, stop, reset } = binding

    binding.start()
    clock.advance(16)
    clock.advance(16)

    expect(binding.start).toBe(start)
    expect(binding.stop).toBe(stop)
    expect(binding.reset).toBe(reset)
  })

  it('destroys the stopwatch when the visible task cleans up', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const binding = useStopwatch({ clock })
    const listener = vi.fn()
    binding.stopwatch.subscribe(listener)

    binding.start()
    clock.advance(16)
    const notificationsWhileActive = listener.mock.calls.length
    expect(notificationsWhileActive).toBeGreaterThan(0)
    expect(binding.elapsed.value).toBe(16)

    for (const cleanup of cleanups) {
      cleanup()
    }
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
    const first = useStopwatch({ stopwatch: shared })
    const second = useStopwatch({ stopwatch: shared })

    first.start()
    clock.advance(16)
    expect(first.elapsed.value).toBe(16)
    expect(second.elapsed.value).toBe(16)
    expect(first.stopwatch).toBe(shared)
    expect(second.stopwatch).toBe(shared)
  })

  it('does not destroy a borrowed stopwatch when the visible task cleans up', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const first = useStopwatch({ stopwatch: shared })
    const firstCleanups = cleanups.slice()
    const second = useStopwatch({ stopwatch: shared })

    clock.advance(64)
    expect(first.elapsed.value).toBe(0)
    expect(second.elapsed.value).toBe(0)

    first.start()
    clock.advance(16)
    expect(first.elapsed.value).toBe(16)
    expect(second.elapsed.value).toBe(16)

    for (const cleanup of firstCleanups) {
      cleanup()
    }
    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
    expect(first.elapsed.value).toBe(16)
    expect(second.elapsed.value).toBe(32)
  })
})
