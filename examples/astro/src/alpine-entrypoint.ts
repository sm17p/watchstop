import type { Alpine } from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'

export default (Alpine: Alpine) => {
  Alpine.data('timer', () => {
    const binding = createStopwatch()
    return {
      ...binding,
      toggleRun() {
        if (this.running) {
          this.stop()
          return
        }
        this.start()
      },
    }
  })
}
