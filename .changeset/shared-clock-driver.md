---
'@watchstop/core': minor
---

Share one clock `schedule` loop across stopwatches that use the same `Clock` object, and reuse the listener snapshot buffer on notify. Pass one shared clock to coalesce; `detectClock()` still returns a fresh clock each call.
