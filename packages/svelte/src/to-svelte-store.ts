import type { Store } from '@watchstop/core'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'

export function toSvelteStore<T>(store: Store<T>): Readable<T> {
  return {
    subscribe(listener: Subscriber<T>): Unsubscriber {
      listener(store.get())
      return store.subscribe(listener)
    },
  }
}
