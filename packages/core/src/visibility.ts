export type VisibilityState = 'visible' | 'hidden'

export type Visibility = {
  state(): VisibilityState
  subscribe(listener: () => void): () => void
}

export type MockVisibility = Visibility & {
  setState(state: VisibilityState): void
}

export function createMockVisibility(
  initialState: VisibilityState = 'visible',
): MockVisibility {
  let currentState = initialState
  const listeners = new Set<() => void>()

  const state = (): VisibilityState => currentState

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    let active = true
    return (): void => {
      if (!active) {
        return
      }
      active = false
      listeners.delete(listener)
    }
  }

  const setState = (nextState: VisibilityState): void => {
    if (nextState === currentState) {
      return
    }
    currentState = nextState
    for (const listener of [...listeners]) {
      if (!listeners.has(listener)) {
        continue
      }
      try {
        listener()
      } catch {
      }
    }
  }

  return { state, subscribe, setState }
}

export function createDocumentVisibility(): Visibility | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const state = (): VisibilityState =>
    document.visibilityState === 'hidden' ? 'hidden' : 'visible'

  const subscribe = (listener: () => void): (() => void) => {
    const onVisibilityChange = (): void => {
      listener()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return (): void => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }

  return { state, subscribe }
}
