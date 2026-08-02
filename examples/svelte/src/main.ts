import { mount } from 'svelte'
import App from './App.svelte'
import './styles.css'

const app = document.querySelector('#app')
if (!app) {
  throw new Error('Missing #app')
}

mount(App, { target: app })
