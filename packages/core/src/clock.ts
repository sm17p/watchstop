export interface Clock {
  now(): number
  schedule(callback: () => void): unknown
  cancel(handle: unknown): void
}
