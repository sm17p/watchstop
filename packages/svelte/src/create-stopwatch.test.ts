import { createMockClock, Stopwatch, type Clock } from '@watchstop/core'
import { flushSync, mount, unmount } from 'svelte'
import { describe, expect, it, vi } from 'vitest'
import { createStopwatch, type StopwatchStore } from './create-stopwatch.js'
import StopwatchFixture from './stopwatch-fixture.svelte'

type MountedFixture = {
  target: HTMLElement
  component: Record<string, unknown>
  store: StopwatchStore
}

function mountFixture(clock: Clock): MountedFixture {
  const target = document.createElement('div')
  document.body.append(target)

  let store: StopwatchStore | undefined
  const component = mount(StopwatchFixture, {
    target,
    context: new Map<string, unknown>([
      ['clock', clock],
      [
        'publishStopwatch',
        (value: StopwatchStore): void => {
          store = value
        },
      ],
    ]),
  })

  if (store === undefined) {
    throw new Error('fixture did not publish a stopwatch')
  }
  return { target, component, store }
}

describe('createStopwatch', () => {
  it('satisfies the readable contract with an inert stopwatch', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = createStopwatch({ clock })
    const listener = vi.fn()

    const unsubscribe = stopwatch.subscribe(listener)
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(0)

    clock.advance(64)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    stopwatch.stopwatch.destroy()
  })

  it('drives subscribers through start, stop, and reset', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = createStopwatch({ clock })
    const received: number[] = []
    const unsubscribe = stopwatch.subscribe((value) => {
      received.push(value)
    })

    stopwatch.start()
    clock.advance(16)
    stopwatch.stop()
    clock.advance(32)
    stopwatch.reset()

    expect(received).toEqual([0, 0, 16, 16, 0])

    unsubscribe()
    stopwatch.start()
    clock.advance(16)
    expect(received).toEqual([0, 0, 16, 16, 0])

    stopwatch.stopwatch.destroy()
  })

  it('exposes a running store that tracks start and stop', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = createStopwatch({ clock })
    const runningStates: boolean[] = []
    const unsubscribe = stopwatch.running.subscribe((value) => {
      runningStates.push(value)
    })

    expect(runningStates).toEqual([false])
    stopwatch.start()
    expect(runningStates).toEqual([false, true])
    stopwatch.stop()
    expect(runningStates).toEqual([false, true, false])

    unsubscribe()
    stopwatch.stopwatch.destroy()
  })

  it('keeps control identities stable and survives resubscription', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const stopwatch = createStopwatch({ clock })
    const { start, stop, reset } = stopwatch

    stopwatch.subscribe(() => {})()

    const received: number[] = []
    const unsubscribe = stopwatch.subscribe((value) => {
      received.push(value)
    })

    stopwatch.start()
    clock.advance(16)

    expect(received).toEqual([0, 0, 16])
    expect(stopwatch.start).toBe(start)
    expect(stopwatch.stop).toBe(stop)
    expect(stopwatch.reset).toBe(reset)

    unsubscribe()
    stopwatch.stopwatch.destroy()
  })

  it('renders through auto-subscription and destroys with the owning component', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const { target, component, store } = mountFixture(clock)

    expect(target.textContent).toBe('0')

    store.start()
    clock.advance(16)
    flushSync()
    expect(target.textContent).toBe('16')

    const listener = vi.fn()
    store.stopwatch.subscribe(listener)

    unmount(component)
    flushSync()
    clock.advance(160)

    expect(listener).not.toHaveBeenCalled()
    expect(store.stopwatch.get()).toBe(16)

    store.start()
    clock.advance(16)
    expect(store.stopwatch.get()).toBe(16)

    target.remove()
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

  it('does not destroy a borrowed stopwatch outside component teardown', () => {
    const clock = createMockClock({ frameDelay: 16 })
    const shared = new Stopwatch(clock)
    const store = createStopwatch({ stopwatch: shared })

    store.start()
    clock.advance(16)
    expect(store.stopwatch.get()).toBe(16)

    shared.start()
    clock.advance(16)
    expect(shared.get()).toBe(32)
  })
})
