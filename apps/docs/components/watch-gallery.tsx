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
      className="grid w-full gap-3 md:grid-cols-2"
    >
      <div className="md:col-span-2">
        <ChronographSkin elapsed={elapsed} running={running} />
      </div>
      <TerminalSkin elapsed={elapsed} running={running} />
      <SplitFlapSkin elapsed={elapsed} running={running} />
    </section>
  )
}
