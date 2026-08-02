import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { DestroyRef, inject, type Signal } from '@angular/core'
import { useStore } from './use-store.js'

export type InjectStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: Signal<number>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

export function injectStopwatch(
  options?: InjectStopwatchOptions,
): StopwatchBinding {
  const stopwatch = new Stopwatch(options?.clock)
  const elapsed = useStore(stopwatch)

  inject(DestroyRef).onDestroy(() => {
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
