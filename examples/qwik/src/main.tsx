import { render } from '@qwik.dev/core'
import { Timer } from './timer'
import './styles.css'

const app = document.querySelector('#app')
if (!app) {
  throw new Error('Missing #app')
}

render(app, <Timer />)
