export function formatClockParts(elapsedMs: number): {
  minutes: string
  seconds: string
  centiseconds: string
  totalMs: number
} {
  const totalMs = Math.max(0, Math.floor(elapsedMs))
  const minutes = Math.floor(totalMs / 60_000)
  const seconds = Math.floor((totalMs % 60_000) / 1000)
  const centiseconds = Math.floor((totalMs % 1000) / 10)
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    centiseconds: String(centiseconds).padStart(2, '0'),
    totalMs,
  }
}
