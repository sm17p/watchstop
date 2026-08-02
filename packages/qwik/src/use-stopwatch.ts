import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { useSignal, useVisibleTask$, type Signal } from '@qwik.dev/core'

export type UseStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: Signal<number>
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const stopwatch = new Stopwatch(options?.clock)
  const elapsed = useSignal(stopwatch.get())

  useVisibleTask$(({ cleanup }) => {
    const unsubscribe = stopwatch.subscribe((value) => {
      elapsed.value = value
    })
    cleanup(() => {
      unsubscribe()
      stopwatch.destroy()
    })
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
