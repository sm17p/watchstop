import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'

export type CreateStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
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

export function createStopwatch(
  options?: CreateStopwatchOptions,
): StopwatchBinding {
  const stopwatch = new Stopwatch(options?.clock, {
    precisionMs: options?.precisionMs,
  })
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
      stopwatch.destroy()
    },
  }

  return binding
}
