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
    {keys:'⌘+z,ctrl+z', "command":'undo'},
    {keys:'⌘+shift+z,ctrl+shift+z', "command":'redo'},

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

  //generate data, stored to ensure "RWYLO" (rgiht where you left off)
  _lastProjectUri: undefined,
  _lastProjectName: undefined,


  //////////////////
  //after this point, actual design & sub elements state
  _persistent:false,//internal flag, do not serialize

  design:{
    name:undefined,
    description:undefined,
    version: undefined,//"0.0.0",
    authors:[
      /*{name:"foo","email":"gna","url":"http://foo"}*/
    ],
    tags:[],
    licenses:[],
    meta:undefined,

    _persistentUri:undefined,
  },

  //FIXME: hack / experiment
  annotationsData : [
      {
        iuid:"5E3B5655-8B70-498D-C093-E502B8728CCB",
        name:"fooAnnot",
        transformable:false,
        typeUid:"-1",
        type:"distance",
        distance : 150,
        start:{
          point :[0,0,0],
          entity: "A41A9D9E-E371-439B-A83B-A387DDD51FC1"
        },
        end:{
          point: [0,0,0],
          entity: "E83B5655-8B70-498D-B082-E502B8728CC6"
        }
      }
  ],

  selectedEntities:[],
  selectedEntitiesIds:[],
  //special, for testing
  /*assemblies:{
    main:{
      children:[
      ]
    }
  },*/
  //temporary hack for the above
  assemblies_main_children:[],
  _entityKlasses:{},
  _entitiesById: {}
};

export default state;
