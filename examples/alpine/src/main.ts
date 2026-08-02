import Alpine from 'alpinejs'
import { createStopwatch } from '@watchstop/alpine'
import './styles.css'

Alpine.data('timer', () => createStopwatch())
Alpine.start()
