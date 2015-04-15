let state = {
  appInfos:{
    ns:"youmagineJam",
    name:"Jam!",
    version:"0.0.0"
  },
  settings:{//TODO: each component should "register its settings"
    grid:{
      show:false,
      size:"",
    },
    bom:{
      show:false,//this belongs in the bom system
    },
     annotations:{
      show:false,
    }
  },
  shortcuts:{
    'duplicateEntity':'⌘+r,ctrl+d',
    'removeEntity':'delete',
    'toTranslateMode':'m',
    'toRotateMode':'r',
    'toScaleMode':'s'
  },

  //real state 
  camActive : false,//is a camera movement taking place ?
  activeTool: null,
  design:{
    title:"untitled design",
    description:"",
  },
  selectedEntities:[],
  assembly:[
  ],
  //special, for testing
  _entities:[],
  _entityKlasses:[],
  _entitiesById: {}
};

export default state;
