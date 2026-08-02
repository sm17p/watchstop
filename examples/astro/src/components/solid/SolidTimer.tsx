import { useStopwatch } from '@watchstop/solid'

export default function SolidTimer() {
  const { elapsed, start, stop, reset } = useStopwatch()

  return (
    <div class="island-face">
      <p class="label">solid</p>
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
