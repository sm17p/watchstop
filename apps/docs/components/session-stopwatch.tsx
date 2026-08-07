'use client'

import { useEffect, useState } from 'react'
import { Stopwatch } from '@watchstop/core'

const sessionStopwatch = new Stopwatch(undefined, { precisionMs: 100 })

export function SessionStopwatch() {
  const [elapsed, setElapsed] = useState(() => sessionStopwatch.get())
  const [running, setRunning] = useState(() => sessionStopwatch.running)

  useEffect(() => {
    sessionStopwatch.start()
    setElapsed(sessionStopwatch.get())
    setRunning(sessionStopwatch.running)
    return sessionStopwatch.subscribe(() => {
      setElapsed(sessionStopwatch.get())
      setRunning(sessionStopwatch.running)
    })
  }, [])

  const toggleRun = () => {
    if (sessionStopwatch.running) {
      sessionStopwatch.stop()
      return
    }
    sessionStopwatch.start()
  }

  return (
    <div className="pointer-events-auto fixed end-3 top-3 z-50 flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background/95 px-2.5 py-2 text-sm text-fd-foreground shadow-sm backdrop-blur-sm">
      <span className="font-mono text-base tabular-nums tracking-tight">
        {Math.floor(elapsed)}
        <span className="ms-1 text-xs text-fd-muted-foreground">ms</span>
      </span>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-xs font-medium hover:bg-fd-accent"
        onClick={toggleRun}
      >
        {running ? 'Stop' : 'Start'}
      </button>
      <button
        type="button"
        className="rounded-md px-2 py-1 text-xs font-medium hover:bg-fd-accent"
        onClick={() => {
          sessionStopwatch.reset()
        }}
      >
        Reset
      </button>
    </div>
  )
}
