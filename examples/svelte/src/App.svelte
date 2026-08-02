<script lang="ts">
  import { createStopwatch } from '@watchstop/svelte'

  const stopwatch = createStopwatch()
  const running = stopwatch.running

  const toggleRun = () => {
    if (stopwatch.stopwatch.running) {
      stopwatch.stop()
      return
    }
    stopwatch.start()
  }
</script>

<div class="timer">
  <p class="brand">svelte</p>
  <p class="elapsed">{Math.floor($stopwatch)} ms</p>
  <div class="controls">
    <button type="button" onclick={toggleRun}>{$running ? 'Stop' : 'Start'}</button>
    <button type="button" onclick={stopwatch.reset}>Reset</button>
  </div>
</div>
