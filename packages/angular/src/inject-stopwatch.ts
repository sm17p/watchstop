import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { DestroyRef, inject, signal, type Signal } from '@angular/core'
import { useStore } from './use-store.js'

export type InjectStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: Signal<number>
  running: Signal<boolean>
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
  const runningValue = signal(stopwatch.running)
  const unsubscribeRunning = stopwatch.subscribe(() => {
    runningValue.set(stopwatch.running)
  })

  inject(DestroyRef).onDestroy(unsubscribeRunning)
  inject(DestroyRef).onDestroy(() => {
    stopwatch.destroy()
  })

  return {
    elapsed,
    running: runningValue.asReadonly(),
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
