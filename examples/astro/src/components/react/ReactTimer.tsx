import { useState } from 'react'
import { useStopwatch } from '@watchstop/react'

export default function ReactTimer() {
  const { elapsed, start, stop, reset } = useStopwatch()
  const [running, setRunning] = useState(false)

  const toggleRun = () => {
    if (running) {
      stop()
      setRunning(false)
      return
    }
    start()
    setRunning(true)
  }

  const resetIdle = () => {
    reset()
    setRunning(false)
  }

  return (
    <div className="island-face">
      <p className="label">react</p>
      <p className="elapsed">{Math.floor(elapsed)} ms</p>
      <div className="controls">
        <button type="button" onClick={toggleRun}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button type="button" onClick={resetIdle}>
          Reset
        </button>
      </div>
    </div>
  )
}
