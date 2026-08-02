import { useStopwatch } from '@watchstop/react'

export default function ReactTimer() {
  const { elapsed, start, stop, reset } = useStopwatch()

  return (
    <div className="island-face">
      <p className="label">react</p>
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
