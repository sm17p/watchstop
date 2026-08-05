import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type BrowserType,
  type CDPSession,
  type Page,
} from '@playwright/test'
import net from 'node:net'
import type {
  BenchMetrics,
  BenchMode,
  BenchPhase,
} from '../src/bench-types.js'

type VisibilityTarget = 'visible' | 'hidden' | 'frozen'

type BenchRow =
  | (BenchMetrics & {
      visibilityTarget: VisibilityTarget
      skipped?: false
    })
  | {
      n: number
      mode: BenchMode
      visibilityTarget: VisibilityTarget
      skipped: true
      skipReason: string
    }

type HiddenCdpSample = {
  tMs: number
  visibilityState: DocumentVisibilityState
  phase: BenchPhase
  schedules: number | null
  listeners: number | null
}

type BackgroundKind = 'hidden' | 'frozen'

type BackgroundHandle = {
  kind: BackgroundKind
  dispose: () => Promise<void>
}

type PageFocusSnapshot = {
  visibilityState: DocumentVisibilityState
  hasFocus: boolean
  windowState: string | null
}

type BackgroundAttempt = {
  strategy: string
  visibilityState: DocumentVisibilityState
  hasFocus: boolean
  windowState: string | null
}

type HeadedBenchSession = {
  browser: Browser
  context: BrowserContext
  channelLabel: string
  noDefaultsConnected: boolean
  browserVersion: string
  dispose: () => Promise<void>
}

type BackgroundResult =
  | {
      ok: true
      handle: BackgroundHandle
      attempts: BackgroundAttempt[]
    }
  | {
      ok: false
      attempts: BackgroundAttempt[]
      message: string
    }

const HIDDEN_SAMPLE_INTERVAL_MS = 250

const STRIPPED_BACKGROUND_ARGS = [
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling',
] as const

function resolveNs(): number[] {
  const ns = [1, 100, 1000]
  const large =
    process.env.BENCH_LARGE === '1' || process.env.BENCH_N === '10000'
  if (large) {
    ns.push(10000)
  }
  return ns
}

function resolveMs(): number {
  const raw = process.env.BENCH_MS
  if (raw === undefined || raw === '') {
    return 5000
  }
  const ms = Number(raw)
  if (!Number.isFinite(ms) || ms < 1 || !Number.isInteger(ms)) {
    throw new RangeError('BENCH_MS must be a finite integer >= 1')
  }
  return ms
}

function resolveHiddenMs(): number {
  const raw = process.env.BENCH_HIDDEN_MS
  if (raw === undefined || raw === '') {
    return 10_000
  }
  const ms = Number(raw)
  if (!Number.isFinite(ms) || ms < 1 || !Number.isInteger(ms)) {
    throw new RangeError('BENCH_HIDDEN_MS must be a finite integer >= 1')
  }
  return ms
}

function resolveBrowserChannel(): string | undefined {
  const raw = process.env.BENCH_BROWSER_CHANNEL
  if (raw === undefined || raw === '') {
    return undefined
  }
  return raw
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value)
  }
  return value.toFixed(2)
}

function printAligned(headers: string[], cells: string[][]): void {
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

function printTable(rows: BenchRow[]): void {
  const headers = [
    'N',
    'mode',
    'vis',
    'schedules',
    'cancels',
    'now',
    'listeners',
    'longtasks',
    'ltMs',
    'p50',
    'p95',
    'wallMs',
    'visStart',
    'visEnd',
  ]
  const cells = rows.map((row) => {
    if (row.skipped) {
      return [
        String(row.n),
        row.mode,
        row.visibilityTarget,
        'skip',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        row.skipReason,
      ]
    }
    return [
      String(row.n),
      row.mode,
      row.visibilityTarget,
      String(row.schedules),
      String(row.cancels),
      String(row.now),
      String(row.listeners),
      String(row.longtaskCount),
      formatNumber(row.longtaskDurationMs),
      formatNumber(row.frameP50Ms),
      formatNumber(row.frameP95Ms),
      formatNumber(row.wallMs),
      row.visibilityStateAtStart,
      row.visibilityStateAtEnd,
    ]
  })
  printAligned(headers, cells)
}

function printHiddenCdpSeries(options: {
  n: number
  mode: BenchMode
  windowMs: number
  kind: BackgroundKind
  samples: HiddenCdpSample[]
}): void {
  const { n, mode, windowMs, kind, samples } = options
  const running = samples.filter((sample) => sample.phase === 'running')
  const first = running[0]
  const last = running[running.length - 1]
  let deltaSchedules: string = 'n/a'
  let deltaListeners: string = 'n/a'
  if (
    first !== undefined &&
    last !== undefined &&
    first.schedules !== null &&
    last.schedules !== null &&
    first.listeners !== null &&
    last.listeners !== null
  ) {
    deltaSchedules = String(last.schedules - first.schedules)
    deltaListeners = String(last.listeners - first.listeners)
  }

  console.log(
    `Hidden CDP samples (N=${n} mode=${mode} kind=${kind} windowMs=${windowMs} intervalMs=${HIDDEN_SAMPLE_INTERVAL_MS})`,
  )
  printAligned(
    ['tMs', 'visibilityState', 'phase', 'schedules', 'listeners'],
    samples.map((sample) => [
      formatNumber(sample.tMs),
      sample.visibilityState,
      sample.phase,
      sample.schedules === null ? '-' : String(sample.schedules),
      sample.listeners === null ? '-' : String(sample.listeners),
    ]),
  )
  console.log(
    `Hidden delta (last−first while phase=running): schedules=${deltaSchedules} listeners=${deltaListeners}`,
  )
  console.log(
    '~0 schedule growth while backgrounded ⇒ rAF stopped (suspend/catch-up signal for #12 vs worker #14).',
  )
  console.log('')
}

function printBackgroundDiagnostics(options: {
  channelLabel: string
  noDefaultsConnected: boolean
  browserVersion: string
  attempts: BackgroundAttempt[]
}): void {
  const { channelLabel, noDefaultsConnected, browserVersion, attempts } =
    options
  console.log('Hidden backgrounding diagnostics:')
  console.log(`  channel=${channelLabel}`)
  console.log(`  browserVersion=${browserVersion}`)
  console.log(`  noDefaultsConnected=${String(noDefaultsConnected)}`)
  for (const attempt of attempts) {
    console.log(
      `  strategy=${attempt.strategy} visibilityState=${attempt.visibilityState} hasFocus=${String(attempt.hasFocus)} windowState=${attempt.windowState ?? 'n/a'}`,
    )
  }
}

function isBenchPhase(value: unknown): value is BenchPhase {
  return value === 'idle' || value === 'running' || value === 'done'
}

function isVisibilityState(value: unknown): value is DocumentVisibilityState {
  return value === 'visible' || value === 'hidden'
}

function parseHiddenProbe(value: unknown): Omit<
  HiddenCdpSample,
  'tMs'
> | null {
  if (typeof value !== 'string') {
    return null
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }
  if (!('phase' in parsed) || !('visibilityState' in parsed)) {
    return null
  }
  if (!('schedules' in parsed) || !('listeners' in parsed)) {
    return null
  }
  const phase = parsed.phase
  const visibilityState = parsed.visibilityState
  const schedules = parsed.schedules
  const listeners = parsed.listeners
  if (!isBenchPhase(phase) || !isVisibilityState(visibilityState)) {
    return null
  }
  if (
    !(typeof schedules === 'number' || schedules === null) ||
    !(typeof listeners === 'number' || listeners === null)
  ) {
    return null
  }
  if (typeof schedules === 'number' && !Number.isFinite(schedules)) {
    return null
  }
  if (typeof listeners === 'number' && !Number.isFinite(listeners)) {
    return null
  }
  return {
    phase,
    visibilityState,
    schedules,
    listeners,
  }
}

async function delay(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address === null || typeof address === 'string') {
        server.close(() => {
          reject(new Error('Failed to allocate a free TCP port'))
        })
        return
      }
      const { port } = address
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }
        resolve(port)
      })
    })
    server.on('error', reject)
  })
}

async function waitForCdpHttp(port: number, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  const url = `http://127.0.0.1:${port}/json/version`
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {}
    await delay(100)
  }
  throw new Error(`CDP HTTP endpoint did not become ready at ${url}`)
}

async function readVisibility(page: Page): Promise<DocumentVisibilityState> {
  return page.evaluate(() => document.visibilityState)
}

async function readHasFocus(page: Page): Promise<boolean> {
  return page.evaluate(() => document.hasFocus())
}

async function readWindowState(page: Page): Promise<string | null> {
  const session = await page.context().newCDPSession(page)
  try {
    const { windowId } = await session.send('Browser.getWindowForTarget')
    const { bounds } = await session.send('Browser.getWindowBounds', {
      windowId,
    })
    const windowState = bounds.windowState
    if (typeof windowState === 'string') {
      return windowState
    }
    return null
  } catch {
    return null
  } finally {
    await session.detach()
  }
}

async function readPageFocusSnapshot(page: Page): Promise<PageFocusSnapshot> {
  return {
    visibilityState: await readVisibility(page),
    hasFocus: await readHasFocus(page),
    windowState: await readWindowState(page),
  }
}

async function waitUntilVisibility(
  page: Page,
  target: DocumentVisibilityState,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if ((await readVisibility(page)) === target) {
      return true
    }
    await delay(100)
  }
  return false
}

async function runBench(
  page: Page,
  options: { n: number; mode: BenchMode; ms: number },
): Promise<BenchMetrics> {
  return page.evaluate(async (runOptions) => {
    const api = window.__WATCHSTOP_BENCH__
    return api.run(runOptions)
  }, options)
}

async function readHiddenProbeViaCdp(
  session: CDPSession,
  startedAtMs: number,
): Promise<HiddenCdpSample | null> {
  const evaluated = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const api = window.__WATCHSTOP_BENCH__
      const live = api.live
      return JSON.stringify({
        phase: api.phase,
        visibilityState: document.visibilityState,
        schedules: live === null ? null : live.schedules,
        listeners: live === null ? null : live.listeners,
      })
    })()`,
    returnByValue: true,
  })
  const probe = parseHiddenProbe(evaluated.result.value)
  if (probe === null) {
    return null
  }
  return {
    tMs: Date.now() - startedAtMs,
    ...probe,
  }
}

async function runHiddenBenchWithCdpSampling(
  page: Page,
  options: { n: number; mode: BenchMode; ms: number },
): Promise<{ metrics: BenchMetrics; samples: HiddenCdpSample[] }> {
  const session = await page.context().newCDPSession(page)
  const samples: HiddenCdpSample[] = []
  const startedAtMs = Date.now()
  let sampling = true

  const sampler = (async () => {
    while (sampling) {
      const sample = await readHiddenProbeViaCdp(session, startedAtMs)
      if (sample !== null) {
        samples.push(sample)
      }
      await delay(HIDDEN_SAMPLE_INTERVAL_MS)
    }
    const finalSample = await readHiddenProbeViaCdp(session, startedAtMs)
    if (finalSample !== null) {
      samples.push(finalSample)
    }
  })()

  try {
    const metrics = await runBench(page, options)
    sampling = false
    await sampler
    return { metrics, samples }
  } catch (error) {
    sampling = false
    await sampler
    throw error
  } finally {
    await session.detach()
  }
}

async function openHeadedNoDefaultsBrowser(
  chromium: BrowserType,
): Promise<HeadedBenchSession> {
  const channel = resolveBrowserChannel()
  const channelLabel = channel ?? 'chromium'
  const port = await findFreePort()
  const launchBrowser = await chromium.launch({
    headless: false,
    ignoreDefaultArgs: [...STRIPPED_BACKGROUND_ARGS],
    args: [`--remote-debugging-port=${port}`],
    ...(channel !== undefined ? { channel } : {}),
  })
  try {
    await waitForCdpHttp(port, 15_000)
    const browser = await chromium.connectOverCDP(
      `http://127.0.0.1:${port}`,
      { noDefaults: true },
    )
    const context = browser.contexts()[0]
    if (context === undefined) {
      await browser.close()
      throw new Error(
        'connectOverCDP(noDefaults) returned no default context; focus emulation cannot be skipped',
      )
    }
    const browserVersion = browser.version()
    return {
      browser,
      context,
      channelLabel,
      noDefaultsConnected: true,
      browserVersion,
      dispose: async () => {
        await browser.close()
        await launchBrowser.close()
      },
    }
  } catch (error) {
    await launchBrowser.close()
    throw error
  }
}

async function recordAttempt(
  attempts: BackgroundAttempt[],
  strategy: string,
  page: Page,
): Promise<void> {
  const snapshot = await readPageFocusSnapshot(page)
  attempts.push({
    strategy,
    visibilityState: snapshot.visibilityState,
    hasFocus: snapshot.hasFocus,
    windowState: snapshot.windowState,
  })
}

async function backgroundWithSecondTab(
  page: Page,
  attempts: BackgroundAttempt[],
): Promise<BackgroundHandle | null> {
  const other = await page.context().newPage()
  await other.setContent(
    '<!doctype html><title>bench-tab</title><body tabindex="0">tab</body>',
  )
  await other.bringToFront()
  const session = await other.context().newCDPSession(other)
  try {
    await session.send('Page.bringToFront')
    const { targetInfos } = await session.send('Target.getTargets')
    const otherTarget = targetInfos.find((target) => {
      return target.type === 'page' && target.targetId.length > 0 && target.title === 'bench-tab'
    })
    if (otherTarget !== undefined) {
      await session.send('Target.activateTarget', {
        targetId: otherTarget.targetId,
      })
    }
  } finally {
    await session.detach()
  }
  try {
    await other.locator('body').click({ timeout: 5_000 })
  } catch {}

  const hidden = await waitUntilVisibility(page, 'hidden', 10_000)
  await recordAttempt(attempts, 'same-window-second-tab', page)
  if (hidden) {
    return {
      kind: 'hidden',
      dispose: async () => {
        await other.close()
      },
    }
  }
  await other.close()
  return null
}

async function backgroundWithMinimize(
  page: Page,
  attempts: BackgroundAttempt[],
): Promise<BackgroundHandle | null> {
  const session = await page.context().newCDPSession(page)
  try {
    const { windowId } = await session.send('Browser.getWindowForTarget')
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'minimized' },
    })
    await page.evaluate(() => {
      window.blur()
    })
  } finally {
    await session.detach()
  }

  const hidden = await waitUntilVisibility(page, 'hidden', 8_000)
  await recordAttempt(attempts, 'cdp-minimize-blur', page)
  if (hidden) {
    return {
      kind: 'hidden',
      dispose: async () => {},
    }
  }
  return null
}

async function backgroundWithOtherWindow(
  page: Page,
  browser: Browser,
  attempts: BackgroundAttempt[],
): Promise<BackgroundHandle | null> {
  const benchSession = await page.context().newCDPSession(page)
  let benchWindowId: number | undefined
  try {
    const { windowId } = await benchSession.send('Browser.getWindowForTarget')
    benchWindowId = windowId
    await benchSession.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'minimized' },
    })
  } finally {
    await benchSession.detach()
  }

  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  await other.setContent(
    '<!doctype html><title>bench-focus</title><body tabindex="0">focus</body>',
  )
  const otherSession = await other.context().newCDPSession(other)
  try {
    const { windowId: otherWindowId } = await otherSession.send(
      'Browser.getWindowForTarget',
    )
    await otherSession.send('Browser.setWindowBounds', {
      windowId: otherWindowId,
      bounds: { windowState: 'normal' },
    })
    await otherSession.send('Page.bringToFront')
    if (benchWindowId !== undefined) {
      await otherSession.send('Browser.setWindowBounds', {
        windowId: benchWindowId,
        bounds: { windowState: 'minimized' },
      })
    }
  } finally {
    await otherSession.detach()
  }
  try {
    await other.locator('body').click({ timeout: 5_000 })
  } catch {}

  const hidden = await waitUntilVisibility(page, 'hidden', 15_000)
  await recordAttempt(attempts, 'second-os-window', page)
  if (hidden) {
    return {
      kind: 'hidden',
      dispose: async () => {
        await otherContext.close()
      },
    }
  }
  await otherContext.close()
  return null
}

async function backgroundWithFreeze(
  page: Page,
  attempts: BackgroundAttempt[],
): Promise<BackgroundHandle | null> {
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Page.setWebLifecycleState', { state: 'frozen' })
  } catch {
    await recordAttempt(attempts, 'page-setWebLifecycleState-frozen', page)
    await session.detach()
    return null
  }

  await delay(500)
  await recordAttempt(attempts, 'page-setWebLifecycleState-frozen', page)
  return {
    kind: 'frozen',
    dispose: async () => {
      try {
        await session.send('Page.setWebLifecycleState', { state: 'active' })
      } catch {
      } finally {
        await session.detach()
      }
    },
  }
}

async function ensureBenchBackground(
  page: Page,
  browser: Browser,
): Promise<BackgroundResult> {
  const attempts: BackgroundAttempt[] = []

  const tab = await backgroundWithSecondTab(page, attempts)
  if (tab !== null) {
    return { ok: true, handle: tab, attempts }
  }

  const minimized = await backgroundWithMinimize(page, attempts)
  if (minimized !== null) {
    return { ok: true, handle: minimized, attempts }
  }

  const otherWindow = await backgroundWithOtherWindow(page, browser, attempts)
  if (otherWindow !== null) {
    return { ok: true, handle: otherWindow, attempts }
  }

  const frozen = await backgroundWithFreeze(page, attempts)
  if (frozen !== null) {
    return { ok: true, handle: frozen, attempts }
  }

  return {
    ok: false,
    attempts,
    message:
      'All backgrounding strategies failed (second-tab, minimize+blur, second-window, freeze).',
  }
}

test.describe('browser concurrent stopwatches', () => {
  test('prints shared vs per-instance metrics table', async ({
    playwright,
    baseURL,
  }, testInfo) => {
    const headed = testInfo.project.use.headless === false
    const ms = resolveMs()
    const hiddenMs = resolveHiddenMs()
    const ns = resolveNs()
    const modes: BenchMode[] = ['shared', 'per-instance']
    const rows: BenchRow[] = []
    let hiddenSkipReason: string | undefined
    let backgroundKind: BackgroundKind | undefined

    testInfo.setTimeout(
      Math.max(
        testInfo.timeout,
        (ms + hiddenMs) * ns.length * modes.length * 2 + 60_000,
      ),
    )

    if (baseURL === undefined) {
      throw new Error('baseURL is required')
    }

    if (headed) {
      const session = await openHeadedNoDefaultsBrowser(playwright.chromium)
      const page = await session.context.newPage()
      try {
        console.log(
          `Headed bench browser: channel=${session.channelLabel} version=${session.browserVersion} noDefaultsConnected=${String(session.noDefaultsConnected)}`,
        )

        for (const n of ns) {
          for (const mode of modes) {
            await page.goto(baseURL)
            await page.bringToFront()
            await expect
              .poll(async () => readVisibility(page), { timeout: 10_000 })
              .toBe('visible')

            const metrics = await runBench(page, { n, mode, ms })
            rows.push({
              ...metrics,
              visibilityTarget: 'visible',
            })
          }
        }

        for (const n of ns) {
          for (const mode of modes) {
            if (hiddenSkipReason !== undefined) {
              rows.push({
                n,
                mode,
                visibilityTarget: backgroundKind ?? 'hidden',
                skipped: true,
                skipReason: hiddenSkipReason,
              })
              continue
            }

            await page.goto(baseURL)
            await page.bringToFront()
            await expect
              .poll(async () => readVisibility(page), { timeout: 10_000 })
              .toBe('visible')

            let disposeBackground: (() => Promise<void>) | undefined
            let kind: BackgroundKind = 'hidden'

            try {
              const background = await ensureBenchBackground(
                page,
                session.browser,
              )
              if (!background.ok) {
                hiddenSkipReason = 'backgrounding failed'
                backgroundKind = 'hidden'
                console.log(
                  `Hidden backgrounding soft-skip: ${background.message}`,
                )
                printBackgroundDiagnostics({
                  channelLabel: session.channelLabel,
                  noDefaultsConnected: session.noDefaultsConnected,
                  browserVersion: session.browserVersion,
                  attempts: background.attempts,
                })
                rows.push({
                  n,
                  mode,
                  visibilityTarget: 'hidden',
                  skipped: true,
                  skipReason: hiddenSkipReason,
                })
                continue
              }

              kind = background.handle.kind
              backgroundKind = kind
              disposeBackground = background.handle.dispose
              if (kind === 'frozen') {
                console.log(
                  'Hidden backgrounding using Page.setWebLifecycleState(frozen); rows labeled vis=frozen.',
                )
                printBackgroundDiagnostics({
                  channelLabel: session.channelLabel,
                  noDefaultsConnected: session.noDefaultsConnected,
                  browserVersion: session.browserVersion,
                  attempts: background.attempts,
                })
              }

              const { metrics, samples } = await runHiddenBenchWithCdpSampling(
                page,
                { n, mode, ms: hiddenMs },
              )

              if (kind === 'hidden') {
                expect(metrics.visibilityStateAtStart).toBe('hidden')
                const sawHidden = metrics.visibilitySamples.some(
                  (sample) => sample.state === 'hidden',
                )
                expect(sawHidden).toBe(true)
                const cdpSawHidden = samples.some(
                  (sample) => sample.visibilityState === 'hidden',
                )
                expect(cdpSawHidden).toBe(true)
              }

              printHiddenCdpSeries({
                n,
                mode,
                windowMs: hiddenMs,
                kind,
                samples,
              })

              rows.push({
                ...metrics,
                visibilityTarget: kind,
              })
            } finally {
              if (disposeBackground !== undefined) {
                await disposeBackground()
              }
            }
          }
        }
      } finally {
        await session.dispose()
      }
    } else {
      const browser = await playwright.chromium.launch({ headless: true })
      try {
        const page = await browser.newPage()
        for (const n of ns) {
          for (const mode of modes) {
            await page.goto(baseURL)
            await expect
              .poll(async () => readVisibility(page), { timeout: 10_000 })
              .toBe('visible')

            const metrics = await runBench(page, { n, mode, ms })
            rows.push({
              ...metrics,
              visibilityTarget: 'visible',
            })
          }
        }

        for (const n of ns) {
          for (const mode of modes) {
            rows.push({
              n,
              mode,
              visibilityTarget: 'hidden',
              skipped: true,
              skipReason: 'needs headed (noDefaults CDP)',
            })
          }
        }
      } finally {
        await browser.close()
      }
    }

    printTable(rows)
  })
})
