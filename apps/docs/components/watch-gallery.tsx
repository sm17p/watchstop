'use client'

import { useEffect } from 'react'
import { useStopwatch } from '@watchstop/react'
import { sessionStopwatch } from '@/components/session-stopwatch-store'
import { ChronographSkin } from '@/components/watch-skins/chronograph-skin'
import { SplitFlapSkin } from '@/components/watch-skins/split-flap-skin'
import { TerminalSkin } from '@/components/watch-skins/terminal-skin'

export function WatchGallery() {
  const { elapsed, running, start } = useStopwatch({
    stopwatch: sessionStopwatch,
  })

  useEffect(() => {
    start()
  }, [start])

  return (
    <section
      aria-label="Watch gallery"
      className="relative w-full"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.08),transparent_55%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.03))]"
      />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <TerminalSkin elapsed={elapsed} running={running} />
        <ChronographSkin elapsed={elapsed} running={running} />
        <SplitFlapSkin elapsed={elapsed} running={running} />
      </div>
    </section>
  )
}
