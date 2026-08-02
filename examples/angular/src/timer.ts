import { Component } from '@angular/core'
import { injectStopwatch } from '@watchstop/angular'

@Component({
  selector: 'app-timer',
  standalone: true,
  template: `
    <div class="timer">
      <p class="brand">angular</p>
      <p class="elapsed">{{ Math.floor(elapsed()) }} ms</p>
      <div class="controls">
        <button type="button" (click)="start()">Start</button>
        <button type="button" (click)="stop()">Stop</button>
        <button type="button" (click)="reset()">Reset</button>
      </div>
    </div>
  `,
})
export class Timer {
  readonly binding = injectStopwatch()
  readonly elapsed = this.binding.elapsed
  readonly start = this.binding.start
  readonly stop = this.binding.stop
  readonly reset = this.binding.reset
  readonly Math = Math
}
