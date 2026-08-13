import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'

export type CreateStopwatchOptions =
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
  elapsed: number
  running: boolean
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
  init: (this: StopwatchBinding) => void
  destroy: () => void
}

function resolveStopwatch(options?: CreateStopwatchOptions): {
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

export function createStopwatch(
  options?: CreateStopwatchOptions,
): StopwatchBinding {
  const { stopwatch, ownsInstance } = resolveStopwatch(options)
  let unsubscribe = (): void => {}

  const binding: StopwatchBinding = {
    elapsed: stopwatch.get(),
    running: stopwatch.running,
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
    init(this: StopwatchBinding): void {
      unsubscribe()
      unsubscribe = stopwatch.subscribe((value) => {
        this.elapsed = value
        this.running = stopwatch.running
      })
    },
    destroy(): void {
      unsubscribe()
      unsubscribe = (): void => {}
      if (ownsInstance) {
        stopwatch.destroy()
      }
    },
  }

  return binding
}
