import type { Store } from '@watchstop/core'
import { DestroyRef, inject, signal, type Signal } from '@angular/core'

export function useStore<T>(store: Store<T>): Signal<T> {
  const latestValue = signal(store.get())
  const unsubscribe = store.subscribe((value) => {
    latestValue.set(value)
  })
  inject(DestroyRef).onDestroy(unsubscribe)
  return latestValue.asReadonly()
}
