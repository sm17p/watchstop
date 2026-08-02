import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Timer } from './Timer'
import './styles.css'

const root = document.querySelector('#root')
if (!root) {
  throw new Error('Missing #root')
}

createRoot(root).render(
  <StrictMode>
    <Timer />
  </StrictMode>,
)
