import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { createSignal, onCleanup, type Accessor } from 'solid-js'
import { useStore } from './use-store.js'

export type UseStopwatchOptions =
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
  elapsed: Accessor<number>
  running: Accessor<boolean>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

function resolveStopwatch(options?: UseStopwatchOptions): {
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

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const { stopwatch, ownsInstance } = resolveStopwatch(options)
  const elapsed = useStore(stopwatch)
  const [running, setRunning] = createSignal(stopwatch.running)
  onCleanup(
    stopwatch.subscribe(() => {
      setRunning(stopwatch.running)
    }),
  )

  if (ownsInstance) {
    onCleanup(() => {
      stopwatch.destroy()
    })
  }

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
