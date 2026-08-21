'use client'

import { useEffect, useReducer, useRef, useState } from 'react'
import { createMockClock, Stopwatch, type MockClock } from '@watchstop/core'

type ConceptId =
  | 'elapsed'
  | 'accumulated'
  | 'open'
  | 'idle'
  | 'startTime'
  | 'now'
  | 'start'
  | 'stop'
  | 'openFormula'

type EdgeId =
  | 'equalsAccumulated'
  | 'includesOpen'
  | 'excludesIdle'
  | 'openIs'
  | 'startTimeFromNow'
  | 'startSets'
  | 'stopUnsets'
  | 'stopFolds'

type PracticeStep =
  | {
      action: 'start'
      prompt: string
      concepts: ConceptId[]
      edges: EdgeId[]
    }
  | {
      action: 'stop'
      prompt: string
      concepts: ConceptId[]
      edges: EdgeId[]
    }
  | {
      action: 'advance'
      ms: number
      prompt: string
      concepts: ConceptId[]
      edges: EdgeId[]
    }

const practiceSteps: PracticeStep[] = [
  {
    action: 'start',
    prompt: 'start sets the clock reading at Start from clock.now()',
    concepts: ['start', 'startTime', 'now'],
    edges: ['startSets', 'startTimeFromNow'],
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'time shown includes since you pressed Start when running',
    concepts: ['elapsed', 'open', 'openFormula', 'startTime', 'now'],
    edges: ['includesOpen', 'openIs'],
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'since you pressed Start is clock now minus start reading',
    concepts: ['open', 'openFormula', 'startTime', 'now', 'elapsed'],
    edges: ['openIs', 'includesOpen'],
  },
  {
    action: 'stop',
    prompt: 'stop folds the open run into banked time and unsets startTime',
    concepts: ['stop', 'open', 'accumulated', 'startTime'],
    edges: ['stopFolds', 'stopUnsets'],
  },
  {
    action: 'advance',
    ms: 100,
    prompt: 'time shown equals banked time when stopped — paused time is excluded',
    concepts: ['elapsed', 'accumulated', 'idle', 'now'],
    edges: ['equalsAccumulated', 'excludesIdle'],
  },
  {
    action: 'start',
    prompt: 'start sets a new clock reading at Start — banked time stays',
    concepts: ['start', 'startTime', 'now', 'accumulated'],
    edges: ['startSets', 'startTimeFromNow'],
  },
  {
    action: 'advance',
    ms: 50,
    prompt: 'time shown includes the open run again — bars still show paused time on the left',
    concepts: ['elapsed', 'open', 'openFormula', 'idle'],
    edges: ['includesOpen', 'openIs', 'excludesIdle'],
  },
]

const donePrompt =
  'time shown excludes paused time — counting the wall clock still holds the pause'

const doneConcepts: ConceptId[] = ['elapsed', 'accumulated', 'open', 'idle']
const doneEdges: EdgeId[] = ['equalsAccumulated', 'includesOpen', 'excludesIdle']

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

type MapNode = {
  id: ConceptId
  x: number
  y: number
  width: number
  height: number
  plain: string
  api: string
  value: string
}

type MapEdge = {
  id: EdgeId
  from: ConceptId
  to: ConceptId
  phrase: string
  labelX: number
  labelY: number
  path?: string
}

const mapNodesLayout: Omit<MapNode, 'value'>[] = [
  {
    id: 'elapsed',
    x: 235,
    y: 8,
    width: 170,
    height: 58,
    plain: 'time shown',
    api: 'elapsed',
  },
  {
    id: 'accumulated',
    x: 8,
    y: 120,
    width: 170,
    height: 58,
    plain: 'banked from earlier runs',
    api: 'accumulated',
  },
  {
    id: 'open',
    x: 235,
    y: 120,
    width: 170,
    height: 58,
    plain: 'since you pressed Start',
    api: 'open segment',
  },
  {
    id: 'idle',
    x: 462,
    y: 120,
    width: 170,
    height: 58,
    plain: 'paused time, not counted',
    api: 'idle',
  },
  {
    id: 'openFormula',
    x: 210,
    y: 230,
    width: 220,
    height: 58,
    plain: 'clock now minus start reading',
    api: 'now − startTime',
  },
  {
    id: 'startTime',
    x: 100,
    y: 340,
    width: 170,
    height: 58,
    plain: 'clock reading at Start',
    api: 'startTime',
  },
  {
    id: 'now',
    x: 370,
    y: 340,
    width: 170,
    height: 58,
    plain: 'wall clock, always moving',
    api: 'clock.now()',
  },
  {
    id: 'start',
    x: 130,
    y: 440,
    width: 110,
    height: 40,
    plain: 'start',
    api: '',
  },
  {
    id: 'stop',
    x: 24,
    y: 230,
    width: 110,
    height: 40,
    plain: 'stop',
    api: '',
  },
]

const mapEdges: MapEdge[] = [
  {
    id: 'equalsAccumulated',
    from: 'elapsed',
    to: 'accumulated',
    phrase: 'equals when stopped',
    labelX: 140,
    labelY: 90,
  },
  {
    id: 'includesOpen',
    from: 'elapsed',
    to: 'open',
    phrase: 'includes when running',
    labelX: 320,
    labelY: 90,
  },
  {
    id: 'excludesIdle',
    from: 'elapsed',
    to: 'idle',
    phrase: 'excludes',
    labelX: 500,
    labelY: 90,
  },
  {
    id: 'openIs',
    from: 'open',
    to: 'openFormula',
    phrase: 'is',
    labelX: 320,
    labelY: 200,
  },
  {
    id: 'startTimeFromNow',
    from: 'startTime',
    to: 'now',
    phrase: 'is copied from',
    labelX: 320,
    labelY: 330,
  },
  {
    id: 'startSets',
    from: 'start',
    to: 'startTime',
    phrase: 'sets',
    labelX: 185,
    labelY: 420,
  },
  {
    id: 'stopUnsets',
    from: 'stop',
    to: 'startTime',
    phrase: 'unsets',
    labelX: 100,
    labelY: 310,
    path: 'M 79 270 C 79 300, 120 330, 185 340',
  },
  {
    id: 'stopFolds',
    from: 'stop',
    to: 'accumulated',
    phrase: 'folds open segment into',
    labelX: 90,
    labelY: 200,
    path: 'M 79 230 L 93 178',
  },
]

function nodeCenter(node: Omit<MapNode, 'value'>): { x: number; y: number } {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 }
}

function edgePath(
  from: Omit<MapNode, 'value'>,
  to: Omit<MapNode, 'value'>,
): string {
  const a = nodeCenter(from)
  const b = nodeCenter(to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.abs(dy) < 12) {
    const startX = dx > 0 ? from.x + from.width : from.x
    const endX = dx > 0 ? to.x : to.x + to.width
    return `M ${startX} ${a.y} L ${endX} ${b.y}`
  }
  const startY = dy > 0 ? from.y + from.height : from.y
  const endY = dy > 0 ? to.y : to.y + to.height
  const midY = (startY + endY) / 2
  if (Math.abs(dx) < 8) {
    return `M ${a.x} ${startY} L ${b.x} ${endY}`
  }
  return `M ${a.x} ${startY} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${endY}`
}

function ConceptMap({
  snapshot,
  activeConcepts,
  activeEdges,
}: {
  snapshot: Snapshot
  activeConcepts: ConceptId[]
  activeEdges: EdgeId[]
}) {
  const values: Record<ConceptId, string> = {
    elapsed: String(snapshot.elapsed),
    accumulated: String(snapshot.accumulated),
    open: String(snapshot.open),
    idle: String(snapshot.idle),
    startTime: formatUnset(snapshot.startTime),
    now: String(snapshot.now),
    start: '',
    stop: '',
    openFormula: snapshot.running
      ? `${snapshot.now} − ${formatUnset(snapshot.startTime)}`
      : '—',
  }

  const layoutById = new Map(mapNodesLayout.map((node) => [node.id, node]))

  return (
    <figure className="rounded-xl border border-fd-border bg-fd-card/40 p-3 sm:p-4">
      <figcaption className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-fd-muted-foreground">
        Concept map
      </figcaption>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 640 500"
          className="mx-auto h-auto w-full min-w-[320px] max-w-[640px]"
          role="img"
          aria-label="Concept map: time shown equals banked time when stopped, plus the open run when running, and excludes paused time"
        >
          <defs>
            <marker
              id="elapsed-map-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-fd-muted-foreground" />
            </marker>
            <marker
              id="elapsed-map-arrow-active"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-fd-primary" />
            </marker>
          </defs>
          {mapEdges.map((edge) => {
            const from = layoutById.get(edge.from)
            const to = layoutById.get(edge.to)
            if (from === undefined || to === undefined) {
              return null
            }
            const active = activeEdges.includes(edge.id)
            const d = edge.path ?? edgePath(from, to)
            const labelWidth = Math.max(64, edge.phrase.length * 6.2)
            return (
              <g key={edge.id}>
                <path
                  d={d}
                  fill="none"
                  className={
                    active
                      ? 'stroke-fd-primary'
                      : 'stroke-fd-muted-foreground/55'
                  }
                  strokeWidth={active ? 2.25 : 1.5}
                  markerEnd={
                    active
                      ? 'url(#elapsed-map-arrow-active)'
                      : 'url(#elapsed-map-arrow)'
                  }
                />
                <rect
                  x={edge.labelX - labelWidth / 2}
                  y={edge.labelY - 11}
                  width={labelWidth}
                  height={18}
                  rx={4}
                  className="fill-fd-background"
                />
                <text
                  x={edge.labelX}
                  y={edge.labelY + 2}
                  textAnchor="middle"
                  className={
                    active
                      ? 'fill-fd-foreground text-[10px] font-medium'
                      : 'fill-fd-muted-foreground text-[10px]'
                  }
                >
                  {edge.phrase}
                </text>
              </g>
            )
          })}
          {mapNodesLayout.map((node) => {
            const active = activeConcepts.includes(node.id)
            const value = values[node.id]
            const isOperator = node.id === 'start' || node.id === 'stop'
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={8}
                  className={
                    active
                      ? 'fill-fd-primary/15 stroke-fd-primary'
                      : 'fill-fd-background stroke-fd-border'
                  }
                  strokeWidth={active ? 2 : 1}
                />
                {isOperator ? (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 4}
                    textAnchor="middle"
                    className="fill-fd-foreground text-[12px] font-semibold"
                  >
                    {node.plain}
                  </text>
                ) : (
                  <>
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + 16}
                      textAnchor="middle"
                      className="fill-fd-foreground text-[11px] font-semibold"
                    >
                      {node.plain}
                    </text>
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + 32}
                      textAnchor="middle"
                      className="fill-fd-muted-foreground font-mono text-[9px]"
                    >
                      {node.api}
                    </text>
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + 48}
                      textAnchor="middle"
                      className="fill-fd-foreground font-mono text-[11px] font-semibold tabular-nums"
                    >
                      {value}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
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
  const activeConcepts = atEnd
    ? doneConcepts
    : currentStep === undefined
      ? []
      : currentStep.concepts
  const activeEdges = atEnd
    ? doneEdges
    : currentStep === undefined
      ? []
      : currentStep.edges

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
        <p className="text-sm text-fd-foreground">{status}</p>
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
      <ConceptMap
        snapshot={snapshot}
        activeConcepts={activeConcepts}
        activeEdges={activeEdges}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SegmentBar
          label="Counting wall clock (wrong)"
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
              label: 'paused',
              value: snapshot.idle,
              tone: 'idle',
            },
          ]}
        />
        <SegmentBar
          label="Watchstop (pause not counted)"
          axis={axis}
          segments={[
            {
              key: 'accumulated',
              label: 'banked',
              value: snapshot.accumulated,
              tone: 'counted',
            },
            {
              key: 'open',
              label: 'since Start',
              value: snapshot.open,
              tone: 'open',
            },
          ]}
        />
      </div>
    </div>
  )
}
