import { Component, signal } from '@angular/core'
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
      <button type="button" (click)="toggleRun()">
        {{ running() ? 'Stop' : 'Start' }}
      </button>
      <button type="button" (click)="resetIdle()">Reset</button>
    </div>
  `,
})
export class AngularTimer {
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
