import type { Store } from '@watchstop/core'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'

export function toSvelteStore<T>(store: Store<T>): Readable<T> & {
  listen(onValue: (value: T) => void): Unsubscriber
} {
  const listeners = new Set<(value: T) => void>()
  let unsubscribeCore: Unsubscriber | undefined

  const retain = (listener: (value: T) => void): Unsubscriber => {
    listeners.add(listener)
    unsubscribeCore ??= store.subscribe((value) => {
      const snapshot = [...listeners]
      for (const current of snapshot) {
        if (!listeners.has(current)) {
          continue
        }
        try {
          current(value)
        } catch {
        }
      }
    })
    let active = true
    return (): void => {
      if (!active) {
        return
      }
      active = false
      listeners.delete(listener)
      if (listeners.size > 0 || unsubscribeCore === undefined) {
        return
      }
      unsubscribeCore()
      unsubscribeCore = undefined
    }
  }

  const subscribe = (listener: Subscriber<T>): Unsubscriber => {
    listener(store.get())
    return retain(listener)
  }

  const listen = (onValue: (value: T) => void): Unsubscriber => retain(onValue)

  return { subscribe, listen }
}
