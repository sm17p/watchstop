import type { Clock } from './clock.js'

export type MockClockOptions = {
  frameDelay?: number
}

export interface MockClock extends Clock {
  advance(ms: number): void
}

type PendingEntry = {
  handle: symbol
  callback: () => void
  dueTime: number
  order: number
}

export function createMockClock(options?: MockClockOptions): MockClock {
  const frameDelay = options?.frameDelay ?? 0
  if (!Number.isFinite(frameDelay) || frameDelay < 0) {
    throw new RangeError('frameDelay must be a finite number >= 0')
  }

  let currentTime = 0
  let nextOrder = 0
  const pending: PendingEntry[] = []

  const now = (): number => currentTime

  const schedule = (callback: () => void): unknown => {
    const handle = Symbol('mock-clock-handle')
    pending.push({
      handle,
      callback,
      dueTime: currentTime + frameDelay,
      order: nextOrder,
    })
    nextOrder += 1
    return handle
  }

  const cancel = (handle: unknown): void => {
    const index = pending.findIndex((entry) => entry.handle === handle)
    if (index !== -1) {
      pending.splice(index, 1)
    }
  }

  const advance = (ms: number): void => {
    if (!Number.isFinite(ms) || ms < 0) {
      throw new RangeError('ms must be a finite number >= 0')
    }
    currentTime += ms
    const due = pending
      .filter((entry) => entry.dueTime <= currentTime)
      .sort((left, right) => {
        if (left.dueTime !== right.dueTime) {
          return left.dueTime - right.dueTime
        }
        return left.order - right.order
      })
    for (const entry of due) {
      const index = pending.indexOf(entry)
      if (index !== -1) {
        pending.splice(index, 1)
      }
    }
    for (const entry of due) {
      entry.callback()
    }
  }

  return { now, schedule, cancel, advance }
}
