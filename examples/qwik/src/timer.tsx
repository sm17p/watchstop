import { component$ } from '@qwik.dev/core'
import { useStopwatch } from '@watchstop/qwik'

export const Timer = component$(() => {
  const { elapsed, running, stopwatch } = useStopwatch()

  return (
    <div class="timer">
      <p class="brand">qwik</p>
      <p class="elapsed">{Math.floor(elapsed.value)} ms</p>
      <div class="controls">
        <button
          type="button"
          onClick$={() => {
            if (running.value) {
              stopwatch.stop()
              return
            }
            stopwatch.start()
          }}
        >
          {running.value ? 'Stop' : 'Start'}
        </button>
        <button
          type="button"
          onClick$={() => {
            stopwatch.reset()
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
})
