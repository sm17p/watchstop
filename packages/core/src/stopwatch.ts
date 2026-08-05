import type { Clock } from './clock.js'
import type { Store } from './store.js'
import { detectClock } from './detect-clock.js'
import {
  sharedDriverFor,
  type SharedClockDriver,
  type SharedTickTarget,
} from './shared-clock-driver.js'
import {
  createDocumentVisibility,
  type Visibility,
} from './visibility.js'

type ElapsedListener = (elapsed: number) => void

export type StopwatchOptions = {
  precisionMs?: number
  visibility?: Visibility | false
}

export class Stopwatch implements Store<number> {
  readonly #clock: Clock
  readonly #precisionMs: number | undefined
  readonly #visibility: Visibility | undefined
  readonly #driver: SharedClockDriver
  readonly #tickTarget: SharedTickTarget
  #accumulated = 0
  #startTime: number | undefined
  #running = false
  #suspended = false
  #listeners = new Set<ElapsedListener>()
  #notifySnapshot: ElapsedListener[] = []
  #destroyed = false
  #lastNotifiedBucket: number | undefined
  #unsubscribeVisibility: (() => void) | undefined

  constructor(clock?: Clock, options?: StopwatchOptions) {
    this.#clock = clock ?? detectClock()
    const precisionMs = options?.precisionMs
    if (precisionMs !== undefined) {
      if (!Number.isFinite(precisionMs) || precisionMs <= 0) {
        throw new Error('precisionMs must be a finite number > 0')
      }
      this.#precisionMs = precisionMs
    }
    const visibilityOption = options?.visibility
    if (visibilityOption === false) {
      this.#visibility = undefined
    } else if (visibilityOption !== undefined) {
      this.#visibility = visibilityOption
    } else {
      this.#visibility = createDocumentVisibility()
    }
    this.#driver = sharedDriverFor(this.#clock)
    this.#tickTarget = {
      onSharedTick: (): void => {
        this.#onTick()
      },
      wantsSharedTicks: (): boolean =>
        this.#running && !this.#destroyed && !this.#suspended,
    }
  }

  get running(): boolean {
    return this.#running
  }

  start(): void {
    if (this.#destroyed || this.#running) {
      return
    }
    this.#running = true
    this.#startTime = this.#clock.now()
    this.#attachVisibility()
    this.#syncSuspension()
    this.#notifyListeners(true)
    this.#ensureTicking()
  }

  stop(): void {
    if (this.#destroyed || !this.#running) {
      return
    }
    this.#cancelTick()
    const startTime = this.#startTime
    if (startTime !== undefined) {
      this.#accumulated += this.#clock.now() - startTime
    }
    this.#startTime = undefined
    this.#running = false
    this.#suspended = false
    this.#detachVisibility()
    this.#notifyListeners(true)
  }

  reset(): void {
    if (this.#destroyed) {
      return
    }
    const previous = this.get()
    this.#cancelTick()
    this.#accumulated = 0
    this.#startTime = undefined
    this.#running = false
    this.#suspended = false
    this.#lastNotifiedBucket = undefined
    this.#detachVisibility()
    if (previous !== 0) {
      this.#notifyListeners(true)
    }
  }

  get(): number {
    if (this.#running) {
      const startTime = this.#startTime
      if (startTime === undefined) {
        return this.#accumulated
      }
      return this.#accumulated + (this.#clock.now() - startTime)
    }
    return this.#accumulated
  }

  subscribe(listener: ElapsedListener): () => void {
    if (this.#destroyed) {
      return () => {}
    }
    this.#listeners.add(listener)
    let active = true
    return (): void => {
      if (!active) {
        return
      }
      active = false
      this.#listeners.delete(listener)
    }
  }

  destroy(): void {
    if (this.#destroyed) {
      return
    }
    if (this.#running) {
      this.#cancelTick()
      const startTime = this.#startTime
      if (startTime !== undefined) {
        this.#accumulated += this.#clock.now() - startTime
      }
      this.#startTime = undefined
      this.#running = false
      this.#suspended = false
    }
    this.#detachVisibility()
    this.#destroyed = true
    this.#listeners.clear()
  }

  #attachVisibility(): void {
    if (this.#visibility === undefined || this.#unsubscribeVisibility !== undefined) {
      return
    }
    this.#unsubscribeVisibility = this.#visibility.subscribe(() => {
      this.#onVisibilityChange()
    })
  }

  #detachVisibility(): void {
    this.#unsubscribeVisibility?.()
    this.#unsubscribeVisibility = undefined
  }

  #onVisibilityChange(): void {
    if (this.#destroyed || !this.#running) {
      return
    }
    const wasSuspended = this.#suspended
    this.#syncSuspension()
    if (this.#suspended) {
      this.#cancelTick()
      return
    }
    if (wasSuspended) {
      this.#notifyListeners(true)
      this.#ensureTicking()
    }
  }

  #syncSuspension(): void {
    this.#suspended =
      this.#visibility !== undefined && this.#visibility.state() === 'hidden'
  }

  #ensureTicking(): void {
    if (!this.#running || this.#destroyed || this.#suspended) {
      return
    }
    this.#driver.register(this.#tickTarget)
  }

  #cancelTick(): void {
    this.#driver.unregister(this.#tickTarget)
  }

  #onTick(): void {
    if (!this.#running || this.#destroyed || this.#suspended) {
      return
    }
    this.#notifyListeners(false)
  }

  #notifyListeners(force: boolean): void {
    const elapsed = this.get()
    const precisionMs = this.#precisionMs
    if (precisionMs !== undefined && !force) {
      const bucket = Math.floor(elapsed / precisionMs)
      if (bucket === this.#lastNotifiedBucket) {
        return
      }
      this.#lastNotifiedBucket = bucket
    } else if (precisionMs !== undefined) {
      this.#lastNotifiedBucket = Math.floor(elapsed / precisionMs)
    }

    const snapshot = this.#notifySnapshot
    snapshot.length = 0
    for (const listener of this.#listeners) {
      snapshot.push(listener)
    }
    for (const listener of snapshot) {
      if (!this.#listeners.has(listener)) {
        continue
      }
      try {
        listener(elapsed)
      } catch {
      }
    }
  }
}
