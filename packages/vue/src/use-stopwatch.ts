import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { onScopeDispose, shallowRef, type ShallowRef } from 'vue'
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
  elapsed: Readonly<ShallowRef<number>>
  running: Readonly<ShallowRef<boolean>>
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
  const running = shallowRef(stopwatch.running)
  const unsubscribeRunning = stopwatch.subscribe(() => {
    running.value = stopwatch.running
  })

  onScopeDispose(unsubscribeRunning)
  if (ownsInstance) {
    onScopeDispose(() => {
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
