import { render } from 'solid-js/web'
import { Timer } from './Timer'
import './styles.css'

const root = document.querySelector('#root')
if (!root) {
  throw new Error('Missing #root')
}

render(() => <Timer />, root)
