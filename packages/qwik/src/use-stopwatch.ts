import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import {
  $,
  noSerialize,
  useSignal,
  useVisibleTask$,
  type NoSerialize,
  type QRL,
  type Signal,
} from '@qwik.dev/core'

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
  elapsed: Signal<number>
  running: Signal<boolean>
  start: QRL<() => void>
  stop: QRL<() => void>
  reset: QRL<() => void>
  stopwatch: Stopwatch
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const instance = useSignal<NoSerialize<Stopwatch>>()
  const ownsInstance = useSignal(true)
  if (instance.value === undefined) {
    if (options?.stopwatch !== undefined) {
      instance.value = noSerialize(options.stopwatch)
      ownsInstance.value = false
    } else {
      instance.value = noSerialize(
        new Stopwatch(options?.clock, { precisionMs: options?.precisionMs }),
      )
      ownsInstance.value = true
    }
  }

  const boundStopwatch = instance.value
  if (boundStopwatch === undefined) {
    throw new Error('@watchstop/qwik: Stopwatch could not be created')
  }

  const elapsed = useSignal(boundStopwatch.get())
  const running = useSignal(boundStopwatch.running)

  useVisibleTask$(({ cleanup }) => {
    const current = instance.value
    if (current === undefined) {
      return
    }
    const unsubscribe = current.subscribe((value) => {
      elapsed.value = value
      running.value = current.running
    })
    cleanup(() => {
      unsubscribe()
      if (ownsInstance.value) {
        current.destroy()
      }
    })
  })

  return {
    elapsed,
    running,
    start: $((): void => {
      instance.value?.start()
    }),
    stop: $((): void => {
      instance.value?.stop()
    }),
    reset: $((): void => {
      instance.value?.reset()
    }),
    stopwatch: boundStopwatch,
  }
}
