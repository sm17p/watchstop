import { useEffect, useRef, useState } from 'react'
import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
  clock?: Clock
}

export type StopwatchBinding = {
  elapsed: number
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

type StopwatchControls = Pick<StopwatchBinding, 'start' | 'stop' | 'reset'>

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const clock = options?.clock
  const ownedStopwatch = useRef<Stopwatch | null>(null)
  const stopwatch = (ownedStopwatch.current ??= new Stopwatch(clock))
  const [, republishStopwatch] = useState(0)

  const controls = useRef<StopwatchControls | null>(null)
  const { start, stop, reset } = (controls.current ??= {
    start: (): void => {
      ownedStopwatch.current?.start()
    },
    stop: (): void => {
      ownedStopwatch.current?.stop()
    },
    reset: (): void => {
      ownedStopwatch.current?.reset()
    },
  })

  useEffect(() => {
    if (ownedStopwatch.current === null) {
      ownedStopwatch.current = new Stopwatch(clock)
      republishStopwatch((generation) => generation + 1)
    }
    return (): void => {
      ownedStopwatch.current?.destroy()
      ownedStopwatch.current = null
    }
  }, [clock])

  const elapsed = useStore(stopwatch)

  return { elapsed, start, stop, reset, stopwatch }
}
