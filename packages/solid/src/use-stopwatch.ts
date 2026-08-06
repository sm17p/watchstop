import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { createSignal, onCleanup, type Accessor } from 'solid-js'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
  reactiveElapsed?: boolean
}

export type StopwatchBinding = {
  elapsed: Accessor<number>
  running: Accessor<boolean>
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
  const [running, setRunning] = createSignal(stopwatch.running)
  const [controlElapsed, setControlElapsed] = createSignal(stopwatch.get())
  const elapsed = reactiveElapsed ? useStore(stopwatch) : controlElapsed

  let previousRunning = stopwatch.running
  onCleanup(
    stopwatch.subscribe((value) => {
      const nextRunning = stopwatch.running
      const runningChanged = previousRunning !== nextRunning
      previousRunning = nextRunning
      if (runningChanged) {
        setRunning(nextRunning)
      }
      if (!reactiveElapsed && (runningChanged || !nextRunning)) {
        setControlElapsed(() => value)
      }
    }),
  )

  onCleanup(() => {
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
