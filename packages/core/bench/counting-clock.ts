import type { Clock } from '../src/clock.js'
import {
  createMockClock,
  type MockClock,
  type MockClockOptions,
} from '../src/create-mock-clock.js'

export type ClockCounts = {
  schedule: number
  cancel: number
  now: number
}

export type CountingClock = Clock & {
  counts: ClockCounts
  resetCounts(): void
}

export type CountingMockClock = CountingClock & MockClock

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

export function createCountingMockClock(
  options?: MockClockOptions,
): CountingMockClock {
  const inner = createMockClock(options)
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
    advance(ms) {
      inner.advance(ms)
    },
  }
}
