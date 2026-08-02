import Alpine from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'
import './styles.css'

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
Alpine.start()
