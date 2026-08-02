# @watchstop/qwik

## 1.0.3

### Patch Changes

- 2818162: Clear OSV-Scanner full-scan findings on main by upgrading Astro in examples and overriding vulnerable transitive `postcss` / `sharp` from Next.
- Updated dependencies [2818162]
  - @watchstop/core@0.1.2

## 1.0.2

### Patch Changes

- eb3df4a: Ship `@watchstop/qwik` as a Qwik library build (`index.qwik.mjs` + `"qwik"` package field) so `useVisibleTask$` is optimizer-safe, wrap the owned `Stopwatch` in `noSerialize()` on a signal holder with `$()` control QRLs, and document calling instance methods from custom handlers (nested QRL invokes are unreliable).

## 1.0.1

### Patch Changes

- 6d3ccb2: Test release pipeline after Changesets CLI v3 alignment
- Updated dependencies [6d3ccb2]
  - @watchstop/core@0.1.1

## 1.0.0

### Minor Changes

- a34861a: Add `@watchstop/qwik` with `useStopwatch()`, bridging `Store` into a Qwik signal and subscribing only inside `useVisibleTask$` (Qwik 2 peer `@qwik.dev/core`). Construction stays inert until `start()`. `@watchstop/core` is a peer dependency.

### Patch Changes

- 91216d0: Add repository, homepage, and bugs metadata for npm Trusted Publishing packages.
- Updated dependencies [7194918]
- Updated dependencies [91216d0]
  - @watchstop/core@0.1.0
