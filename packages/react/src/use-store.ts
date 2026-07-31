import { useRef, useSyncExternalStore } from 'react'
import type { Store } from '@watchstop/core'

export function useStore<T>(store: Store<T>): T {
  const notifiedValue = useRef(store.get())

  return useSyncExternalStore(
    (scheduleRerender): (() => void) => {
      notifiedValue.current = store.get()
      return store.subscribe((value) => {
        notifiedValue.current = value
        scheduleRerender()
      })
    },
    (): T => notifiedValue.current,
    (): T => store.get(),
  )
}
