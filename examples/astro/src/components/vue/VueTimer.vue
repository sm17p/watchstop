<script setup lang="ts">
import { useStopwatch } from '@watchstop/vue'

const { elapsed, start, stop, reset } = useStopwatch()
</script>

<template>
  <div class="island-face">
    <p class="label">vue</p>
    <p class="elapsed">{{ Math.floor(elapsed) }} ms</p>
    <div class="controls">
      <button type="button" @click="start">Start</button>
      <button type="button" @click="stop">Stop</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </div>
</template>
