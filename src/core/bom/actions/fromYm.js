import {toArray, remapJson, coerceTypes} from '../../../utils/utils'
import {head, pick, equals} from 'ramda'


export default function intent(ym, params){
  const bom = ym
    .filter(res=>res.request.method==='get' && res.request.type === 'ymLoad' && res.request.typeDetail=== 'bom')
    .mergeAll()
    .pluck('response')

  const upsertBomEntries$ = bom
    .map(function(data){
      return data.map(function(entry) {
        const mapping = {
          'part_uuid':'id'
          ,'part_version':'version'
        }
        const typeMapping = {
          qty:parseFloat,
          phys_qty:parseFloat,
        }
        const fieldNames = ['id','part_parameters','qty','phys_qty','unit']
        const data = pick( fieldNames, coerceTypes(typeMapping,remapJson(mapping, entry)) )
        return {id:data.id, data}
      })
    })
    .tap(e=>console.log("upsertBomEntries",e))

  return {
    upsertBomEntries$
  }
}
