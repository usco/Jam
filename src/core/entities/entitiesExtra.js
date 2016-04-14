import Rx from 'rx'
const { just } = Rx.Observable
import { find, propEq } from 'ramda'

import { nameCleanup } from '../../utils/formatters'
import { generateUUID, exists, toArray } from '../../utils/utils'
import { mergeData } from '../../utils/modelUtils'

export default function (actions, entityTypes$, assembly$) {
  /*
  //addInstanceCandidates => -------------------------
  //addType               => --T----------------------
  */

  const addInstancesCandidates$ = actions.entityActions.addInstanceCandidates$
    // .filter(data=>data.meta.id === undefined)
    .combineLatest(entityTypes$, function (candidateData, types) {
      const meshName = nameCleanup(candidateData.meta.name)
      return find(propEq('name', meshName))(types)
    })
    .filter(exists)
    .filter(candidate => candidate.mesh !== undefined)
    // .tap(e=>console.log("addInstancesCandidates",e))
    .map(toArray)
    .take(1)
    .repeat()

  // create various components' baseis

  const componentBase$ = addInstancesCandidates$
    .combineLatest(assembly$, function (newTypes, assemblyId) {
      return {newTypes, assemblyId}
    })
    .map(function ({newTypes, assemblyId}) {
      return newTypes.map(function (typeData) {
        let instUid = generateUUID()
        let typeUid = typeData.id
        let instName = typeData.name + '_' + instUid

        let instanceData = {
          id: instUid,
          typeUid,
          name: instName,
          assemblyId
        }
        return instanceData
      })
    })
    .withLatestFrom(entityTypes$, function (instances, types) {
      let data = instances.map(function (instance) {
        let instUid = instance.id
        let typeUid = instance.typeUid
        let assemblyId = instance.assemblyId

        // is this a hack?
        let entry = find(propEq('id', typeUid))(types)
        let mesh = entry.mesh
        let bbox = mesh.boundingBox
        let zOffset = bbox.max.clone().sub(bbox.min)
        zOffset = zOffset.z / 2
        bbox = { min: bbox.min.toArray(), max: bbox.max.toArray() }

        // injecting data like this is the right way ?
        mesh.material = mesh.material.clone()
        mesh = mesh.clone()

        return {
          instUid,
          typeUid,
          assemblyId,
          instance,
          mesh,
          zOffset,
          bbox
        }
      })

      return data
    })
    .shareReplay(1)

  const createMeshComponents$ = actions.entityActions.createMeshComponents$
    .combineLatest(entityTypes$, function (meshComponents, types) {
      return meshComponents.map(function (component) {
        if (component.data) {
          return component
        } else {
          const {typeUid} = component
          let entry = find(propEq('id', typeUid))(types)
          if (entry && entry.mesh) {
            let mesh = entry.mesh
            // let bbox = mesh.boundingBox
            // let zOffset = bbox.max.clone().sub(bbox.min)
            // zOffset = zOffset.z/2
            // bbox = { min:bbox.min.toArray(), max:bbox.max.toArray() }

            // injecting data like this is the right way ?
            mesh.material = mesh.material.clone()
            mesh = mesh.clone()
            return mergeData({}, component, {value: {mesh}})
          } else {
            return component
          }
        }
      }).filter(data => data.value !== undefined)
    })

  return {
    componentBase$,
    createMeshComponents$,
    assembly$
  }
}
