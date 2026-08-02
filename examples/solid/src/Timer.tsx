import { useStopwatch } from '@watchstop/solid'

export function Timer() {
  const { elapsed, start, stop, reset } = useStopwatch()

  return (
    <div class="timer">
      <p class="brand">solid</p>
      <p class="elapsed">{Math.floor(elapsed())} ms</p>
      <div class="controls">
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
