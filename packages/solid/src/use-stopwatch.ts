import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onCleanup, type Accessor } from 'solid-js'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: Accessor<number>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const stopwatch = new Stopwatch(options?.clock)
  const elapsed = useStore(stopwatch)

  onCleanup(() => {
    stopwatch.destroy()
  })

  return {
    elapsed,
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
