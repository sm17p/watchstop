import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { DestroyRef, inject, signal, type Signal } from '@angular/core'
import { useStore } from './use-store.js'

export type InjectStopwatchOptions =
  | {
      clock?: Clock
      precisionMs?: number
      stopwatch?: undefined
    }
  | {
      stopwatch: Stopwatch
      clock?: never
      precisionMs?: never
    }

export type StopwatchBinding = {
  elapsed: Signal<number>
  running: Signal<boolean>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

function resolveStopwatch(options?: InjectStopwatchOptions): {
  stopwatch: Stopwatch
  ownsInstance: boolean
} {
  if (options?.stopwatch !== undefined) {
    return { stopwatch: options.stopwatch, ownsInstance: false }
  }
  return {
    stopwatch: new Stopwatch(options?.clock, {
      precisionMs: options?.precisionMs,
    }),
    ownsInstance: true,
  }
}

export function injectStopwatch(
  options?: InjectStopwatchOptions,
): StopwatchBinding {
  const { stopwatch, ownsInstance } = resolveStopwatch(options)
  const elapsed = useStore(stopwatch)
  const runningValue = signal(stopwatch.running)
  const unsubscribeRunning = stopwatch.subscribe(() => {
    runningValue.set(stopwatch.running)
  })

  inject(DestroyRef).onDestroy(unsubscribeRunning)
  if (ownsInstance) {
    inject(DestroyRef).onDestroy(() => {
      stopwatch.destroy()
    })
  }

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
