'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { createMockClock, Stopwatch, type MockClock } from '@watchstop/core'

type PracticeStep =
  | { action: 'start'; prompt: string }
  | { action: 'stop'; prompt: string }
  | { action: 'advance'; ms: number; prompt: string }

const practiceSteps: PracticeStep[] = [
  {
    action: 'start',
    prompt: 'Start sets startTime. Elapsed stays 0 until the clock moves.',
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'The open segment is 100. Naive matches Watchstop.',
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'Elapsed is 200. Still no idle.',
  },
  {
    action: 'stop',
    prompt: 'Stop folds the open segment into accumulated. startTime is unset.',
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'The clock moves while stopped. Naive is 300, elapsed stays 200. Idle appears.',
  },
  {
    action: 'start',
    prompt: 'A new startTime. Accumulated stays 200.',
  },
  {
    action: 'advance',
    ms: 50,
    prompt: 'Elapsed is 250, naive is 350. The pause is why they differ.',
  },
]

const donePrompt =
  'Elapsed is 250. Naive is 350 because the pause still sits in wall-clock.'

const holdMs = 3200
const tickMs = 50
const advanceChunk = 5

const controlClassName =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-xs font-medium hover:bg-fd-accent disabled:pointer-events-none disabled:opacity-40'

type Demo = {
  clock: MockClock
  stopwatch: Stopwatch
  firstStart: number | undefined
  segmentStart: number | undefined
}

type Snapshot = {
  now: number
  running: boolean
  startTime: number | undefined
  accumulated: number
  elapsed: number
  naive: number
  open: number
  idle: number
}

const idleSnapshot: Snapshot = {
  now: 0,
  running: false,
  startTime: undefined,
  accumulated: 0,
  elapsed: 0,
  naive: 0,
  open: 0,
  idle: 0,
}

function readSnapshot(demo: Demo): Snapshot {
  const now = demo.clock.now()
  const elapsed = demo.stopwatch.get()
  const running = demo.stopwatch.running
  const startTime = running ? demo.segmentStart : undefined
  const open = running && startTime !== undefined ? now - startTime : 0
  const accumulated = running ? Math.max(0, elapsed - open) : elapsed
  const naive = demo.firstStart === undefined ? 0 : now - demo.firstStart
  const idle = Math.max(0, naive - elapsed)
  return {
    now,
    running,
    startTime,
    accumulated,
    elapsed,
    naive,
    open,
    idle,
  }
}

function formatUnset(value: number | undefined): string {
  if (value === undefined) {
    return 'unset'
  }
  return String(value)
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function applyStart(demo: Demo): void {
  demo.stopwatch.start()
  const now = demo.clock.now()
  if (demo.firstStart === undefined) {
    demo.firstStart = now
  }
  demo.segmentStart = now
}

function applyStop(demo: Demo): void {
  demo.stopwatch.stop()
  demo.segmentStart = undefined
}

function resetDemo(demo: Demo): void {
  demo.stopwatch.reset()
  demo.firstStart = undefined
  demo.segmentStart = undefined
}

function applyStep(demo: Demo, step: PracticeStep): void {
  if (step.action === 'start') {
    applyStart(demo)
    return
  }
  if (step.action === 'stop') {
    applyStop(demo)
    return
  }
  demo.clock.advance(step.ms)
}

function seekApplied(demo: Demo, applied: number): void {
  resetDemo(demo)
  for (const step of practiceSteps.slice(0, applied)) {
    applyStep(demo, step)
  }
}

type BarSegment = {
  key: string
  label: string
  value: number
  tone: 'counted' | 'open' | 'idle'
}

function SegmentBar({
  label,
  axis,
  segments,
}: {
  label: string
  axis: number
  segments: BarSegment[]
}) {
  return (
    <figure className="rounded-xl border border-fd-border bg-fd-card/40 p-4">
      <figcaption className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-fd-muted-foreground">
        {label}
      </figcaption>
      <div className="flex h-12 overflow-hidden rounded-md text-[10px] font-semibold">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => {
            const grow = segment.value / axis
            const toneClassName =
              segment.tone === 'idle'
                ? 'bg-fd-muted-foreground/25 text-fd-muted-foreground'
                : segment.tone === 'open'
                  ? 'bg-fd-primary/30 text-fd-foreground'
                  : 'bg-fd-primary/15 text-fd-foreground'
            return (
              <div
                key={segment.key}
                className={`flex items-center justify-center motion-reduce:transition-none transition-[flex-grow] ${toneClassName}`}
                style={{ flexGrow: grow, flexBasis: 0 }}
              >
                {segment.label}
              </div>
            )
          })}
      </div>
    </figure>
  )
}

export function ElapsedMath() {
  const demoRef = useRef<Demo | undefined>(undefined)
  const playIdRef = useRef(0)
  const pausedRef = useRef(false)
  const seekingRef = useRef(false)
  const [applied, setApplied] = useState(0)
  const [paused, setPaused] = useState(false)
  const [, bump] = useReducer((generation: number) => generation + 1, 0)

  useEffect(() => {
    const clock = createMockClock()
    const stopwatch = new Stopwatch(clock)
    demoRef.current = {
      clock,
      stopwatch,
      firstStart: undefined,
      segmentStart: undefined,
    }
    bump()
    return () => {
      playIdRef.current += 1
      stopwatch.destroy()
      demoRef.current = undefined
    }
  }, [])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    const demo = demoRef.current
    if (demo === undefined || paused || applied >= practiceSteps.length) {
      return
    }

    const playId = playIdRef.current + 1
    playIdRef.current = playId
    let committed = false
    const stillCurrent = () =>
      playIdRef.current === playId && !pausedRef.current

    const run = async () => {
      const step = practiceSteps[applied]
      if (step === undefined) {
        return
      }
      seekApplied(demo, applied)
      bump()
      const reduced = prefersReducedMotion()
      if (step.action === 'advance' && !reduced) {
        let remaining = step.ms
        while (remaining > 0) {
          if (!stillCurrent()) {
            return
          }
          const chunk = Math.min(advanceChunk, remaining)
          demo.clock.advance(chunk)
          remaining -= chunk
          bump()
          await wait(tickMs)
        }
      } else {
        applyStep(demo, step)
        bump()
      }
      committed = true
      if (!stillCurrent()) {
        return
      }
      if (!reduced) {
        await wait(holdMs)
      }
      if (!stillCurrent()) {
        return
      }
      setApplied(applied + 1)
    }

    void run()
    return () => {
      playIdRef.current += 1
      if (seekingRef.current) {
        return
      }
      if (committed && pausedRef.current) {
        setApplied((currentApplied) =>
          currentApplied === applied ? applied + 1 : currentApplied,
        )
        return
      }
      if (!committed) {
        seekApplied(demo, applied)
        bump()
      }
    }
  }, [applied, paused])

  const demo = demoRef.current
  const snapshot = demo === undefined ? idleSnapshot : readSnapshot(demo)
  const axis = Math.max(snapshot.naive, snapshot.elapsed, snapshot.now, 1)
  const atEnd = applied >= practiceSteps.length
  const currentStep = atEnd ? undefined : practiceSteps[applied]
  const status = atEnd
    ? donePrompt
    : currentStep === undefined
      ? ''
      : currentStep.prompt

  const jumpTo = (nextApplied: number) => {
    const current = demoRef.current
    if (current === undefined) {
      return
    }
    const clamped = Math.min(practiceSteps.length, Math.max(0, nextApplied))
    seekingRef.current = true
    playIdRef.current += 1
    seekApplied(current, clamped)
    setApplied(clamped)
    bump()
    seekingRef.current = false
  }

  const togglePaused = () => {
    if (atEnd) {
      jumpTo(0)
      setPaused(false)
      return
    }
    setPaused((currentPaused) => !currentPaused)
  }

  return (
    <div className="not-prose my-6 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-fd-muted-foreground">
          {atEnd ? 'End' : `Step ${applied + 1} / ${practiceSteps.length}`}
        </p>
        <p className="text-sm text-fd-muted-foreground">{status}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={controlClassName}
            disabled={applied === 0}
            onClick={() => {
              jumpTo(applied - 1)
            }}
          >
            Back
          </button>
          <button type="button" className={controlClassName} onClick={togglePaused}>
            {atEnd || paused ? 'Play' : 'Pause'}
          </button>
          <button
            type="button"
            className={controlClassName}
            disabled={atEnd}
            onClick={() => {
              jumpTo(applied + 1)
            }}
          >
            Next
          </button>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 font-mono text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">now</dt>
          <dd className="mt-1 font-semibold tabular-nums">{snapshot.now}</dd>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">running</dt>
          <dd className="mt-1 font-semibold">{String(snapshot.running)}</dd>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">startTime</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {formatUnset(snapshot.startTime)}
          </dd>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">accumulated</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {snapshot.accumulated}
          </dd>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">elapsed</dt>
          <dd className="mt-1 font-semibold tabular-nums">{snapshot.elapsed}</dd>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-card/40 p-3">
          <dt className="text-fd-muted-foreground">naive</dt>
          <dd className="mt-1 font-semibold tabular-nums">{snapshot.naive}</dd>
        </div>
      </dl>
      <div className="grid gap-4 md:grid-cols-2">
        <SegmentBar
          label="Naive now − firstStart"
          axis={axis}
          segments={[
            {
              key: 'counted',
              label: 'counted',
              value: snapshot.elapsed,
              tone: 'counted',
            },
            {
              key: 'idle',
              label: 'idle',
              value: snapshot.idle,
              tone: 'idle',
            },
          ]}
        />
        <SegmentBar
          label="Watchstop elapsed"
          axis={axis}
          segments={[
            {
              key: 'accumulated',
              label: 'accumulated',
              value: snapshot.accumulated,
              tone: 'counted',
            },
            {
              key: 'open',
              label: 'now − startTime',
              value: snapshot.open,
              tone: 'open',
            },
          ]}
        />
      </div>
    </div>
  )
}
