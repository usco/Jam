import { pick } from 'ramda'
import { remapJson } from '../../utils/utils'

export default function formatDataForFileStorage ({sources, state$}, bom) {

  const fieldNames = [ 'part_uuid', 'name', 'qty', 'phys_qty', 'unit', 'printable' ] // , 'version' ]
  const mapping = {
    'id': 'part_uuid'
  }

  function formatBomAsPlainText (data) {
    const result = // 'Bill Of Materials:\n' +
    data.map(function (entry) {
      const phys_qty = entry.phys_qty > 0 ? entry.phys_qty + ' ' : ''
      const unit = entry.unit === 'EA' ? '' : entry.unit + ' '
      return `- ${entry.qty} X ${phys_qty}${unit}${entry.name} (Part Id : ${entry.part_uuid})`
    })
      .join('\n')

    return result
  }

  const bomJsonOutput$ = bom
    .fileStorage
    .exportBOMAsJson$
    .withLatestFrom(state$.pluck('bom'), (_, bom) => bom)
    .map(function (bom) {
      return bom.map(entry => pick(fieldNames, remapJson(mapping, entry)))
    })
    .map(JSON.stringify)
    .map(bom => ({data: bom, type: 'json', name: 'bom.json'}))

  const bomTextOutput$ = bom
    .fileStorage
    .exportBOMAsText$
    .withLatestFrom(state$.pluck('bom'), (_, bom) => bom)
    .map(function (bom) {
      return bom.map(entry => pick(fieldNames, remapJson(mapping, entry)))
    })
    .map(formatBomAsPlainText)
    .map(bom => ({data: bom, type: 'text', name: 'bom.md'}))

    return bomJsonOutput$.merge(bomTextOutput$)
}
