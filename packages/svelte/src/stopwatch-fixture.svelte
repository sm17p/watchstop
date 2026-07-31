<script lang="ts">
  import { getContext } from 'svelte'
  import type { Clock } from '@watchstop/core'
  import { createStopwatch, type StopwatchStore } from './create-stopwatch.js'

  const clock: Clock = getContext('clock')
  const publishStopwatch: (store: StopwatchStore) => void =
    getContext('publishStopwatch')

  const stopwatch = createStopwatch({ clock })
  publishStopwatch(stopwatch)
</script>

<output>{$stopwatch}</output>
