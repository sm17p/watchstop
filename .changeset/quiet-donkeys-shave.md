---
"@watchstop/react": minor
"@watchstop/svelte": minor
"@watchstop/vue": minor
"@watchstop/solid": minor
---

Add an instance-owning ergonomic API to every Wave 1 adapter: `useStopwatch()` for React, Vue, and Solid, and `createStopwatch()` for Svelte. Each returns `elapsed`, stable `start` / `stop` / `reset` controls, and the owned `stopwatch` instance, and each runs `destroy()` on teardown — React effect cleanup (Strict Mode safe via lazy `useRef` rather than `useMemo`), `onScopeDispose` in Vue, `onCleanup` in Solid, and `onDestroy` in Svelte. Construction stays inert until `start()`. The primitives `useStore` / `toSvelteStore` remain exported for stopwatches the component does not own.

Move `@watchstop/core` from `dependencies` to `peerDependencies` (plus `devDependencies` so tests resolve it). Consumers must already own core to construct or share instances, and a regular dependency invites a second resolved copy whose `Store` type would not be identical to the consumer's.
