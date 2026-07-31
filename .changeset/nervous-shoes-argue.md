---
"@watchstop/react": minor
"@watchstop/svelte": minor
"@watchstop/vue": minor
"@watchstop/solid": minor
---

Rename the Svelte adapter export from `fromStore` to `toSvelteStore` so it does not collide with `svelte/store`'s own `fromStore` / `toStore`, which convert in the opposite direction. Call sites now read `const elapsed = toSvelteStore(stopwatch)` with `{$elapsed}` in markup. React, Vue, and Solid keep `useStore`; their internal bindings were renamed for readability with no behavior change.
