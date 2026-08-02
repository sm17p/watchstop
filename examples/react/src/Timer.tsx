import { useStopwatch } from '@watchstop/react'

export function Timer() {
  const { elapsed, running, start, stop, reset } = useStopwatch()

  const toggleRun = () => {
    if (running) {
      stop()
      return
    }
    start()
  }

  return (
    <div className="timer">
      <p className="brand">react</p>
      <p className="elapsed">{Math.floor(elapsed)} ms</p>
      <div className="controls">
        <button type="button" onClick={toggleRun}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}
