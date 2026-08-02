import { render } from '@qwik.dev/core'
import { QwikTimer } from './QwikTimer'

const host = document.querySelector('[data-qwik-timer]')
if (host) {
  render(host, <QwikTimer />)
}
