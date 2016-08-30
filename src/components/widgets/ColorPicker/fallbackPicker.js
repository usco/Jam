import {html} from 'snabbdom-jsx'
import { h } from '@cycle/dom'

require('./style.css')

export default function FallbackPicker () {
  const baseColors = {
    'red': [255, 0, 0],
    'pink': [255, 0, 255],
    'blue': [0, 0, 255],
    'turquois': [0, 255, 255],
    'green': [0, 255, 0],
    'yellow': [255, 255, 0],
    'orange': [255, 102, 0],
    'black': [0, 0, 0]
  }

  function componentToHex (rgbPosition) {
    // translate the seperate rgb postions (0 -> 255) to its hex format
    var hex = rgbPosition.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  function getColors () {
    // creates a range for every basecolor. Does this by dividing the range (255 per primary color -> rgb)
    // into steps and adding the steprange for every step untill it all adds up to white (we don't show the last step)
    const steps = 8
    const stepRange = 32
    let htmlCodes = []
    for (let color in baseColors) {
      let rgb = baseColors[color] // array
      let hex = []
      for (let i = 0; i < steps; i++) { // always 1 less then the number of steps because last step is white for all
        for (let j = 0; j < 3; j++) {
          hex[j] = componentToHex(rgb[j])

          // from here we take it up a notch (make the color lighter by adding a the stepRange)
          if (rgb[j] < 255) {
            rgb[j] += stepRange
          }
          if (rgb[j] > 255) {
            // fallback for calculation differences because 255 / 66 does not devide to a round number
            rgb[j] = 255
          }
        }
        let htmlCode = '#' + hex.join('')
        htmlCodes.push(htmlCode)
      }
    }
    return htmlCodes
  }

  const colorGrid = getColors()
    .map(function(color){
      return h('div.colorPickerSquare',{style:{backgroundColor:color},attrs: {'data-color': color}},[])
    })

  const picker = <div className='colorGridWrapper'>
    {colorGrid}
  </div>
  return picker
}
