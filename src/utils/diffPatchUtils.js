import {toArray} from './utils'


function compareHash(obj){
  if(obj.uuid) return obj.uuid
    //return JSON.stringify(obj)
  //return typeof(obj)+obj.name
}

let jsondiffpatch = require('jsondiffpatch').create({objectHash:compareHash})

export function extractChanges(prev, cur){
    let delta = jsondiffpatch.diff(prev, cur)
    //console.log("delta",delta)
    
    let result = {added:[],removed:[],changed:[]}

    if(delta && "_t" in delta){
        
        let removed = []//delta["_0"][0]//delta[0][0]
        let added = []//delta[0][0]//delta[0][1]

        Object.keys(delta).map(function(key){
          //console.log("AAA",key)
          if(key[0]=="_"){
            if(key!=="_a" && key !=="_t")
            {
              removed.push(delta[key][0])
            }
          }else{
            added.push(delta[key][0])
          }

        })
        
        result.added = toArray(added).filter(i=>i!==undefined)
        result.removed = toArray(removed).filter(i=>i!==undefined)

        //console.log("added",result.added)
        //console.log("removed",result.removed)
    }else if(prev === undefined){//not handled right in the above case for some reason ??
      result.added = cur
    }

    return result
  }



export function transformEquals(a,b){
    if(!a || !b) return true
    for(let j=0;j<a.length;j++){
      if(a[j]!==b[j]){
        return false
      }
    }
    return true
  }

export function colorsEqual(a,b){
    if(!a || !b) return true
    return a===b
  }


export function entityVisualComparer(prev,cur){
    //console.log("prev",prev,"cur",cur)

    if (!cur)
      return false

    // compare lengths - can save a lot of time 
    if (cur.length != prev.length)
      return false

    let sortedCur  = cur.sort()
    let sortedPrev = prev.sort()
    for(var i=0;i<cur.length;i++){
      if(sortedCur[i].typeUid !== sortedPrev[i].typeUid) 
        return false

      if(sortedCur[i].id !== sortedPrev[i].id) 
        return false

     
      let curVal = sortedCur[i]
      let preVal = sortedPrev[i]

      /*
        sortedCur[i].color === sortedPrev[i].color
        )*/

      let posEq = transformEquals( curVal.pos, preVal.pos )
      let rotEq = transformEquals( curVal.rot, preVal.rot )
      let scaEq = transformEquals( curVal.sca, preVal.sca )
      let colEq = colorsEqual( curVal.color, preVal.color )
      let allEqual = (posEq && rotEq && scaEq && colEq)
      if(!allEqual) return false
    }

    return true 
  }