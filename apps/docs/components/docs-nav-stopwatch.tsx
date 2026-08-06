'use client'

import { useEffect } from 'react'
import { useStopwatch } from '@watchstop/react'

export function DocsNavStopwatch() {
  const { elapsed, running, start, stop, reset } = useStopwatch()

  useEffect(() => {
    start()
  }, [start])

  const toggleRun = () => {
    if (running) {
      stop()
      return
    }
    start()
  }

  return (
    <div className="flex items-center gap-2 text-sm text-fd-muted-foreground">
      <span className="tabular-nums">{Math.floor(elapsed)} ms</span>
      <button
        type="button"
        className="hover:text-fd-foreground"
        onClick={toggleRun}
      >
        {running ? 'Stop' : 'Start'}
      </button>
      <button
        type="button"
        className="hover:text-fd-foreground"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  )
}
