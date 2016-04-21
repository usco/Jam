import { remapJson, coerceTypes } from '../../../utils/utils'
import { pick } from 'ramda'

export default function intent (ym, params) {
  const bom$ = ym.data
    .filter(res => res.request.method === 'get' && res.request.type === 'ymLoad' && res.request.typeDetail === 'bom')
    .mergeAll()
    .pluck('response')

  const upsertBomEntries$ = bom$
    .map(function (data) {
      return data.map(function (entry) {
        const mapping = {
          'part_uuid': 'id',
          'part_version': 'version'
        }
        const typeMapping = {
          'qty': parseFloat,
          'phys_qty': parseFloat
        }
        const fieldNames = ['id', 'part_parameters', 'qty', 'phys_qty', 'unit']
        let data = pick(fieldNames, coerceTypes(typeMapping, remapJson(mapping, entry)))
        // FIXME: coerceTypes should be doing this !!

        return {id: data.id, data}
      })
    })
    // .tap(e => console.log('upsertBomEntries (from ym)', e))

  return {
    upsertBomEntries$
  }
}
