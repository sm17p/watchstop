import { useEffect, useRef, useState } from 'react'
import { Stopwatch } from '@watchstop/core'
import type { Clock, Store } from '@watchstop/core'
import { useStore } from './use-store.js'

export type UseStopwatchOptions = {
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
}

type StopwatchControls = Pick<StopwatchBinding, 'start' | 'stop' | 'reset'>

type ElapsedBridgeCache = {
  stopwatch: Stopwatch
  reactiveElapsed: boolean
  store: Store<number>
}

export function useStopwatch(options?: UseStopwatchOptions): StopwatchBinding {
  const clock = options?.clock
  const precisionMs = options?.precisionMs
  const reactiveElapsed = options?.reactiveElapsed !== false
  const ownedStopwatch = useRef<Stopwatch | null>(null)
  const stopwatch = (ownedStopwatch.current ??= new Stopwatch(clock, {
    precisionMs,
  }))
  const [, republishStopwatch] = useState(0)
  const [running, setRunning] = useState(stopwatch.running)
  const elapsedBridge = useRef<ElapsedBridgeCache | null>(null)

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
    let previousRunning = stopwatch.running
    return stopwatch.subscribe(() => {
      const nextRunning = stopwatch.running
      if (previousRunning === nextRunning) {
        return
      }
      previousRunning = nextRunning
      setRunning(nextRunning)
    })
  }, [stopwatch])

  const cachedBridge = elapsedBridge.current
  if (
    cachedBridge === null ||
    cachedBridge.stopwatch !== stopwatch ||
    cachedBridge.reactiveElapsed !== reactiveElapsed
  ) {
    elapsedBridge.current = {
      stopwatch,
      reactiveElapsed,
      store: bridgeElapsedStore(stopwatch, reactiveElapsed),
    }
  }

  const activeBridge = elapsedBridge.current
  if (activeBridge === null) {
    throw new Error('@watchstop/react: elapsed bridge missing')
  }

  const elapsed = useStore(activeBridge.store)

  return { elapsed, running, start, stop, reset, stopwatch }
}

function bridgeElapsedStore(
  stopwatch: Stopwatch,
  reactiveElapsed: boolean,
): Store<number> {
  if (reactiveElapsed) {
    return stopwatch
  }

  return {
    get(): number {
      return stopwatch.get()
    },
    subscribe(listener: (value: number) => void): () => void {
      let previousRunning = stopwatch.running
      return stopwatch.subscribe((value) => {
        const nextRunning = stopwatch.running
        const runningChanged = previousRunning !== nextRunning
        previousRunning = nextRunning
        if (runningChanged || !nextRunning) {
          listener(value)
        }
      })
    },
  }
}
