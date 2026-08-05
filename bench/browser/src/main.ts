import { createBenchApi } from './bench-harness.js'
import type { BenchMode, WatchstopBench } from './bench-types.js'
import './styles.css'

declare global {
  interface Window {
    __WATCHSTOP_BENCH__: WatchstopBench
  }
}

const app = document.querySelector('#app')
if (!(app instanceof HTMLElement)) {
  throw new Error('Missing #app')
}

const params = new URLSearchParams(window.location.search)

function readMode(raw: string | null): BenchMode {
  if (raw === 'per-instance') {
    return 'per-instance'
  }
  return 'shared'
}

function readPositiveNumber(raw: string | null, fallback: number): number {
  if (raw === null || raw === '') {
    return fallback
  }
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 1) {
    return fallback
  }
  return value
}

const includeLarge =
  params.get('large') === '1' || params.get('n') === '10000'

const defaultN = Math.trunc(readPositiveNumber(params.get('n'), 100))
const defaultMode = readMode(params.get('mode'))
const defaultMs = Math.trunc(readPositiveNumber(params.get('ms'), 5000))
const autorun = params.get('autorun') === '1'

const brand = document.createElement('p')
brand.className = 'brand'
brand.textContent = 'watchstop'

const title = document.createElement('h1')
title.textContent = 'concurrent stopwatch bench'

const nLabel = document.createElement('label')
nLabel.textContent = 'N'
const nSelect = document.createElement('select')
const nValues = includeLarge ? [1, 100, 1000, 10000] : [1, 100, 1000]
for (const value of nValues) {
  const option = document.createElement('option')
  option.value = String(value)
  option.textContent = String(value)
  nSelect.append(option)
}
if (!nValues.includes(defaultN)) {
  const option = document.createElement('option')
  option.value = String(defaultN)
  option.textContent = String(defaultN)
  nSelect.append(option)
}
nSelect.value = String(defaultN)
nLabel.append(nSelect)

const modeLabel = document.createElement('label')
modeLabel.textContent = 'Mode'
const modeSelect = document.createElement('select')
const modeOptions: BenchMode[] = ['shared', 'per-instance']
for (const mode of modeOptions) {
  const option = document.createElement('option')
  option.value = mode
  option.textContent = mode
  modeSelect.append(option)
}
modeSelect.value = defaultMode
modeLabel.append(modeSelect)

const msLabel = document.createElement('label')
msLabel.textContent = 'Window ms'
const msInput = document.createElement('input')
msInput.type = 'number'
msInput.min = '1'
msInput.step = '1'
msInput.value = String(defaultMs)
msLabel.append(msInput)

const runButton = document.createElement('button')
runButton.type = 'button'
runButton.textContent = 'Run'

const controls = document.createElement('div')
controls.className = 'controls'
controls.append(nLabel, modeLabel, msLabel, runButton)

const status = document.createElement('p')
status.className = 'status'
status.textContent = 'phase: idle'

const results = document.createElement('pre')
results.id = 'bench-results'
results.textContent = 'No results yet.'

const root = document.createElement('div')
root.className = 'bench'
root.append(brand, title, controls, status, results)
app.append(root)

function paintApi(api: WatchstopBench): void {
  status.textContent = `phase: ${api.phase}`
  runButton.disabled = api.phase === 'running'
  if (api.result === null) {
    if (api.phase === 'idle') {
      results.textContent = 'No results yet.'
    }
    return
  }
  results.textContent = JSON.stringify(api.result, null, 2)
}

const bench = createBenchApi((api) => {
  window.__WATCHSTOP_BENCH__ = api
  paintApi(api)
})

window.__WATCHSTOP_BENCH__ = bench
paintApi(bench)

async function runFromControls(): Promise<void> {
  const n = Math.trunc(Number(nSelect.value))
  const ms = Math.trunc(Number(msInput.value))
  const mode = readMode(modeSelect.value)
  await bench.run({ n, mode, ms })
}

runButton.addEventListener('click', () => {
  void runFromControls().catch((error: unknown) => {
    status.textContent = `phase: error`
    results.textContent =
      error instanceof Error ? error.message : 'Bench run failed'
  })
})

if (autorun) {
  void runFromControls().catch((error: unknown) => {
    status.textContent = `phase: error`
    results.textContent =
      error instanceof Error ? error.message : 'Bench run failed'
  })
}
