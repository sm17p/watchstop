# Bench

Measurement harnesses for issue #8 (and follow-on notify-cost work). Not published. Not part of `mise run test`.

| Path | Role | Command |
| --- | --- | --- |
| [`core/`](./core/README.md) | Deterministic MockClock schedule/notify matrix | `mise run bench` |
| [`browser/`](./browser/README.md) | Real rAF / long tasks / headed hidden-tab Playwright | `mise run bench:browser` / `bench:browser:headed` |

```bash
TICKS=30 mise run bench
BENCH_MS=1000 mise run bench:browser
mise run bench:browser:headed
```
