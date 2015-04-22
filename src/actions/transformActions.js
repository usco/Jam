

export function setTransformMode(title) {

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