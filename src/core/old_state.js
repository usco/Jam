let state = {
  appInfos:{
    ns:"youmagineJam",
    name:"Jam!",
    version:"0.0.0"
  },
  settings:{
    
  },
  shortcuts:[
    {keys:'⌘+z,ctrl+z', "command":'undo'},
    {keys:'⌘+shift+z,ctrl+shift+z', "command":'redo'},

    {keys:'⌘+r,ctrl+d', "command":'duplicateEntities'},
    {keys:'delete,backspace'    , "command":'removeEntities'},
    {keys:'m'         , "command":'toTranslateMode'},
    {keys:'r'         , "command":'toRotateMode'},
    {keys:'s'         , "command":'toScaleMode'}
  ],

  //real state 

  //generate data, stored to ensure "RWYLO" (rgiht where you left off)
  _lastDesignUri: undefined,


  appState:{
    mode:"viewer",

    camActive : false,//is a camera movement taking place ?
    activeTool: null,

    fullScreen: false,

    //generate data, stored to ensure "RWYLO" (rgiht where you left off)
    _lastDesignUri: undefined,

    annotations:{
      show:true,
    },
    grid:{
      show:false,
    },
    camera:{
      autoRotate:false
    }
  },

  //////////////////
  //after this point, actual design & sub elements state

  //redundant with design observable
  design:{
    name:        undefined,
    description: undefined,
    version:     undefined,//"0.0.0",
    authors:     [],
    tags:        [],
    licenses:    [],
    meta:        undefined,

    uri:undefined,
    _persistent:false
  },

  //FIXME: hack / experiment
  annotationsData : [
  ],

  entities:{
    instances:[],
    selectedIds:[],

    //secondary storage of instances, for faster/simpler access
    byId:{}
  },

  bom: {
    entries:[],
    selectedEntries:[]
  }
  
};

export default state;
