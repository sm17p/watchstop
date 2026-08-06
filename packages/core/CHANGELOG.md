# @watchstop/core

## 0.4.0

### Minor Changes

- 196451e: Share one clock `schedule` loop across stopwatches that use the same `Clock` object, and reuse the listener snapshot buffer on notify. Pass one shared clock to coalesce; `detectClock()` still returns a fresh clock each call.

## 0.3.0

### Minor Changes

- f21eb27: Add Stopwatch `precisionMs` notification coarsening. Adapters forward `precisionMs` to the owned Stopwatch.

## 0.2.0

### Minor Changes

- f305908: Expose Stopwatch.running and notify subscribers on start so adapters can sync UI state.

## 0.1.2

### Patch Changes

- 2818162: Clear OSV-Scanner full-scan findings on main by upgrading Astro in examples and overriding vulnerable transitive `postcss` / `sharp` from Next.

## 0.1.1

### Patch Changes

- 6d3ccb2: Test release pipeline after Changesets CLI v3 alignment

## 0.1.0

### Minor Changes

- 7194918: Initial public release of Clock, Store, Stopwatch, and runtime clocks (`createMockClock`, `createBrowserClock`, `createTimerClock`, `detectClock`).

### Patch Changes

- 91216d0: Add repository, homepage, and bugs metadata for npm Trusted Publishing packages.
