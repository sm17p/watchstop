import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onScopeDispose, shallowRef, type ShallowRef } from 'vue'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
  reactiveElapsed?: boolean
}

export type StopwatchBinding = {
  elapsed: Readonly<ShallowRef<number>>
  running: Readonly<ShallowRef<boolean>>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const reactiveElapsed = options?.reactiveElapsed !== false
  const stopwatch = new Stopwatch(options?.clock, {
    precisionMs: options?.precisionMs,
  })
  const running = shallowRef(stopwatch.running)

  if (reactiveElapsed) {
    const elapsed = useStore(stopwatch)
    let previousRunning = stopwatch.running
    const unsubscribe = stopwatch.subscribe(() => {
      const nextRunning = stopwatch.running
      if (previousRunning === nextRunning) {
        return
      }
      previousRunning = nextRunning
      running.value = nextRunning
    })

    onScopeDispose(unsubscribe)
    onScopeDispose(() => {
      stopwatch.destroy()
    })

    return {
      elapsed,
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

  const elapsed = shallowRef(stopwatch.get())
  let previousRunning = stopwatch.running
  const unsubscribe = stopwatch.subscribe((value) => {
    const nextRunning = stopwatch.running
    const runningChanged = previousRunning !== nextRunning
    previousRunning = nextRunning
    if (runningChanged) {
      running.value = nextRunning
    }
    if (runningChanged || !nextRunning) {
      elapsed.value = value
    }
  })

  onScopeDispose(unsubscribe)
  onScopeDispose(() => {
    stopwatch.destroy()
  })

  return {
    elapsed,
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
