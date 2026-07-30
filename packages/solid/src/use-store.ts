import type { Store } from '@watchstop/core'
import { createSignal, onCleanup, type Accessor } from 'solid-js'

export function useStore<T>(store: Store<T>): Accessor<T> {
  const [value, setValue] = createSignal(store.get())
  onCleanup(
    store.subscribe((next) => {
      setValue(() => next)
    }),
  )
  return value
}
