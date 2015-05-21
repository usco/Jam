import {createAction} from '../utils/obsUtils'

/*set transforms mode to given mode*/
//export let setTransformMode = createAction();
//FIXME: we should only have one for all of these, see above
export let setToTranslateMode$ = createAction();
export let setToRotateMode$   = createAction();
export let setToScaleMode$  = createAction();

/*
export function setTransformMode(mode) {

}

toRotateMode:function(){
    this.activeTool = this.activeTool === "rotate" ? null: "rotate";
  }, 
  toTranslateMode:function(){
    this.activeTool = this.activeTool === "translate" ? null: "translate";
  }, 
  toScaleMode:function(){
    this.activeTool = this.activeTool === "scale" ? null: "scale";
  }, 
*/