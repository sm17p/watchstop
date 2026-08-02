import { render } from '@qwik.dev/core'
import { Timer } from './timer'
import './styles.css'

export function bootstrap(): void {
  const app = document.querySelector('#app')
  if (!app) {
    throw new Error('Missing #app')
  }

  void render(app, <Timer />)
}
