import { useCallback, useRef, useSyncExternalStore } from 'react'
import type { Store } from '@watchstop/core'

export function useStore<T>(store: Store<T>): T {
  const notifiedValue = useRef(store.get())

  const subscribe = useCallback(
    (scheduleRerender: () => void): (() => void) => {
      notifiedValue.current = store.get()
      return store.subscribe((value) => {
        notifiedValue.current = value
        scheduleRerender()
      })
    },
    [store],
  )

  const readSnapshot = useCallback((): T => notifiedValue.current, [])

  const readServerSnapshot = useCallback((): T => store.get(), [store])

  return useSyncExternalStore(subscribe, readSnapshot, readServerSnapshot)
}
