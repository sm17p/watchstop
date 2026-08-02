import { useStopwatch } from '@watchstop/react'

export default function ReactTimer() {
  const { elapsed, running, start, stop, reset } = useStopwatch()

  const toggleRun = () => {
    if (running) {
      stop()
      return
    }
    start()
  }

  return (
    <div className="island-face">
      <p className="label">react</p>
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
