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
    <div className="flex items-center gap-2 text-sm text-fd-foreground">
      <span className="font-mono text-base tabular-nums tracking-tight">
        {parts.minutes}:{parts.seconds}
        <span className="text-fd-muted-foreground">.{parts.centiseconds}</span>
      </span>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-medium hover:bg-fd-accent"
        onClick={toggleRun}
      >
        {running ? 'Stop' : 'Start'}
      </button>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-medium hover:bg-fd-accent"
        onClick={reset}
      >
        Reset
      </button>
    </div>
  )
}
