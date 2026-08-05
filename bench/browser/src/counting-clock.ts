import type { Clock } from '@watchstop/core'

export type ClockCounts = {
  schedule: number
  cancel: number
  now: number
}

export type CountingClock = Clock & {
  counts: ClockCounts
  resetCounts(): void
}

export function wrapCountingClock(inner: Clock): CountingClock {
  const counts = {
    schedule: 0,
    cancel: 0,
    now: 0,
  }

  return {
    counts,
    resetCounts() {
      counts.schedule = 0
      counts.cancel = 0
      counts.now = 0
    },
    now() {
      counts.now += 1
      return inner.now()
    },
    schedule(callback) {
      counts.schedule += 1
      return inner.schedule(callback)
    },
    cancel(handle) {
      counts.cancel += 1
      inner.cancel(handle)
    },
  }
}
