# @watchstop/alpine

## 1.2.0

### Minor Changes

- f21eb27: Add Stopwatch `precisionMs` notification coarsening. Adapters forward `precisionMs` to the owned Stopwatch.

### Patch Changes

- Updated dependencies [f21eb27]
  - @watchstop/core@0.3.0

## 1.1.0

### Minor Changes

- f305908: Expose reactive running on each adapter binding, synced from Stopwatch.running.

### Patch Changes

- Updated dependencies [f305908]
  - @watchstop/core@0.2.0

## 1.0.2

### Patch Changes

- 2818162: Clear OSV-Scanner full-scan findings on main by upgrading Astro in examples and overriding vulnerable transitive `postcss` / `sharp` from Next.
- Updated dependencies [2818162]
  - @watchstop/core@0.1.2

## 1.0.1

### Patch Changes

- 6d3ccb2: Test release pipeline after Changesets CLI v3 alignment
- Updated dependencies [6d3ccb2]
  - @watchstop/core@0.1.1

## 1.0.0

### Minor Changes

- 0df7f51: Add `@watchstop/alpine` with `createStopwatch()`, a factory binding with Alpine `init` / `destroy` lifecycle hooks for subscribe and teardown. No plugin helper — single entry point. `@watchstop/core` is a peer dependency.

### Patch Changes

- 91216d0: Add repository, homepage, and bugs metadata for npm Trusted Publishing packages.
- Updated dependencies [7194918]
- Updated dependencies [91216d0]
  - @watchstop/core@0.1.0
