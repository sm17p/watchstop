<script lang="ts">
  import { createStopwatch } from '@watchstop/svelte'

  const stopwatch = createStopwatch()
  let running = $state(false)

  const toggleRun = () => {
    if (running) {
      stopwatch.stop()
      running = false
      return
    }
    stopwatch.start()
    running = true
  }

  const resetIdle = () => {
    stopwatch.reset()
    running = false
  }
</script>

<div class="island-face">
  <p class="label">svelte</p>
  <p class="elapsed">{Math.floor($stopwatch)} ms</p>
  <div class="controls">
    <button type="button" onclick={toggleRun}>{running ? 'Stop' : 'Start'}</button>
    <button type="button" onclick={resetIdle}>Reset</button>
  </div>
</div>
