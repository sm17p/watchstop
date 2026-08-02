<script setup lang="ts">
import { useStopwatch } from '@watchstop/vue'

const { elapsed, running, start, stop, reset } = useStopwatch()

const toggleRun = () => {
  if (running.value) {
    stop()
    return
  }
  start()
}
</script>

<template>
  <div class="island-face">
    <p class="label">vue</p>
    <p class="elapsed">{{ Math.floor(elapsed) }} ms</p>
    <div class="controls">
      <button type="button" @click="toggleRun">
        {{ running ? 'Stop' : 'Start' }}
      </button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </div>
</template>
