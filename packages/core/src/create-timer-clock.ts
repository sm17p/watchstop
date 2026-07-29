import type { Clock } from './clock.js'

export type TimerClockOptions = {
  intervalMs?: number
}

export function createTimerClock(options?: TimerClockOptions): Clock {
  const intervalMs = options?.intervalMs ?? 16
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new RangeError('intervalMs must be a finite number > 0')
  }

  const timers = new Map<symbol, ReturnType<typeof setTimeout>>()

  const now = (): number => performance.now()

  const schedule = (callback: () => void): unknown => {
    const handle = Symbol('timer-clock-handle')
    const timeoutId = setTimeout(() => {
      timers.delete(handle)
      callback()
    }, intervalMs)
    timers.set(handle, timeoutId)
    return handle
  }

  const cancel = (handle: unknown): void => {
    if (typeof handle !== 'symbol') {
      return
    }
    const timeoutId = timers.get(handle)
    if (timeoutId === undefined) {
      return
    }
    clearTimeout(timeoutId)
    timers.delete(handle)
  }

  return { now, schedule, cancel }
}
