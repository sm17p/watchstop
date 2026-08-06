import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'

export type CreateStopwatchOptions = {
  clock?: Clock
  precisionMs?: number
  reactiveElapsed?: boolean
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
  const reactiveElapsed = options?.reactiveElapsed !== false
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
      let previousRunning = stopwatch.running
      unsubscribe = stopwatch.subscribe((value) => {
        const nextRunning = stopwatch.running
        const runningChanged = previousRunning !== nextRunning
        previousRunning = nextRunning
        if (runningChanged) {
          this.running = nextRunning
        }
        if (reactiveElapsed || runningChanged || !nextRunning) {
          this.elapsed = value
        }
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
