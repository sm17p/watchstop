import type { Clock } from './clock.js'
import type { Store } from './store.js'
import { detectClock } from './detect-clock.js'

type ElapsedListener = (elapsed: number) => void

export class Stopwatch implements Store<number> {
  readonly #clock: Clock
  #accumulated = 0
  #startTime: number | undefined
  #running = false
  #handle: unknown
  #listeners = new Set<ElapsedListener>()
  #destroyed = false

  constructor(clock?: Clock) {
    this.#clock = clock ?? detectClock()
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
    this.#notifyListeners()
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
    this.#notifyListeners()
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
    if (previous !== 0) {
      this.#notifyListeners()
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
    this.#notifyListeners()
    if (!this.#running || this.#destroyed) {
      return
    }
    this.#scheduleTick()
  }

  #notifyListeners(): void {
    const elapsed = this.get()
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
