import type { Store } from '@watchstop/core'
import { createSignal, onCleanup, type Accessor } from 'solid-js'

export function useStore<T>(
  store: Store<T>,
  onNotified?: (value: T) => void,
): Accessor<T> {
  const [readValue, setValue] = createSignal(store.get())
  onCleanup(
    store.subscribe((value) => {
      setValue(() => value)
      onNotified?.(value)
    }),
  )
  return readValue
}
