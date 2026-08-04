# Core concurrent-stopwatch microbench

Opt-in MockClock metrics table for issue #8. Measures schedule / cancel / now / listener / spread cost for **shared** vs **per-instance** clocks. Not part of `mise run test` or CI unit jobs.

Browser / visibility / longtask layer: [`examples/bench`](../../../examples/bench/README.md) (`mise run bench:browser` / `bench:browser:headed`).

## Run

```bash
mise run bench
# or
pnpm bench
```

Smoke (30 ticks instead of 300):

```bash
TICKS=30 mise run bench
```

Include N=10000 (default matrix is 1, 100, 1000):

```bash
BENCH_LARGE=1 mise run bench
# or
BENCH_N=10000 mise run bench
```

Combine:

```bash
TICKS=30 BENCH_LARGE=1 mise run bench
```

## Env

| Variable | Effect |
| --- | --- |
| `TICKS` | Advance count per scenario. Default `300`. Use `30` for a fast smoke. |
| `BENCH_LARGE=1` | Appends `10000` to the N matrix. |
| `BENCH_N=10000` | Same as `BENCH_LARGE=1` (adds 10000 only). |

## Columns

| Column | Meaning |
| --- | --- |
| `N` | Stopwatch count |
| `mode` | `shared` = one MockClock for all; `per-instance` = one MockClock per Stopwatch |
| `ticks` | `advance(1)` waves after start |
| `schedules` / `cancels` / `now` | Counting-clock proxy totals |
| `listeners` | Subscriber invocations (1 listener per stopwatch) |
| `spread` | Lower bound on `[...listeners]` work (`listenerSetSize` summed per notify; here 1 × notifies) |
| `wallMs` | Wall time of the advance loop only (order-of-magnitude) |

## How to read shared vs per-instance

Status-quo `Stopwatch` owns its own `schedule` → tick → notify → reschedule loop even when you pass one shared `Clock`. Expect **schedule / cancel / listener counts to stay in the same ballpark** for shared and per-instance at a given N and tick budget. Sharing the clock object alone does not coalesce wakes.

What shared vs per-instance *does* isolate for later #11 work:

- **Shared** is the baseline for “callers already pass one clock” (Axis 3 ownership).
- **Per-instance** mirrors accidental `detectClock()`-per-`Stopwatch` at scale.
- After a coalescing shared driver lands, **per-instance `schedules` should land near N× shared** for the same tick budget, while both modes still pay ~N listener / spread work per wave unless notify batching lands too.

Do not treat `wallMs` as a CI gate; compare relative orders of magnitude on the count columns.
