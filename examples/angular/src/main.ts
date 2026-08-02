import '@angular/compiler'
import { bootstrapApplication } from '@angular/platform-browser'
import { Timer } from './timer'
import './styles.css'

bootstrapApplication(Timer).catch((error: unknown) => {
  console.error(error)
})
