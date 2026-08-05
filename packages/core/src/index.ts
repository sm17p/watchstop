export type { Clock } from './clock.js'
export type { Store } from './store.js'
export {
  createMockClock,
  type MockClock,
  type MockClockOptions,
} from './create-mock-clock.js'
export { createBrowserClock } from './create-browser-clock.js'
export {
  createTimerClock,
  type TimerClockOptions,
} from './create-timer-clock.js'
export { detectClock } from './detect-clock.js'
export { Stopwatch, type StopwatchOptions } from './stopwatch.js'
