# @watchstop/react

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

- 7194918: Wave 1 thin framework adapters bridging Store get/subscribe for React, Svelte, Vue, and Solid.
- 7194918: Rename the Svelte adapter export from `fromStore` to `toSvelteStore` so it does not collide with `svelte/store`'s own `fromStore` / `toStore`, which convert in the opposite direction. Call sites now read `const elapsed = toSvelteStore(stopwatch)` with `{$elapsed}` in markup. React, Vue, and Solid keep `useStore`; their internal bindings were renamed for readability with no behavior change.
- 7194918: Add an instance-owning ergonomic API to every Wave 1 adapter: `useStopwatch()` for React, Vue, and Solid, and `createStopwatch()` for Svelte. Each returns `elapsed`, stable `start` / `stop` / `reset` controls, and the owned `stopwatch` instance, and each runs `destroy()` on teardown — React effect cleanup (Strict Mode safe via lazy `useRef` rather than `useMemo`), `onScopeDispose` in Vue, `onCleanup` in Solid, and `onDestroy` in Svelte. Construction stays inert until `start()`.

  Each adapter's public API is exactly this one entry point. The generic `Store<T>` bridge each one uses internally (`useStore`, `toSvelteStore`) is not exported: `Stopwatch` is the only `Store` in core today, so a public primitive over the type family would fix a shared-instance API before there is a second store to validate it against. Reading a stopwatch the component does not own is therefore unsupported in v1 — tracked in https://github.com/sm17p/watchstop/issues/6, and adding an export later is not a breaking change.

  Move `@watchstop/core` from `dependencies` to `peerDependencies` (plus `devDependencies` so tests resolve it). Consumers must already own core to construct or share instances, and a regular dependency invites a second resolved copy whose `Store` type would not be identical to the consumer's.

### Patch Changes

- 91216d0: Add repository, homepage, and bugs metadata for npm Trusted Publishing packages.
- Updated dependencies [7194918]
- Updated dependencies [91216d0]
  - @watchstop/core@0.1.0
