import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onDestroy } from 'svelte'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'
import { toSvelteStore } from './to-svelte-store.js'

export type CreateStopwatchOptions = {
  clock?: Clock
}

export type StopwatchStore = Readable<number> & {
  running: Readable<boolean>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

export function createStopwatch(
  options?: CreateStopwatchOptions,
): StopwatchStore {
  const stopwatch = new Stopwatch(options?.clock)
  const { subscribe } = toSvelteStore(stopwatch)
  const running: Readable<boolean> = {
    subscribe(listener: Subscriber<boolean>): Unsubscriber {
      listener(stopwatch.running)
      return stopwatch.subscribe(() => {
        listener(stopwatch.running)
      })
    },
  }

  destroyWithOwningComponent(stopwatch)

  return {
    subscribe,
    running,
    start: (): void => {
      stopwatch.start()
    },
    stop: (): void => {
      stopwatch.stop()
    },
    reset: (): void => {
      stopwatch.reset()
    },
    stopwatch,
  }
}

function destroyWithOwningComponent(stopwatch: Stopwatch): void {
  try {
    onDestroy(() => {
      stopwatch.destroy()
    })
  } catch {
    return
  }
}
