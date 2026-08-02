<script setup lang="ts">
import { ref } from 'vue'
import { useStopwatch } from '@watchstop/vue'

const { elapsed, start, stop, reset } = useStopwatch()
const running = ref(false)

const toggleRun = () => {
  if (running.value) {
    stop()
    running.value = false
    return
  }
  start()
  running.value = true
}

const resetIdle = () => {
  reset()
  running.value = false
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
      <button type="button" @click="resetIdle">Reset</button>
    </div>
  </div>
</template>
