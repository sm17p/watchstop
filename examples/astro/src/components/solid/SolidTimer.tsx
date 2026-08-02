import { createSignal } from 'solid-js'
import { useStopwatch } from '@watchstop/solid'

export default function SolidTimer() {
  const { elapsed, start, stop, reset } = useStopwatch()
  const [running, setRunning] = createSignal(false)

  const toggleRun = () => {
    if (running()) {
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
    <div class="island-face">
      <p class="label">solid</p>
      <p class="elapsed">{Math.floor(elapsed())} ms</p>
      <div class="controls">
        <button type="button" onClick={toggleRun}>
          {running() ? 'Stop' : 'Start'}
        </button>
        <button type="button" onClick={resetIdle}>
          Reset
        </button>
      </div>
    </div>
  )
}
