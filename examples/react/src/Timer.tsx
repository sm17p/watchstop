import { useStopwatch } from '@watchstop/react'

export function Timer() {
  const { elapsed, start, stop, reset } = useStopwatch()

  return (
    <div className="timer">
      <p className="brand">react</p>
      <p className="elapsed">{Math.floor(elapsed)} ms</p>
      <div className="controls">
        <button type="button" onClick={start}>
          Start
        </button>
        <button type="button" onClick={stop}>
          Stop
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}
