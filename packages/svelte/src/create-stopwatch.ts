import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onDestroy } from 'svelte'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'
import { toSvelteStore } from './to-svelte-store.js'

export type CreateStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
  reactiveElapsed?: boolean
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
  const reactiveElapsed = options?.reactiveElapsed !== false
  const stopwatch = new Stopwatch(options?.clock, {
    precisionMs: options?.precisionMs,
  })
  const { subscribe } = reactiveElapsed
    ? toSvelteStore(stopwatch)
    : controlElapsedReadable(stopwatch)
  const running: Readable<boolean> = {
    subscribe(listener: Subscriber<boolean>): Unsubscriber {
      listener(stopwatch.running)
      let previousRunning = stopwatch.running
      return stopwatch.subscribe(() => {
        const nextRunning = stopwatch.running
        if (previousRunning === nextRunning) {
          return
        }
        previousRunning = nextRunning
        listener(nextRunning)
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

function controlElapsedReadable(stopwatch: Stopwatch): Readable<number> {
  return {
    subscribe(listener: Subscriber<number>): Unsubscriber {
      listener(stopwatch.get())
      let previousRunning = stopwatch.running
      return stopwatch.subscribe((value) => {
        const nextRunning = stopwatch.running
        const runningChanged = previousRunning !== nextRunning
        previousRunning = nextRunning
        if (runningChanged || !nextRunning) {
          listener(value)
        }
      })
    },
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
