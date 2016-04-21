import { pick } from 'ramda'
import { jsonToFormData } from '../../utils/httpUtils'
import { mergeData } from '../../utils/modelUtils'
import { remapJson } from '../../utils/utils'

import assign from 'fast.js/object/assign' // faster object.assign

// helper to generate output data to parts
export function toParts (method = 'put', data) {
  const {designId, authToken, apiEndpoint} = data
  const entries = data._entries || []

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const partUri = `${designUri}/parts`

  const fieldNames = ['id', 'name', 'description', 'uuid']
  const mapping = {
    'id': 'uuid',
    'params': 'part_parameters'
  }

  /* "binary_document_id": null,
  "binary_document_url": "",
  "source_document_id": null,
  "source_document_url": "",]*/
  const requests = entries
    .map(function (entry) {
      const refined = pick(fieldNames, remapJson(mapping, entry))
      const send = jsonToFormData(refined)

      return {
        url: `${partUri}/${refined.uuid}${authTokenStr}`,
        method,
        send,
        type: 'ymSave',
        typeDetail: 'parts',
        mimeType: null, // 'application/json'
        responseType: 'json'
      }
    })
  return requests
}

// helper to generate output data to bom
export function toBom (method = 'put', data) {
  const {designId, authToken, apiEndpoint} = data
  const entries = data._entries || []

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`
  const bomUri = `${designUri}/bom`

  const fieldNames = ['qty', 'phys_qty', 'unit', 'part_uuid', 'part_parameters', 'part_version']
  const mapping = {
    'id': 'part_uuid',
    'params': 'part_parameters',
    'version': 'part_version'
  }

  const requests = entries.map(function (entry) {
    let outEntry = mergeData({}, entry)
    outEntry.qty = outEntry.qty - entry._qtyOffset // adjust quantity, removing any dynamic counts
    const refined = pick(fieldNames, remapJson(mapping, outEntry))
    const send = jsonToFormData(refined)

    return {
      url: `${bomUri}/${refined.part_uuid}${authTokenStr}`,
      method,
      send,
      type: 'ymSave',
      typeDetail: 'bom',
      mimeType: null, // 'application/json'
      responseType: 'json'
    }
  })
  return requests
}

// helper to generate output data to assemblies
export function toAssemblies (method = 'put', data) {
  const {designId, authToken, apiEndpoint} = data
  const entries = data._entries || []

  const authTokenStr = `/?auth_token=${authToken}`
  const designUri = `${apiEndpoint}/designs/${designId}`

  const fieldNames = ['uuid', 'name', 'color', 'pos', 'rot', 'sca', 'part_uuid']
  const mapping = {'id': 'uuid', 'typeUid': 'part_uuid'}
  const requests = entries.map(function (entry) {
    const refined = pick(fieldNames, remapJson(mapping, entry))
    const send = jsonToFormData(refined)

    // console.log('assemblies entry', entry)
    const assemblyId = entry.assemblyId// head(pluck('assemblyId', entries)) // head(entries).assemblyId
    const assembliesUri = `${designUri}/assemblies/${assemblyId}/entries`

    return {
      url: `${assembliesUri}/${refined.uuid}${authTokenStr}`,
      method,
      send,
      type: 'ymSave',
      typeDetail: 'assemblies'
    }
  })
  return requests
}

export function dataFromItems (items) {
  // console.log('items', items)
  return Object.keys(items.transforms).reduce(function (list, key) {
    const transforms = items['transforms'][key]
    const metadata = items['metadata'][key]

    if (transforms && metadata) {
      const entry = assign({}, transforms, metadata)
      list.push(entry)
    }
    return list
  }, [])
}
