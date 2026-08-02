import { component$ } from '@qwik.dev/core'
import { useStopwatch } from '@watchstop/qwik'

export const QwikTimer = component$(() => {
  const { elapsed, start, stop, reset } = useStopwatch()

  return (
    <>
      <p class="label">qwik</p>
      <p class="elapsed">{Math.floor(elapsed.value)} ms</p>
      <div class="controls">
        <button type="button" onClick$={start}>
          Start
        </button>
        <button type="button" onClick$={stop}>
          Stop
        </button>
        <button type="button" onClick$={reset}>
          Reset
        </button>
      </div>
    </>
  )
})
