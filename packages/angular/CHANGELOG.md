# @watchstop/angular

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

- 779a24e: Add `@watchstop/angular` with `injectStopwatch()`, bridging `Store` into a readonly Angular signal and tearing down via `DestroyRef`. Construction stays inert until `start()`. `@watchstop/core` is a peer dependency.

### Patch Changes

- 91216d0: Add repository, homepage, and bugs metadata for npm Trusted Publishing packages.
- Updated dependencies [7194918]
- Updated dependencies [91216d0]
  - @watchstop/core@0.1.0
