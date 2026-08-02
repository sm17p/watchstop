import { useStopwatch } from '@watchstop/solid'

export function Timer() {
  const { elapsed, running, start, stop, reset } = useStopwatch()

  const toggleRun = () => {
    if (running()) {
      stop()
      return
    }
    start()
  }

  return (
    <div class="timer">
      <p class="brand">solid</p>
      <p class="elapsed">{Math.floor(elapsed())} ms</p>
      <div class="controls">
        <button type="button" onClick={toggleRun}>
          {running() ? 'Stop' : 'Start'}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  )
}
