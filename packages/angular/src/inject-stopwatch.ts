import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { DestroyRef, inject, signal, type Signal } from '@angular/core'

export type InjectStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
  reactiveElapsed?: boolean
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
  const reactiveElapsed = options?.reactiveElapsed !== false
  const stopwatch = new Stopwatch(options?.clock, {
    precisionMs: options?.precisionMs,
  })
  const elapsedValue = signal(stopwatch.get())
  const runningValue = signal(stopwatch.running)
  let previousRunning = stopwatch.running
  const unsubscribe = stopwatch.subscribe((value) => {
    const nextRunning = stopwatch.running
    const runningChanged = previousRunning !== nextRunning
    previousRunning = nextRunning
    if (runningChanged) {
      runningValue.set(nextRunning)
    }
    if (reactiveElapsed || runningChanged || !nextRunning) {
      elapsedValue.set(value)
    }
  })

  inject(DestroyRef).onDestroy(unsubscribe)
  inject(DestroyRef).onDestroy(() => {
    stopwatch.destroy()
  })

  return {
    elapsed: elapsedValue.asReadonly(),
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
