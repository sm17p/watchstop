import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'

export type CreateStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: number
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
  const stopwatch = new Stopwatch(options?.clock)
  let unsubscribe = (): void => {}

  const binding: StopwatchBinding = {
    elapsed: stopwatch.get(),
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
