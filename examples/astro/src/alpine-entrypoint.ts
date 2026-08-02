import type { Alpine } from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'

export default (Alpine: Alpine) => {
  Alpine.data('timer', () => {
    const binding = createStopwatch()
    return {
      ...binding,
      running: false,
      toggleRun() {
        if (this.running) {
          this.stop()
          this.running = false
          return
        }
        this.start()
        this.running = true
      },
      resetIdle() {
        this.reset()
        this.running = false
      },
    }
  })
}
