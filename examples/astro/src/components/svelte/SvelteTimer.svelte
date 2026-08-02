<script lang="ts">
  import { createStopwatch } from '@watchstop/svelte'

  const stopwatch = createStopwatch()
</script>

<div class="island-face">
  <p class="label">svelte</p>
  <p class="elapsed">{Math.floor($stopwatch)} ms</p>
  <div class="controls">
    <button type="button" onclick={stopwatch.start}>Start</button>
    <button type="button" onclick={stopwatch.stop}>Stop</button>
    <button type="button" onclick={stopwatch.reset}>Reset</button>
  </div>
</div>
