import { Component } from '@angular/core'
import { injectStopwatch } from '@watchstop/angular'

@Component({
  selector: 'app-angular-timer',
  standalone: true,
  host: {
    class: 'island-face',
  },
  styles: `
    :host {
      display: grid;
      gap: var(--space-sm, 0.85rem);
      width: 100%;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-start;
      gap: var(--space-xs, 0.55rem);
      width: 100%;
    }

    button {
      flex: 0 0 auto;
      width: auto;
    }
  `,
  template: `
    <p class="label">angular</p>
    <p class="elapsed">{{ Math.floor(elapsed()) }} ms</p>
    <div class="controls">
      <button type="button" (click)="start()">Start</button>
      <button type="button" (click)="stop()">Stop</button>
      <button type="button" (click)="reset()">Reset</button>
    </div>
  `,
})
export class AngularTimer {
  readonly binding = injectStopwatch()
  readonly elapsed = this.binding.elapsed
  readonly start = this.binding.start
  readonly stop = this.binding.stop
  readonly reset = this.binding.reset
  readonly Math = Math
}
