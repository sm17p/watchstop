'use client'

import { useEffect } from 'react'
import { useStopwatch } from '@watchstop/react'
import { sessionStopwatch } from '@/components/session-stopwatch-store'
import { ChronographSkin } from '@/components/watch-skins/chronograph-skin'
import { SplitFlapSkin } from '@/components/watch-skins/split-flap-skin'
import { TerminalSkin } from '@/components/watch-skins/terminal-skin'

export function WatchGallery() {
  const { elapsed, running, start, stop, reset } = useStopwatch({
    stopwatch: sessionStopwatch,
  })

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
    <section className="relative w-full max-w-5xl mx-auto px-4 pb-16 pt-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.08),transparent_55%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.03))]"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-left">
          <h2 className="text-xl font-semibold tracking-tight">
            One stopwatch. Three skins.
          </h2>
          <p className="mt-1 max-w-xl text-sm text-fd-muted-foreground">
            The same core session drives every face. Borrow one instance across
            the gallery with the React adapter.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium hover:bg-fd-accent"
            onClick={toggleRun}
          >
            {running ? 'Stop' : 'Start'}
          </button>
          <button
            type="button"
            className="rounded-md border border-fd-border px-3 py-1.5 text-sm font-medium hover:bg-fd-accent"
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <TerminalSkin elapsed={elapsed} running={running} />
        <ChronographSkin elapsed={elapsed} running={running} />
        <SplitFlapSkin elapsed={elapsed} running={running} />
      </div>
    </section>
  )
}
