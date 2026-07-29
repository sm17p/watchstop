export interface Store<T> {
  get(): T
  subscribe(listener: (value: T) => void): () => void
}
