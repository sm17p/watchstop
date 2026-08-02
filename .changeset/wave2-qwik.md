---
"@watchstop/qwik": minor
---

Add `@watchstop/qwik` with `useStopwatch()`, bridging `Store` into a Qwik signal and subscribing only inside `useVisibleTask$` (Qwik 2 peer `@qwik.dev/core`). Construction stays inert until `start()`. `@watchstop/core` is a peer dependency.
