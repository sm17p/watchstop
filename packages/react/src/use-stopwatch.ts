import { useEffect, useRef, useState } from 'react'
import { Stopwatch } from '@watchstop/core'
import type { Clock } from '@watchstop/core'
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
  elapsed: number
  running: boolean
  start: () => void
  stop: () => void
  reset: () => void
  stopwatch: Stopwatch
}

type StopwatchControls = Pick<StopwatchBinding, 'start' | 'stop' | 'reset'>

function readBorrowedStopwatch(
  options: UseStopwatchOptions | undefined,
): Stopwatch | undefined {
  if (options === undefined) {
    return undefined
  }
  if (options.stopwatch === undefined) {
    return undefined
  }
  return options.stopwatch
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const borrowedStopwatch = readBorrowedStopwatch(options)
  const clock = borrowedStopwatch === undefined ? options?.clock : undefined
  const precisionMs =
    borrowedStopwatch === undefined ? options?.precisionMs : undefined
  const ownedStopwatch = useRef<Stopwatch | null>(null)
  if (borrowedStopwatch === undefined && ownedStopwatch.current === null) {
    ownedStopwatch.current = new Stopwatch(clock, { precisionMs })
  }
  const stopwatch = borrowedStopwatch ?? ownedStopwatch.current
  if (stopwatch === null) {
    throw new Error('@watchstop/react: Stopwatch could not be created')
  }
  const stopwatchRef = useRef(stopwatch)
  stopwatchRef.current = stopwatch
  const [, republishStopwatch] = useState(0)
  const [running, setRunning] = useState(stopwatch.running)

  const controls = useRef<StopwatchControls | null>(null)
  const { start, stop, reset } = (controls.current ??= {
    start: (): void => {
      stopwatchRef.current.start()
    },
    stop: (): void => {
      stopwatchRef.current.stop()
    },
    reset: (): void => {
      stopwatchRef.current.reset()
    },
  })

  useEffect(() => {
    if (borrowedStopwatch !== undefined) {
      return
    }
    if (ownedStopwatch.current === null) {
      ownedStopwatch.current = new Stopwatch(clock, { precisionMs })
      republishStopwatch((generation) => generation + 1)
    }
    return (): void => {
      ownedStopwatch.current?.destroy()
      ownedStopwatch.current = null
    }
  }, [borrowedStopwatch, clock, precisionMs])

  useEffect(() => {
    setRunning(stopwatch.running)
    return stopwatch.subscribe(() => {
      setRunning(stopwatch.running)
    })
  }, [stopwatch])

  const elapsed = useStore(stopwatch)

  return { elapsed, running, start, stop, reset, stopwatch }
}
