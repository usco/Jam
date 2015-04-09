import {List} from "immutable";
import {state} from "./state";
import atomo from 'atomo'

const history = atomo.atom(new List());

state.addWatch(function(atom, oldValue, newValue){


    console.log("foo", state.deref().toJS())
    history.swap((hs) => hs.push(oldValue));
});


export default history