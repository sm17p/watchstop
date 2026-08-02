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

export type UseStopwatchOptions = {
  clock?: Clock
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
  if (instance.value === undefined) {
    instance.value = noSerialize(new Stopwatch(options?.clock))
  }

  const ownedStopwatch = instance.value
  if (ownedStopwatch === undefined) {
    throw new Error('@watchstop/qwik: Stopwatch could not be created')
  }

  const elapsed = useSignal(ownedStopwatch.get())
  const running = useSignal(ownedStopwatch.running)

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
      current.destroy()
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
    stopwatch: ownedStopwatch,
  }
}
