import THREE from 'three'
import TWEEN from 'tween.js'
import Detector from './deps/Detector.js'

/** @jsx hJSX */
import Cycle from '@cycle/core'
import {Rx} from '@cycle/core'
import {h, hJSX} from '@cycle/dom'


let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge
let combineLatest = Rx.Observable.combineLatest
import combineTemplate from 'rx.observable.combinetemplate'


//minimalistic : based on https://sites.google.com/site/progyumming/javascript/shortest-webgl
/*
  function shaderProgram(gl, vs, fs) {
    var prog = gl.createProgram();
    var addshader = function(type, source) {
      var s = gl.createShader((type == 'vertex') ?
        gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw "Could not compile "+type+
          " shader:\n\n"+gl.getShaderInfoLog(s);
      }
      gl.attachShader(prog, s);
    };
    addshader('vertex', vs);
    addshader('fragment', fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw "Could not link the shader program!";
    }
    return prog;
  }

function attributeSetFloats(gl, prog, attr_name, rsize, arr) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr),
    gl.STATIC_DRAW);
  var attr = gl.getAttribLocation(prog, attr_name);
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, rsize, gl.FLOAT, false, 0, 0);
}

function getContext(elem){
    try {
      var gl = elem
        .getContext("webgl");
      if (!gl) { throw new Error("Failed to initialize WebGL context") }
    } catch (err) {
      throw new Error("Your web browser does not support WebGL!")
    }

    return gl
}

  function draw(gl, data) {

    let input = data || 1.0

    gl.clearColor(1.0, 1.0, input, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    var prog = shaderProgram(gl,
      "attribute vec3 pos;"+
      "void main() {"+
      " gl_Position = vec4(pos, 2.0);"+
      "}",
      "void main() {"+
      " gl_FragColor = vec4(0., 0., 1.0, 1.0);"+
      "}"
    )
    gl.useProgram(prog)

    attributeSetFloats(gl, prog, "pos", 3, [
      -1, 0, 0,
      0, 1, 0,
      0, -1, 0,
      1, 0, 0
    ])
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }


////////////Actual widget
function GLWidget(data) {
    this.type = 'Widget'
    this.data = data
}

GLWidget.prototype.init = function () {
  console.log("GLWidget init")
  let elem = document.createElement('canvas')
  elem.className = "bar"
  this.gl = getContext(elem)
  return elem
}

GLWidget.prototype.update = function (prev, elem) {
  this.gl = this.gl || prev.gl
  let {gl,data} = this
  draw(gl,data)
}*/

//////
import OrbitControls from './deps/OrbitControls'
import CombinedCamera from './deps/CombinedCamera'
import TransformControls from './transforms/TransformControls'

import helpers from 'glView-helpers'

let LabeledGrid = helpers.grids.LabeledGrid
let ShadowPlane = helpers.planes.ShadowPlane
let CamViewControls= helpers.CamViewControls
let annotations = helpers.annotations

let ZoomInOnObject= helpers.objectEffects.ZoomInOnObject

import {selectionAt,meshFrom,isTransformTool,targetObject,
  makeCamera, makeControls, makeLight, renderMeta
} from './utils2'

import {presets} from './presets' //default configuration for lighting, cameras etc



function testAdd(scene){
  var sphereGeometry = new THREE.SphereGeometry( 15, 32, 16 ) 
  var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0x8888ff} );
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.position.set(0, 50, 0)
  sphere.geometry.computeBoundingSphere()
  sphere.geometry.computeBoundingBox()
  sphere.selectTrickleUp = false 
  sphere.selectable = true
  sphere.castShadow = true

  scene.add(sphere)
}

/////////////////////
function setupScene(scene, config){
  
 
  //scene.add(sphere)
  for( let light of config.scenes["main"])
  {
    scene.add( makeLight( light ) )
  }
}

function render(renderer, scene, camera){
  renderer.render( scene, camera )
}

function configure (config, container, renderer, scene){
  //log.debug("initializing into container", container)
  renderer.setClearColor( "#fff" )
  Object.keys(config.renderer).map(function(key){
    //TODO add hasOwnProp check
    renderer[key] = config.renderer[key]
  })

  let pixelRatio = window.devicePixelRatio || 1
  renderer.setPixelRatio( pixelRatio )

  container.appendChild( renderer.domElement )
}

function handleResize (sizeInfos,renderer,scene,camera){
  //log.debug("setting glView size",sizeInfos)
  let {width,height,aspect} = sizeInfos

  if(width >0 && height >0 && camera && renderer){
    renderer.setSize( width, height )
    camera.aspect = aspect
    camera.setSize(width,height)
    camera.updateProjectionMatrix()   
    

    let pixelRatio = window.devicePixelRatio || 1

    /*fxaaPass.uniforms[ 'resolution' ].value.set (1 / (width * pixelRatio), 1 / (height * pixelRatio))
    
    composers.forEach( c=> {
      c.reset()
      c.setSize(width * pixelRatio, height * pixelRatio)
    } )*/

    render(renderer,scene,camera)
  }
}



function GLView(data) {
    this.type = 'Widget'
    this.data = data

    let {meshes} = data

    console.log("data / meshes", meshes,data)
    this.inputMeshes = meshes
}

GLView.prototype.init = function () {
  console.log("GLWidget init")
  let elem = document.createElement('div')
  elem.className = "bar"

  let config = presets
  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D()//all dynamic mapped objects reside here
  scene.add( dynamicInjector )

  let camera   = makeCamera(config.cameras[0])
  let controls = makeControls(config.controls[0])
  let transformControls = new TransformControls( camera )

  let renderer = undefined
  if(!Detector.webgl){
    //renderer = new CanvasRenderer() 
  } else {
    renderer = new THREE.WebGLRenderer( {antialias:false} )
  }

  setupScene(scene,config)
  //testAdd(dynamicInjector)
  if(this.inputMeshes){
    //this.inputMeshes.forEach(function(mesh){
    //  dynamicInjector.add( meshe )
    //})
    dynamicInjector.add( this.inputMeshes )
  }


  configure (config, elem, renderer)

  scene.add(camera)  
  //scene.add(shadowPlane)
  //scene.add(transformControls)
  


  handleResize({width:window.innerWidth,height:window.innerHeight,aspect:window.innerWidth/window.innerHeight},
    renderer,scene,camera)

  setInterval(function(){
    render(renderer, scene,camera)
  }, 30)


  this.scene = scene
  this.dynamicInjector = dynamicInjector


  return elem
}

GLView.prototype.update = function (prev, elem) {
  /*this.gl = this.gl || prev.gl
  let {gl,data} = this
  draw(gl,data)*/
  /**/
}

export default GLView




function GLWidgetWrapper(data) {
    this.type = 'Widget'
    this.data = data
}

GLWidgetWrapper.prototype.init = function () {
  console.log("GLWidget init")
  let elem = document.createElement('div')
  elem.className = "bar"
  return elem
}

GLWidgetWrapper.prototype.update = function (prev, elem) {
  //this.gl = this.gl || prev.gl
}

let GlWrap = new GLWidgetWrapper()
console.log("GlWrap",GlWrap)