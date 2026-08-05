import { createBrowserClock, Stopwatch } from '@watchstop/core'
import {
  wrapCountingClock,
  type CountingClock,
} from './counting-clock.js'
import { percentile } from './percentile.js'
import type {
  BenchMetrics,
  BenchMode,
  BenchRunOptions,
  VisibilitySample,
  WatchstopBench,
} from './bench-types.js'

function sumCounts(clocks: CountingClock[]): {
  schedule: number
  cancel: number
  now: number
} {
  let schedule = 0
  let cancel = 0
  let now = 0
  for (const clock of clocks) {
    schedule += clock.counts.schedule
    cancel += clock.counts.cancel
    now += clock.counts.now
  }
  return { schedule, cancel, now }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function createLongtaskTracker(): {
  counts: { count: number; durationMs: number }
  disconnect(): void
} {
  const counts = {
    count: 0,
    durationMs: 0,
  }

  if (typeof PerformanceObserver !== 'function') {
    return {
      counts,
      disconnect() {},
    }
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType !== 'longtask') {
        continue
      }
      counts.count += 1
      counts.durationMs += entry.duration
    }
  })

  try {
    observer.observe({ type: 'longtask', buffered: true })
  } catch {
    return {
      counts,
      disconnect() {},
    }
  }

  return {
    counts,
    disconnect() {
      observer.disconnect()
    },
  }
}

function createFrameTracker(): {
  deltas: number[]
  stop(): void
} {
  const deltas: number[] = []
  let previous = performance.now()
  let handle = 0
  let active = true

  const tick = (now: number) => {
    if (!active) {
      return
    }
    deltas.push(now - previous)
    previous = now
    handle = window.requestAnimationFrame(tick)
  }

  handle = window.requestAnimationFrame(tick)

  return {
    deltas,
    stop() {
      active = false
      window.cancelAnimationFrame(handle)
    },
  }
}

function createVisibilityTracker(): {
  samples: VisibilitySample[]
  stop(): void
} {
  const startedAt = performance.now()
  const samples: VisibilitySample[] = [
    {
      atMs: 0,
      state: document.visibilityState,
    },
  ]

  const timer = window.setInterval(() => {
    samples.push({
      atMs: performance.now() - startedAt,
      state: document.visibilityState,
    })
  }, 100)

  return {
    samples,
    stop() {
      window.clearInterval(timer)
      samples.push({
        atMs: performance.now() - startedAt,
        state: document.visibilityState,
      })
    },
  }
}

function buildShared(n: number): {
  clocks: CountingClock[]
  watches: Stopwatch[]
} {
  const clock = wrapCountingClock(createBrowserClock())
  const watches = Array.from({ length: n }, () => new Stopwatch(clock))
  return {
    clocks: [clock],
    watches,
  }
}

function buildPerInstance(n: number): {
  clocks: CountingClock[]
  watches: Stopwatch[]
} {
  const rows = Array.from({ length: n }, () => {
    const clock = wrapCountingClock(createBrowserClock())
    return {
      clock,
      watch: new Stopwatch(clock),
    }
  })
  return {
    clocks: rows.map((row) => row.clock),
    watches: rows.map((row) => row.watch),
  }
}

function buildSession(n: number, mode: BenchMode) {
  if (mode === 'shared') {
    return buildShared(n)
  }
  return buildPerInstance(n)
}

export function createBenchApi(
  publish: (api: WatchstopBench) => void,
): WatchstopBench {
  let phase: WatchstopBench['phase'] = 'idle'
  let result: BenchMetrics | null = null
  let runToken = 0
  let liveClocks: CountingClock[] | null = null
  let liveListeners = 0

  const api: WatchstopBench = {
    get phase() {
      return phase
    },
    get result() {
      return result
    },
    get live() {
      if (phase !== 'running' || liveClocks === null) {
        return null
      }
      const totals = sumCounts(liveClocks)
      return {
        schedules: totals.schedule,
        cancels: totals.cancel,
        now: totals.now,
        listeners: liveListeners,
        visibilityState: document.visibilityState,
      }
    },
    async run(options: BenchRunOptions): Promise<BenchMetrics> {
      if (phase === 'running') {
        throw new Error('Bench already running')
      }
      if (!Number.isInteger(options.n) || options.n < 1) {
        throw new RangeError('n must be an integer >= 1')
      }
      if (!Number.isFinite(options.ms) || options.ms < 1) {
        throw new RangeError('ms must be a finite number >= 1')
      }
      if (options.mode !== 'shared' && options.mode !== 'per-instance') {
        throw new RangeError('mode must be shared or per-instance')
      }

      const token = ++runToken
      phase = 'running'
      result = null
      liveClocks = null
      liveListeners = 0
      publish(api)

      const longtasks = createLongtaskTracker()
      const frames = createFrameTracker()
      const visibility = createVisibilityTracker()
      const session = buildSession(options.n, options.mode)
      liveClocks = session.clocks
      liveListeners = 0

      for (const watch of session.watches) {
        watch.subscribe(() => {
          liveListeners += 1
        })
      }

      for (const clock of session.clocks) {
        clock.resetCounts()
      }
      liveListeners = 0

      const visibilityStateAtStart = document.visibilityState
      const wallStartedAt = performance.now()

      for (const watch of session.watches) {
        watch.start()
      }

      await wait(options.ms)

      if (token !== runToken) {
        liveClocks = null
        throw new Error('Bench run superseded')
      }

      for (const watch of session.watches) {
        watch.destroy()
      }

      const wallMs = performance.now() - wallStartedAt
      const visibilityStateAtEnd = document.visibilityState

      frames.stop()
      visibility.stop()
      longtasks.disconnect()

      const totals = sumCounts(session.clocks)
      const metrics: BenchMetrics = {
        n: options.n,
        mode: options.mode,
        windowMs: options.ms,
        schedules: totals.schedule,
        cancels: totals.cancel,
        now: totals.now,
        listeners: liveListeners,
        longtaskCount: longtasks.counts.count,
        longtaskDurationMs: longtasks.counts.durationMs,
        frameP50Ms: percentile(frames.deltas, 50),
        frameP95Ms: percentile(frames.deltas, 95),
        visibilitySamples: visibility.samples,
        wallMs,
        visibilityStateAtStart,
        visibilityStateAtEnd,
      }

      liveClocks = null
      phase = 'done'
      result = metrics
      publish(api)
      return metrics
    },
  }

  publish(api)
  return api
}
