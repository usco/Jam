import ColorPicker from '../widgets/ColorPicker'

export function colorPickerWrapper (state$, DOM) {
  console.log('making colorPicker')
  const props$ = // just({color:"#FF00FF"})
  state$.map(function (state) {
    let {meta, transforms} = state

    if (!meta || !transforms) {
      return undefined
    }
    if (transforms.length > 0) transforms = transforms[0]
    if (meta.length > 0) meta = meta[0]

    return {color: meta.color}
  })

  return ColorPicker({DOM, props$})
}
