# Browser concurrent-stopwatch bench

Layer 2 for issue #8: real `createBrowserClock` / rAF timing, long tasks, frame percentiles, and **headed** hidden-tab behavior. Complements the MockClock microbench (`mise run bench` / [`../core`](../core/README.md)).

Not part of `mise run test` or CI unit jobs. No absolute performance budgets.

## Prerequisites

```bash
mise install
pnpm install
mise run build
pnpm --filter @watchstop/bench-browser exec playwright install chromium
```

For system Chrome (`BENCH_BROWSER_CHANNEL=chrome`), install Google Chrome locally (no Playwright browser download required for that channel).

## Manual (Vite UI)

```bash
pnpm --filter @watchstop/bench-browser dev
```

Open the app, pick **N** / **mode** / window ms, click **Run**. Results render in `#bench-results` and on `window.__WATCHSTOP_BENCH__`.

Query helpers:

| Query | Effect |
| --- | --- |
| `?n=1000` | Default N |
| `?mode=per-instance` | Default mode (`shared` otherwise) |
| `?ms=5000` | Run window |
| `?large=1` | Include N=10000 in the select |
| `?autorun=1` | Start a run on load |

Example: `http://127.0.0.1:5180/?n=100&mode=shared&ms=5000&autorun=1`

## Playwright (preferred automation)

Headless — **foreground only**; hidden scenarios soft-skip (Playwright’s default focus emulation pins `visibilityState` to `visible`, and headless is not the headed noDefaults path):

```bash
mise run bench:browser
# or
pnpm bench:browser
```

Headed — **foreground + real backgrounded** runs on macOS/desktop:

1. Launch Chromium (or system Chrome) headed with Playwright’s anti-backgrounding flags stripped.
2. Re-attach via `connectOverCDP({ noDefaults: true })` so Playwright does **not** enable `Emulation.setFocusEmulationEnabled` (that pin is why minimize/tab alone stayed `visible`).
3. Background via same-window second tab → CDP minimize+blur → second OS window → last-resort `Page.setWebLifecycleState({ state: 'frozen' })` (rows labeled `vis=frozen`, not `hidden`).

While backgrounded, CDP samples live counters every 250ms:

```bash
mise run bench:browser:headed
# or
pnpm bench:browser:headed
```

Prefer system Chrome if bundled Chromium misbehaves on your desktop:

```bash
BENCH_BROWSER_CHANNEL=chrome mise run bench:browser:headed
```

Smoke (shorter foreground, longer hidden CDP window):

```bash
BENCH_MS=1000 BENCH_HIDDEN_MS=10000 mise run bench:browser:headed
```

Foreground-only smoke:

```bash
BENCH_MS=1000 mise run bench:browser
```

Include N=10000:

```bash
BENCH_LARGE=1 mise run bench:browser:headed
# or
BENCH_N=10000 mise run bench:browser:headed
```

## Env

| Variable | Effect |
| --- | --- |
| `BENCH_MS` | Foreground run window in ms. Default `5000`. |
| `BENCH_HIDDEN_MS` | Hidden/frozen (headed) run window in ms. Default `10000`. Separate from `BENCH_MS`. |
| `BENCH_LARGE=1` | Appends `10000` to the N matrix. |
| `BENCH_N=10000` | Same as `BENCH_LARGE=1`. |
| `BENCH_HEADED=1` | Set by `bench:browser:headed` so the headed noDefaults path runs. |
| `BENCH_BROWSER_CHANNEL` | Optional Playwright channel (e.g. `chrome` for system Google Chrome). Default: bundled Chromium. |

## Scrape contract

`window.__WATCHSTOP_BENCH__`:

| Field | Meaning |
| --- | --- |
| `phase` | `idle` \| `running` \| `done` |
| `result` | Last `BenchMetrics` or `null` |
| `live` | Live counting-clock counters while `phase === 'running'`, else `null` (`schedules`, `cancels`, `now`, `listeners`, `visibilityState`) |
| `run({ n, mode, ms })` | Starts a timed run; resolves with metrics |

Metrics include `schedules` / `cancels` / `now` / `listeners`, `longtaskCount` / `longtaskDurationMs`, `frameP50Ms` / `frameP95Ms`, `visibilitySamples`, `wallMs`, and visibility at start/end.

Mirrored as readable JSON in `#bench-results`.

## Hidden-tab notes (macOS)

- **Root cause of earlier soft-skips:** Playwright enables focus emulation on managed pages, which pins `document.visibilityState === 'visible'`. Stripping `--disable-backgrounding-occluded-windows` / `--disable-renderer-backgrounding` / `--disable-background-timer-throttling` alone is not enough.
- **What works on macOS:** headed launch + strip those three flags + `connectOverCDP({ noDefaults: true })` on the default context, then background with a real second tab (preferred) or CDP minimize. That yields real `visibilityState === 'hidden'` and rAF stop (`schedules` flat while running).
- Optional `BENCH_BROWSER_CHANNEL=chrome` uses system Chrome the same way; default remains bundled Chromium.
- Primary path does **not** fake `visibilityState` via `Object.defineProperty`.
- Fallback order: same-window second tab → CDP minimize + blur → second OS window (minimize bench, focus other) → `Page.setWebLifecycleState({ state: 'frozen' })` labeled `vis=frozen` (freeze is not the Page Visibility API; use only if hidden cannot be achieved).
- On failure, the runner logs channel, browser version, `noDefaultsConnected`, and each strategy’s `visibilityState` / `hasFocus` / CDP `windowState`.
- While backgrounded, CDP `Runtime.evaluate` samples (~every 250ms): `visibilityState`, `phase`, live `schedules` / `listeners`. Flat schedules ⇒ rAF stopped — short-window signal for suspend/catch-up (#12) vs worker clock (#14).
- That short window (default 10s) is **not** enough for Chrome’s intensive timer throttling (~1/min).
- Headless `bench:browser` still measures visible/foreground runs; hidden rows soft-skip.
- If headed backgrounding still fails (agents / non-interactive displays), hidden rows soft-skip and foreground metrics still print.
- Optional CPU throttle (4× / 6×) remains a manual DevTools check; not automated here.

## Columns (Playwright table)

| Column | Meaning |
| --- | --- |
| `N` / `mode` | Stopwatch count; shared vs per-instance browser clocks |
| `vis` | Target: `visible`, `hidden`, or `frozen` |
| `schedules` / `cancels` / `now` | Counting-clock proxy totals |
| `listeners` | Subscriber invocations |
| `longtasks` / `ltMs` | `PerformanceObserver` longtask count and duration sum |
| `p50` / `p95` | rAF frame-delta percentiles (ms) |
| `wallMs` | Wall time of the timed window (includes start/destroy) |
| `visStart` / `visEnd` | `document.visibilityState` at run boundaries |

Hidden CDP series columns: `tMs`, `visibilityState`, `phase`, `schedules`, `listeners`, plus a final delta line.
