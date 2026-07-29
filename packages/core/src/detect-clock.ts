import type { Clock } from './clock.js'
import { createBrowserClock } from './create-browser-clock.js'
import { createTimerClock } from './create-timer-clock.js'

export function detectClock(): Clock {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return createBrowserClock()
  }
  return createTimerClock()
}
