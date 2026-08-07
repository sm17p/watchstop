'use client'

import { useEffect } from 'react'
import { useStopwatch } from '@watchstop/react'
import { sessionStopwatch } from '@/components/session-stopwatch-store'
import { formatClockParts } from '@/components/watch-skins/format-elapsed'

export function SessionStopwatch() {
  const { elapsed, running, start, stop, reset } = useStopwatch({
    stopwatch: sessionStopwatch,
  })

  useEffect(() => {
    start()
  }, [start])

  const parts = formatClockParts(elapsed)

  const toggleRun = () => {
    if (running) {
      stop()
      return
    }
    start()
  }

  return (
    <div className="pointer-events-auto fixed end-3 top-3 z-50 flex items-center gap-2 rounded-lg border border-fd-border bg-fd-background/95 px-2.5 py-2 text-sm text-fd-foreground shadow-sm backdrop-blur-sm">
      <span className="font-mono text-base tabular-nums tracking-tight">
        {parts.minutes}:{parts.seconds}
        <span className="text-fd-muted-foreground">.{parts.centiseconds}</span>
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
        onClick={reset}
      >
        Reset
      </button>
    </div>
  )
}
