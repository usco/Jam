import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import EditableItem from './EditableItem2'




function removeTag(tags, tag){
  let idx = tags.indexOf(tag)
  if(idx>-1){ 
    let tags = Object.assign([],tags)
    tags.splice(idx,1)
    //updateDesign$({tags:tags})
  }
}

function addLicense(licenses, license){
  let selectedLicense = license//input.options[input.selectedIndex].value

  let licenses = Object.assign([], licenses)
  if(licenses.indexOf(selectedLicense)===-1){
    licenses.push(selectedLicense)
    //updateDesign$({licenses:licenses})
  }

  //let selectedLicense = selectedLicense
}


function DesignCard(props,interactions){



  function view(){

    return <div> </div>

  }


  return Rx.Observable.just("").map(view)

}



let DesignCard = Cycle.component('DesignCard',DesignCard)
export default DesignCard