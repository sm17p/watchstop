import type { Clock } from './clock.js'

export type SharedTickTarget = {
  onSharedTick(): void
  wantsSharedTicks(): boolean
}

export class SharedClockDriver {
  readonly #clock: Clock
  readonly #targets = new Set<SharedTickTarget>()
  #handle: unknown

  constructor(clock: Clock) {
    this.#clock = clock
  }

  register(target: SharedTickTarget): void {
    this.#targets.add(target)
    this.#ensureScheduled()
  }

  unregister(target: SharedTickTarget): void {
    this.#targets.delete(target)
    if (this.#targets.size === 0) {
      this.#cancel()
    }
  }

  #ensureScheduled(): void {
    if (this.#handle !== undefined) {
      return
    }
    let wantsTicks = false
    for (const target of this.#targets) {
      if (target.wantsSharedTicks()) {
        wantsTicks = true
        break
      }
    }
    if (!wantsTicks) {
      return
    }
    this.#handle = this.#clock.schedule(() => {
      this.#handle = undefined
      const snapshot = [...this.#targets]
      for (const target of snapshot) {
        if (!this.#targets.has(target) || !target.wantsSharedTicks()) {
          continue
        }
        target.onSharedTick()
      }
      this.#ensureScheduled()
    })
  }

  #cancel(): void {
    if (this.#handle === undefined) {
      return
    }
    this.#clock.cancel(this.#handle)
    this.#handle = undefined
  }
}

const drivers = new WeakMap<Clock, SharedClockDriver>()

export function sharedDriverFor(clock: Clock): SharedClockDriver {
  const existing = drivers.get(clock)
  if (existing !== undefined) {
    return existing
  }
  const created = new SharedClockDriver(clock)
  drivers.set(clock, created)
  return created
}
