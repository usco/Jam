export const presets = {
  renderer: {
    shadowMapEnabled: true,
    shadowMapAutoUpdate: true,
    shadowMapSoft: true,
    shadowMapType: undefined, // THREE.PCFSoftShadowMap,//THREE.PCFSoftShadowMap,//PCFShadowMap
    autoUpdateScene: true, // Default ?
    physicallyBasedShading: false, // Default ?
    autoClear: true, // Default ?
    gammaInput: false,
    gammaOutput: false
  },
  cameras: [
    {
      name: 'mainCamera',
      pos: [75, 75, 145], // [100,-100,100]
      up: [0, 0, 1],
      lens: {
        fov: 45,
        near: 0.1,
        far: 20000
      }
    }
  ],
  controls: [
    {
      up: [0, 0, 1],
      rotateSpeed: 2.0,
      panSpeed: 2.0,
      zoomSpeed: 2.0,
      autoRotate: {
        enabled: false,
        speed: 0.2
      },
      _enabled: true,
      _active: true
    }
  ],
  scenes: {
    'main': [
      // { type:"hemisphereLight", color:"#FFFF33", gndColor:"#FF9480", pos:[0, 0, 500], intensity:0.6 },
      { type: 'hemisphereLight', color: '#FFEEEE', gndColor: '#FFFFEE', pos: [0, 1200, 1500], intensity: 0.8 },
      { type: 'ambientLight', color: '#0x252525', intensity: 0.03 },
      { type: 'directionalLight', color: '#262525', intensity: 0.2, pos: [150, 150, 1500], castShadow: true, onlyShadow: true }
    // { type:"directionalLight", color:"#FFFFFF", intensity:0.2 , pos:[150,150,1500], castShadow:true, onlyShadow:true}
    ],
    'helpers': [
      {type: 'LabeledGrid'}
    ]
  }
}
