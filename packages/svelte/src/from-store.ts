import type { Store } from '@watchstop/core'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'

export function fromStore<T>(store: Store<T>): Readable<T> {
  return {
    subscribe(run: Subscriber<T>): Unsubscriber {
      run(store.get())
      return store.subscribe(run)
    },
  }
}
