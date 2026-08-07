<script lang="ts">
  import { getContext } from 'svelte'
  import type { Clock, Stopwatch } from '@watchstop/core'
  import { createStopwatch, type StopwatchStore } from './create-stopwatch.js'

  const borrowed: Stopwatch | undefined = getContext('stopwatch')
  const clock: Clock | undefined = getContext('clock')
  const publishStopwatch: (store: StopwatchStore) => void =
    getContext('publishStopwatch')

  const stopwatch =
    borrowed === undefined
      ? createStopwatch({ clock })
      : createStopwatch({ stopwatch: borrowed })
  publishStopwatch(stopwatch)
</script>

<output>{$stopwatch}</output>
