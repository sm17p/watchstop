import { Stopwatch } from '@watchstop/core'
import './styles.css'

const app = document.querySelector('#app')
if (!app) {
  throw new Error('Missing #app')
}

const stopwatch = new Stopwatch()

const elapsedNode = document.createElement('p')
elapsedNode.className = 'elapsed'
elapsedNode.textContent = '0 ms'

const brand = document.createElement('p')
brand.className = 'brand'
brand.textContent = 'core'

const toggleButton = document.createElement('button')
toggleButton.type = 'button'
toggleButton.textContent = 'Start'
toggleButton.addEventListener('click', () => {
  if (stopwatch.running) {
    stopwatch.stop()
  } else {
    stopwatch.start()
  }
})

const resetButton = document.createElement('button')
resetButton.type = 'button'
resetButton.textContent = 'Reset'
resetButton.addEventListener('click', () => {
  stopwatch.reset()
})

const controls = document.createElement('div')
controls.className = 'controls'
controls.append(toggleButton, resetButton)

const timer = document.createElement('div')
timer.className = 'timer'
timer.append(brand, elapsedNode, controls)
app.append(timer)

const paint = (elapsed: number) => {
  elapsedNode.textContent = `${Math.floor(elapsed)} ms`
  toggleButton.textContent = stopwatch.running ? 'Stop' : 'Start'
}

paint(stopwatch.get())
stopwatch.subscribe(paint)
