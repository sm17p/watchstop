export type BenchMode = 'shared' | 'per-instance'

export type BenchPhase = 'idle' | 'running' | 'done'

export type VisibilitySample = {
  atMs: number
  state: DocumentVisibilityState
}

export type BenchLiveCounters = {
  schedules: number
  cancels: number
  now: number
  listeners: number
  visibilityState: DocumentVisibilityState
}

export type BenchMetrics = {
  n: number
  mode: BenchMode
  windowMs: number
  schedules: number
  cancels: number
  now: number
  listeners: number
  longtaskCount: number
  longtaskDurationMs: number
  frameP50Ms: number
  frameP95Ms: number
  visibilitySamples: VisibilitySample[]
  wallMs: number
  visibilityStateAtStart: DocumentVisibilityState
  visibilityStateAtEnd: DocumentVisibilityState
}

export type BenchRunOptions = {
  n: number
  mode: BenchMode
  ms: number
}

export type WatchstopBench = {
  phase: BenchPhase
  result: BenchMetrics | null
  live: BenchLiveCounters | null
  run(options: BenchRunOptions): Promise<BenchMetrics>
}
