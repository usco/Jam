import { h } from '@cycle/dom'
require('./style.css')

export default function renderProgressBar (state) {
  const defaults = {
    progress: 0,
    hideOnDone: true
  }
  const {progress, hideOnDone} = Object.assign({}, defaults, state)

  const element = (hideOnDone && progress === 100) ? h('div')
     : h('div.progressBar', [h('span.fill', { style: { width: `${progress}%` } })])
  return element
}
