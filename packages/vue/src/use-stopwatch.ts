import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onScopeDispose, shallowRef, type ShallowRef } from 'vue'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
  clock?: Clock
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
  const stopwatch = new Stopwatch(options?.clock)
  const elapsed = useStore(stopwatch)
  const running = shallowRef(stopwatch.running)
  const unsubscribeRunning = stopwatch.subscribe(() => {
    running.value = stopwatch.running
  })

  onScopeDispose(unsubscribeRunning)
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
