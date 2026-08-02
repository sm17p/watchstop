---
'@watchstop/qwik': patch
---

Ship `@watchstop/qwik` as a Qwik library build (`index.qwik.mjs` + `"qwik"` package field) so `useVisibleTask$` is optimizer-safe, wrap the owned `Stopwatch` in `noSerialize()` on a signal holder with `$()` control QRLs, and document calling instance methods from custom handlers (nested QRL invokes are unreliable).
