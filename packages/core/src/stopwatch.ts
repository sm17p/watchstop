import type { Clock } from './clock.js'
import type { Store } from './store.js'
import { detectClock } from './detect-clock.js'

type ElapsedListener = (elapsed: number) => void

export type StopwatchOptions = {
  precisionMs?: number
}

export class Stopwatch implements Store<number> {
  readonly #clock: Clock
  readonly #precisionMs: number | undefined
  #accumulated = 0
  #startTime: number | undefined
  #running = false
  #handle: unknown
  #listeners = new Set<ElapsedListener>()
  #destroyed = false
  #lastNotifiedBucket: number | undefined

  constructor(clock?: Clock, options?: StopwatchOptions) {
    this.#clock = clock ?? detectClock()
    const precisionMs = options?.precisionMs
    if (precisionMs !== undefined) {
      if (!Number.isFinite(precisionMs) || precisionMs <= 0) {
        throw new RangeError('precisionMs must be a finite number > 0')
      }
      this.#precisionMs = precisionMs
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
    this.#scheduleTick()
    this.#notifyListeners(true)
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
    this.#lastNotifiedBucket = undefined
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
    }
    this.#destroyed = true
    this.#listeners.clear()
  }

  #scheduleTick(): void {
    this.#handle = this.#clock.schedule(() => {
      this.#onTick()
    })
  }

  #cancelTick(): void {
    if (this.#handle !== undefined) {
      this.#clock.cancel(this.#handle)
      this.#handle = undefined
    }
  }

  #onTick(): void {
    this.#handle = undefined
    if (!this.#running || this.#destroyed) {
      return
    }
    this.#notifyListeners(false)
    if (!this.#running || this.#destroyed) {
      return
    }
    this.#scheduleTick()
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

    const snapshot = [...this.#listeners]
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
