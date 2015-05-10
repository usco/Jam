let state = {
  appInfos:{
    ns:"youmagineJam",
    name:"Jam!",
    version:"0.0.0"
  },
  settings:{//TODO: each component should "register its settings"
    activeMode: true,//if not, disable 3d view ,replace with some static content
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
  shortcuts:[
    {keys:'⌘+r,ctrl+d', "command":'duplicateEntities'},
    {keys:'delete,backspace'    , "command":'removeEntities'},
    {keys:'m'         , "command":'toTranslateMode'},
    {keys:'r'         , "command":'toRotateMode'},
    {keys:'s'         , "command":'toScaleMode'}
  ],

  //real state 
  camActive : false,//is a camera movement taking place ?
  fullScreen: false,
  activeTool: null,

  design:{
    title:"untitled design",
    name:"untitledDesign",
    description:"Some description",
    version: undefined,//"0.0.0",
    authors:[
      {name:"foo","email":"gna","url":"http://foo"},
      {name:"bar","email":"yup","url":"https://secure"}
    ],
    tags:["foo","bar"],
    licenses:[ 
      "GPLV3",
      "MIT"],
    meta:undefined,
    _persisted:false//internal flag, do not serialize
  },
  selectedEntities:[],
  selectedEntitiesIds:[],
  assembly:[
  ],
  //special, for testing
  _entities:[],
  _entityKlasses:[],
  _entitiesById: {}
};

export default state;
