import type { Store } from '@watchstop/core'
import { onScopeDispose, shallowRef, type ShallowRef } from 'vue'

export function useStore<T>(store: Store<T>): Readonly<ShallowRef<T>> {
  const latestValue = shallowRef(store.get())
  const unsubscribe = store.subscribe((value) => {
    latestValue.value = value
  })
  onScopeDispose(unsubscribe)
  return latestValue
}
