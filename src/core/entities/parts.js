


//listing of available actions
let availableActions = {
  "addNote"   : {action: addNote$, title:"add note"}
  ,"measure thickness"
  ,"measure Diameter"
  ,"measure Distance"
  ,"measure Angle"
}

 {text:"transforms",items:[
            {text:"translate", action:"translate"},
            {text:"rotate",action:"rotate"},
            {text:"scale",action:"scale"}
          ]},

export {availableActions}