import { component$, useSignal } from '@qwik.dev/core'
import { useStopwatch } from '@watchstop/qwik'

export const Timer = component$(() => {
  const { elapsed, start, stop, reset } = useStopwatch()
  const running = useSignal(false)

  return (
    <div class="timer">
      <p class="brand">qwik</p>
      <p class="elapsed">{Math.floor(elapsed.value)} ms</p>
      <div class="controls">
        <button
          type="button"
          onClick$={() => {
            if (running.value) {
              stop()
              running.value = false
              return
            }
            start()
            running.value = true
          }}
        >
          {running.value ? 'Stop' : 'Start'}
        </button>
        <button
          type="button"
          onClick$={() => {
            reset()
            running.value = false
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
})
