import Alpine from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'
import './styles.css'

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
Alpine.start()
