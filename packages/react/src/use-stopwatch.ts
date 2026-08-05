import { useEffect, useRef, useState } from 'react'
import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
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
}

type StopwatchControls = Pick<StopwatchBinding, 'start' | 'stop' | 'reset'>

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const clock = options?.clock
  const precisionMs = options?.precisionMs
  const ownedStopwatch = useRef<Stopwatch | null>(null)
  const stopwatch = (ownedStopwatch.current ??= new Stopwatch(clock, {
    precisionMs,
  }))
  const [, republishStopwatch] = useState(0)
  const [running, setRunning] = useState(stopwatch.running)

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
      ownedStopwatch.current = new Stopwatch(clock, { precisionMs })
      republishStopwatch((generation) => generation + 1)
    }
    return (): void => {
      ownedStopwatch.current?.destroy()
      ownedStopwatch.current = null
    }
  }, [clock, precisionMs])

  useEffect(() => {
    setRunning(stopwatch.running)
    return stopwatch.subscribe(() => {
      setRunning(stopwatch.running)
    })
  }, [stopwatch])

  const elapsed = useStore(stopwatch)

  return { elapsed, running, start, stop, reset, stopwatch }
}
