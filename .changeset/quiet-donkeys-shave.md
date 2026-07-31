---
"@watchstop/react": minor
"@watchstop/svelte": minor
"@watchstop/vue": minor
"@watchstop/solid": minor
---

Add an instance-owning ergonomic API to every Wave 1 adapter: `useStopwatch()` for React, Vue, and Solid, and `createStopwatch()` for Svelte. Each returns `elapsed`, stable `start` / `stop` / `reset` controls, and the owned `stopwatch` instance, and each runs `destroy()` on teardown — React effect cleanup (Strict Mode safe via lazy `useRef` rather than `useMemo`), `onScopeDispose` in Vue, `onCleanup` in Solid, and `onDestroy` in Svelte. Construction stays inert until `start()`.

Each adapter's public API is exactly this one entry point. The generic `Store<T>` bridge each one uses internally (`useStore`, `toSvelteStore`) is not exported: `Stopwatch` is the only `Store` in core today, so a public primitive over the type family would fix a shared-instance API before there is a second store to validate it against. Reading a stopwatch the component does not own is therefore unsupported in v1 — tracked in https://github.com/sm17p/watchstop/issues/6, and adding an export later is not a breaking change.

Move `@watchstop/core` from `dependencies` to `peerDependencies` (plus `devDependencies` so tests resolve it). Consumers must already own core to construct or share instances, and a regular dependency invites a second resolved copy whose `Store` type would not be identical to the consumer's.
