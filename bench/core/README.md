# Core MockClock concurrent-stopwatch microbench

Opt-in metrics table for issue #8. Measures schedule / cancel / now / listener / spread cost for **shared** vs **per-instance** clocks. Not part of `mise run test` or CI unit jobs.

Browser / visibility / longtask layer: [`../browser`](../browser/README.md) (`mise run bench:browser` / `bench:browser:headed`).

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
| `spread` | Lower bound on listener-set work per notify |
| `wallMs` | Wall time of the advance loop only (order-of-magnitude) |

## How to read shared vs per-instance

After the shared clock driver (#11), **shared** mode should show roughly **one** `schedule` per tick wave (`ticks + 1` including start), while **per-instance** stays near **N × (ticks + 1)**. Listener counts still scale with N × ticks because each stopwatch still notifies its own subscribers.

Pass one shared `Clock` into every `Stopwatch` under test for the shared column (`detectClock()` / bare `new Stopwatch()` still allocate a fresh clock each time).

Do not treat `wallMs` as a CI gate; compare relative orders of magnitude on the count columns.
