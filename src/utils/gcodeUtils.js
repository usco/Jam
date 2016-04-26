import Rx from 'rx'
import THREE from 'three'
const GCodeInterpreter = require('gcode-interpreter').GCodeInterpreter
//import GCodeInterpreter from 'gcode-interpreter'
//const interpreter = GCodeInterpreter.GCodeInterpreter
import { GCodeToolpath } from 'gcode-toolpath'


/*var GCodeRunner = function () {
  var handlers = {
    'G0': (args) => {
      console.log('G0', args)
      return 'foo'
    },
    'G1': (args) => {
      console.log('G1', args)
      return 'bar'
    }
  }
  return new GCodeInterpreter({ handlers: handlers })
}*/

export default function parse(str){
  const obs = new Rx.ReplaySubject(1)

  const defaultColor = new THREE.Color(0xFF0000)
  const motionColor = {
    'G0': [255,0,0,255],//new THREE.Color(0xFF0000),//0x07a9ff
    'G1': [7, 169, 255, 255],//new THREE.Color(0x17a9f5),//0x17a9f5
    'G2': [125, 255, 255, 255],//new THREE.Color(0xF0FF00),
    'G3': [125, 255, 125, 255]//new THREE.Color(0xF0FF0F)
  }

  let group = new THREE.Object3D()
  //let geometry = new THREE.Geometry()
  let geometry = new THREE.BufferGeometry()
  let posArray = []
  let colArray = []


  function addLine(modalState, v1, v2) {
    const { motion } = modalState

    posArray.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)

    let color = (motionColor[motion] || defaultColor).map(e => (e/255))
    colArray.push(color[0], color[1], color[2], color[3], color[0], color[1], color[2], color[3])
    //colArray = colArray.concat(color, color)

    /*geometry.vertices.push(new THREE.Vector3(v1.x, v1.y, v1.z))
    geometry.vertices.push(new THREE.Vector3(v2.x, v2.y, v2.z))
    geometry.colors.push(new THREE.Color(color))
    geometry.colors.push(new THREE.Color(color))*/
  }

  const toolpath = new GCodeToolpath({
    modalState: {},
    addLine: (modalState, v1, v2) => {
      addLine(modalState, v1, v2)
    },
    addArcCurve: (modalState, v1, v2, v0) => {
      //this.addArcCurve(modalState, v1, v2, v0);
    }
  })
  toolpath.loadFromString(str,function(err,data){
    console.log('here',Date.now())
    let material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 5,
      vertexColors: THREE.VertexColors,
      opacity: 0.5,
      transparent: true
    })

    var positions = new Float32Array( posArray) //posArray.length  )
    var colors = new Float32Array( colArray )//posArray.length/3 * 4  )
    //positions.set( posArray )
    //colors.set ( colArray )
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4))

    group.add(new THREE.Line(geometry, material))
    console.log('Done',Date.now())
    geometry = new THREE.BufferGeometry()

    /*group.add(new THREE.Line(geometry, material))
    geometry = new THREE.Geometry()*/
    console.log('done with group')

  })
  .on('data', (data) => {
    //console.log('data',data)
  })
  .on('end', (results) => {
    //console.log('done', geometry)
    obs.onNext([group])
    obs.onNext({progress: 1, total: 1})
  })

  /*const runner = new GCodeRunner()
  runner.loadFromString(str, function(err, data) {
    if(!err) {
      obs.onNext(data)
    }
    else
    {
      obs.onError(err)
    }
  })
  .on('end', (results) => {
        // 'end' event listener
      //obs.onEnd()
    })*/

  return obs
}
