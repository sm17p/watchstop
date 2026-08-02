import { Component, signal } from '@angular/core'
import { injectStopwatch } from '@watchstop/angular'

@Component({
  selector: 'app-timer',
  standalone: true,
  template: `
    <div class="timer">
      <p class="brand">angular</p>
      <p class="elapsed">{{ Math.floor(elapsed()) }} ms</p>
      <div class="controls">
        <button type="button" (click)="toggleRun()">
          {{ running() ? 'Stop' : 'Start' }}
        </button>
        <button type="button" (click)="resetIdle()">Reset</button>
      </div>
    </div>
  `,
})
export class Timer {
  readonly binding = injectStopwatch()
  readonly elapsed = this.binding.elapsed
  readonly running = signal(false)
  readonly Math = Math

  toggleRun(): void {
    if (this.running()) {
      this.binding.stop()
      this.running.set(false)
      return
    }
    this.binding.start()
    this.running.set(true)
  }

  resetIdle(): void {
    this.binding.reset()
    this.running.set(false)
  }
}
