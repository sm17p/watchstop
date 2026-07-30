import type { Store } from '@watchstop/core'
import { onScopeDispose, shallowRef, type ShallowRef } from 'vue'

export function useStore<T>(store: Store<T>): Readonly<ShallowRef<T>> {
  const value = shallowRef(store.get())
  const unsubscribe = store.subscribe((next) => {
    value.value = next
  })
  onScopeDispose(unsubscribe)
  return value
}
