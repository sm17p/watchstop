import type { Alpine } from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'

export default (Alpine: Alpine) => {
  Alpine.data('timer', () => createStopwatch())
}
