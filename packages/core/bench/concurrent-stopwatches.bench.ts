import { describe, it } from 'vitest'
import { Stopwatch } from '../src/stopwatch.js'
import {
  createCountingMockClock,
  type CountingMockClock,
} from './counting-clock.js'

type BenchMode = 'shared' | 'per-instance'

type BenchRow = {
  n: number
  mode: BenchMode
  ticks: number
  schedules: number
  cancels: number
  now: number
  listenerInvocations: number
  approxSpreadCost: number
  wallMs: number
}

function resolveNs(): number[] {
  const ns = [1, 100, 1000]
  const large =
    process.env.BENCH_LARGE === '1' || process.env.BENCH_N === '10000'
  if (large) {
    ns.push(10000)
  }
  return ns
}

function resolveTicks(): number {
  const raw = process.env.TICKS
  if (raw === undefined || raw === '') {
    return 300
  }
  const ticks = Number(raw)
  if (!Number.isFinite(ticks) || ticks < 1 || !Number.isInteger(ticks)) {
    throw new RangeError('TICKS must be a finite integer >= 1')
  }
  return ticks
}

function sumCounts(clocks: CountingMockClock[]): {
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

function runShared(n: number, ticks: number): BenchRow {
  const clock = createCountingMockClock()
  const watches = Array.from({ length: n }, () => new Stopwatch(clock))
  let listenerInvocations = 0
  let approxSpreadCost = 0

  for (const watch of watches) {
    watch.subscribe(() => {
      listenerInvocations += 1
      approxSpreadCost += 1
    })
  }

  clock.resetCounts()
  listenerInvocations = 0
  approxSpreadCost = 0

  for (const watch of watches) {
    watch.start()
  }

  const startedAt = performance.now()
  for (let tick = 0; tick < ticks; tick += 1) {
    clock.advance(1)
  }
  const wallMs = performance.now() - startedAt

  for (const watch of watches) {
    watch.destroy()
  }

  return {
    n,
    mode: 'shared',
    ticks,
    schedules: clock.counts.schedule,
    cancels: clock.counts.cancel,
    now: clock.counts.now,
    listenerInvocations,
    approxSpreadCost,
    wallMs,
  }
}

function runPerInstance(n: number, ticks: number): BenchRow {
  const rows = Array.from({ length: n }, () => {
    const clock = createCountingMockClock()
    return {
      clock,
      watch: new Stopwatch(clock),
    }
  })
  let listenerInvocations = 0
  let approxSpreadCost = 0

  for (const row of rows) {
    row.watch.subscribe(() => {
      listenerInvocations += 1
      approxSpreadCost += 1
    })
  }

  for (const row of rows) {
    row.clock.resetCounts()
  }
  listenerInvocations = 0
  approxSpreadCost = 0

  for (const row of rows) {
    row.watch.start()
  }

  const startedAt = performance.now()
  for (let tick = 0; tick < ticks; tick += 1) {
    for (const row of rows) {
      row.clock.advance(1)
    }
  }
  const wallMs = performance.now() - startedAt

  for (const row of rows) {
    row.watch.destroy()
  }

  const totals = sumCounts(rows.map((row) => row.clock))

  return {
    n,
    mode: 'per-instance',
    ticks,
    schedules: totals.schedule,
    cancels: totals.cancel,
    now: totals.now,
    listenerInvocations,
    approxSpreadCost,
    wallMs,
  }
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }
  return value.toFixed(2)
}

function printTable(rows: BenchRow[]): void {
  const headers = [
    'N',
    'mode',
    'ticks',
    'schedules',
    'cancels',
    'now',
    'listeners',
    'spread',
    'wallMs',
  ]
  const cells = rows.map((row) => [
    String(row.n),
    row.mode,
    String(row.ticks),
    String(row.schedules),
    String(row.cancels),
    String(row.now),
    String(row.listenerInvocations),
    String(row.approxSpreadCost),
    formatNumber(row.wallMs),
  ])
  const widths = headers.map((header, index) => {
    let width = header.length
    for (const cellRow of cells) {
      const cell = cellRow[index]
      if (cell !== undefined && cell.length > width) {
        width = cell.length
      }
    }
    return width
  })
  const renderLine = (values: string[]): string =>
    values
      .map((value, index) => value.padStart(widths[index] ?? value.length))
      .join('  ')

  console.log('')
  console.log(renderLine(headers))
  console.log(widths.map((width) => '-'.repeat(width)).join('  '))
  for (const cellRow of cells) {
    console.log(renderLine(cellRow))
  }
  console.log('')
}

describe('concurrent stopwatches MockClock microbench', () => {
  it('prints shared vs per-instance metrics table', () => {
    const ticks = resolveTicks()
    const ns = resolveNs()
    const rows: BenchRow[] = []

    for (const n of ns) {
      rows.push(runShared(n, ticks))
      rows.push(runPerInstance(n, ticks))
    }

    printTable(rows)
  })
})
