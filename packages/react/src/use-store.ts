import { useRef, useSyncExternalStore } from 'react'
import type { Store } from '@watchstop/core'

export function useStore<T>(store: Store<T>): T {
  const snapshot = useRef({ value: store.get() })

  return useSyncExternalStore(
    (onStoreChange): (() => void) => {
      snapshot.current = { value: store.get() }
      return store.subscribe((value) => {
        snapshot.current = { value }
        onStoreChange()
      })
    },
    (): T => snapshot.current.value,
    (): T => store.get(),
  )
}
