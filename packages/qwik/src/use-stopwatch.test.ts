import { createMockClock } from '@watchstop/core'
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
    clock.advance(16)
    expect(binding.elapsed.value).toBe(16)

    binding.stop()
    clock.advance(32)
    expect(binding.elapsed.value).toBe(16)

    binding.reset()
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
})
