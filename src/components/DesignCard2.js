import Cycle from 'cycle-react'
let React = Cycle.React
let {Rx} = Cycle
import Class from 'classnames'

import {trim} from '../utils/utils'
import {preventDefault,isTextNotEmpty,formatData,exists} from '../utils/obsUtils'
import EditableItem from './EditableItem2'


function DesignCard(props,interactions){



  function view(){

    return <div> </div>

  }


  return Rx.Observable.just("").map(view)

}



let DesignCard = Cycle.component('DesignCard',DesignCard)
export default DesignCard