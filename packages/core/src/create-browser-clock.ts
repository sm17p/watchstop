import type { Clock } from './clock.js'

export function createBrowserClock(): Clock {
  if (
    typeof globalThis.requestAnimationFrame !== 'function' ||
    typeof globalThis.cancelAnimationFrame !== 'function'
  ) {
    throw new Error(
      'createBrowserClock requires requestAnimationFrame and cancelAnimationFrame',
    )
  }

  const requestFrame = globalThis.requestAnimationFrame.bind(globalThis)
  const cancelFrame = globalThis.cancelAnimationFrame.bind(globalThis)

  const now = (): number => performance.now()

  const schedule = (callback: () => void): unknown =>
    requestFrame(() => {
      callback()
    })

  const cancel = (handle: unknown): void => {
    if (typeof handle === 'number') {
      cancelFrame(handle)
    }
  }

  return { now, schedule, cancel }
}
