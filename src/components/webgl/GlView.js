import THREE from 'three'
import TWEEN from 'tween.js'
import Detector from './deps/Detector.js'

import Rx from 'rx'
import { h } from '@cycle/dom'

let fromEvent = Rx.Observable.fromEvent
let merge = Rx.Observable.merge

import { preventScroll } from '../../interactions/pointers'
import { windowResizes } from '../../interactions/sizing'

import { exists, combineLatestObj } from '../../utils/obsUtils'

import { extractChanges } from '../../utils/diffPatchUtils'

import TransformControls from './transforms/TransformControls'

import { planes, grids, annotations, cameraEffects, CamViewControls } from 'glView-helpers'

import LabeledGrid from 'glView-helpers/lib/grids/LabeledGrid'

// console.log('helpers.planes',planes,objectEffects)
// let LabeledGrid = helpers.grids.LabeledGrid
let ShadowPlane = planes.ShadowPlane.default // ugh FIXME: bloody babel6
// let annotations    = annotations
let {zoomInOn, zoomToFit} = cameraEffects

import zoomToFitBounds from './cameraUtils2'
import { computeBoundingBox } from './computeBounds2'

import { makeCamera, makeControls, makeLight, renderMeta } from './utils2'

import { presets } from './presets' // default configuration for lighting, cameras etc

import EffectComposer from './deps/post-process/EffectComposer'
import ShaderPass from './deps/post-process/ShaderPass'
import RenderPass from './deps/post-process/RenderPass'
import { ClearMaskPass, MaskPass } from './deps/post-process/MaskPass'

import CopyShader from './deps/post-process/CopyShader'
import FXAAShader from './deps/post-process/FXAAShader'
import vignetteShader from './deps/post-process/vignetteShader'

import EdgeShader3 from './deps/post-process/EdgeShader3'
import AdditiveBlendShader from './deps/post-process/AdditiveBlendShader'

function setupPostProcess (camera, renderer, scene) {
  // console.log('setupPostProcess')
  // //////post processing
  let renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    stencilBuffer: true
  }

  let outScene = new THREE.Scene()
  let maskScene = new THREE.Scene()

  let renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, renderTargetParameters)

  let uniforms = {
    offset: {
      type: 'f',
      value: 0.9
    },
    color: {
      type: 'c',
      value: new THREE.Color('#000000') // #ff2500')//[1.0,0.0,0.0]
    }
  }

  let shader = require('./deps/post-process/OutlineShader').default
  let outShader = shader['outline']

  let outlineMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: outShader.vertex_shader,
    fragmentShader: outShader.fragment_shader
  })
  outlineMaterial.depthTest = false
  // new THREE.MeshBasicMaterial({color:0xFF0000,transparent:true,opacity:0.5})

  let maskMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})

  // setup composer
  let composer = new EffectComposer(renderer)
  composer.renderTarget1.stencilBuffer = true
  composer.renderTarget2.stencilBuffer = true

  let normal = new RenderPass(scene, camera)
  let outline = new RenderPass(outScene, camera, outlineMaterial)
  let maskPass = new THREE.MaskPass(maskScene, camera, maskMaterial)
  maskPass.inverse = true
  let clearMask = new THREE.ClearMaskPass()
  let copyPass = new THREE.ShaderPass(THREE.CopyShader)
  let fxaaPass = new THREE.ShaderPass(THREE.FXAAShader)
  let vignettePass = new THREE.ShaderPass(THREE.VignetteShader)

  fxaaPass.uniforms[ 'resolution' ].value.set(1 / window.innerWidth * window.devicePixelRatio, 1 / window.innerHeight * window.devicePixelRatio)
  vignettePass.uniforms[ 'offset' ].value = 0.95
  vignettePass.uniforms[ 'darkness' ].value = 0.9

  // /////////////////////////////////

  renderer.autoClear = false
  // renderer.autoClearStencil = false

  outline.clear = false
  // normal.clear = false

  composer.addPass(normal)
  composer.addPass(maskPass)
  composer.addPass(outline)

  composer.addPass(clearMask)
  // composer.addPass(vignettePass)
  // composer.addPass(fxaaPass)
  composer.addPass(copyPass)

  let lastPass = composer.passes[composer.passes.length - 1]
  lastPass.renderToScreen = true

  return {composers: [composer], fxaaPass, outScene, maskScene}

// return {composer:finalComposer, fxaaPass, outScene, maskScene, composers:[normalComposer,depthComposer,finalComposer]}
}

import intent from './intent'
import model from './model'

// //////////
function GLView ({drivers, props$}) {
  const {DOM, postMessage} = drivers

  let config = presets

  let initialized$ = new Rx.BehaviorSubject(false)
  let update$ = Rx.Observable.interval(16, 66666666667)

  let settings$ = props$.pluck('settings')
  // every time either activeTool or selection changes, reset/update transform controls
  let activeTool$ = settings$.pluck('activeTool').startWith(undefined)

  let renderer = null

  let composer = null
  let composers = []
  let fxaaPass = null
  let outScene = null
  let maskScene = null

  let scene = new THREE.Scene()
  let dynamicInjector = new THREE.Object3D() // all dynamic mapped objects reside here
  scene.dynamicInjector = dynamicInjector
  scene.add(dynamicInjector)

  let selectionsContainer = new THREE.Scene() // unfortunate way to handle things in three.js

  let camera = makeCamera(config.cameras[0])
  let controls = makeControls(config.controls[0]) // create 'orbit' controls
  let transformControls = new TransformControls(camera)

  let grid = new LabeledGrid(215, 215, 10, config.cameras[0].up)
  let shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up)

  const actions = intent({DOM, events: drivers.events}, {camera, scene, transformControls, props$, settings$})
  const state$ = model(props$, actions)

  // FIXME: proxies for now, not sure how to deal with them
  const meshAddedToScene$ = new Rx.ReplaySubject(1)
  const meshRemovedFromScene$ = new Rx.ReplaySubject(1)

  const outlineSelections$ = settings$
    .filter(s => !(s.toolSets.indexOf('view') !== -1 && s.toolSets.length === 1)) // in all but view only mode
    .combineLatest(state$, function (settings, state) {
      return state
    })

  const focusedMeshesFromFocusedEntities$ = state$.pluck('focusedMeshesFromFocusedEntities').startWith([])

  const zoomToFit$ = settings$
    .filter(s => s.toolSets.indexOf('edit') === -1 && s.toolSets.length === 1) // only in view only mode
    .combineLatest(state$.pluck('items'), function (settings, items) {
      return items
    })
    .merge(focusedMeshesFromFocusedEntities$)
    .filter(exists)
    .filter(i => i.length > 0)
    .distinctUntilChanged()

  /*
    const zoomToFit$ = meshAddedToScene$ //alternative implementation
    .combineLatest(settings$.filter(s=> s.appMode === 'viewer'), function(mesh, settings){
      return [dynamicInjector]
    })
    .distinctUntilChanged()*/

  // react to actions
  actions.zoomInOnPoint$
    .forEach((oAndP) => zoomInOn(oAndP.object, camera, {position: oAndP.point}))

  zoomToFit$
    .map(function (meshesToFocus) {
      let wrapperObject = new THREE.Object3D()
      wrapperObject.boundingBox = computeBoundingBox(wrapperObject, meshesToFocus)
      wrapperObject.boundingSphere = wrapperObject.boundingBox.getBoundingSphere()
      const center = new THREE.Vector3().subVectors(wrapperObject.boundingBox.max, wrapperObject.boundingBox.min).multiplyScalar(0.5)
      return {focusMesh: wrapperObject, center}
    })
    .forEach(({focusMesh, center}) => zoomToFitBounds(focusMesh, camera, center))

  let windowResizes$ = windowResizes(1) // get from intents/interactions ?

  function clearScene () {
    if (scene) {
      if (scene.dynamicInjector) {
        scene.remove(scene.dynamicInjector)
      }
      let dynamicInjector = new THREE.Object3D()
      scene.dynamicInjector = dynamicInjector

      scene.add(dynamicInjector)
    }
  }

  function addToScene (object) {
    scene.dynamicInjector.add(object)
  }
  function removeFromScene (object) {
    scene.dynamicInjector.remove(object)
  }

  function setupScene () {
    config.scenes['main']
      // TODO , update to be more generic
      .map(light => makeLight(light))
      .forEach(light => scene.add(light))
  }

  function render (scene, camera) {
    composers.forEach(c => c.render())
  // composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse2' ].value = composers[0].renderTarget2
  // composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse3' ].value = composers[1].renderTarget2
  }

  function update () {
    controls.update()
    transformControls.update()
    TWEEN.update()
  // if(camViewControls) camViewControls.update()
  }

  function configure (container) {
    // log.debug('initializing into container', container)

    if (!Detector.webgl) {
      // TODO: handle lacking webgl
    } else {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        preserveDrawingBuffer: true
      })
    }

    renderer.setClearColor('#fff')
    Object.keys(config.renderer).map(function (key) {
      // TODO add hasOwnProp check
      renderer[key] = config.renderer[key]
    })

    let pixelRatio = window.devicePixelRatio || 1
    renderer.setPixelRatio(pixelRatio)

    container.appendChild(renderer.domElement)
    // prevents zooming the 3d view from scrolling the window
    preventScroll(container)

    transformControls.setDomElement(container)

    // more init
    controls.setObservables(actions.filteredInteractions$)
    controls.addObject(camera)

    scene.add(camera)
    scene.add(shadowPlane)
    scene.add(transformControls)

    let ppData = setupPostProcess(camera, renderer, scene)
    // composer = ppData.composer
    composers = ppData.composers
    fxaaPass = ppData.fxaaPass
    outScene = ppData.outScene
    maskScene = ppData.maskScene

    initialized$.onNext(true)
  }

  // side effect ?
  function handleResize (sizeInfos) {
    // log.debug('setting glView size',sizeInfos)
    let {width, height, aspect} = sizeInfos

    if (width > 0 && height > 0 && camera && renderer) {
      renderer.setSize(width, height)
      camera.aspect = aspect
      camera.setSize(width, height)
      camera.updateProjectionMatrix()

      let pixelRatio = window.devicePixelRatio || 1
      fxaaPass.uniforms[ 'resolution' ].value.set(1 / (width * pixelRatio), 1 / (height * pixelRatio))

      composers.forEach(c => {
        c.reset()
        c.setSize(width * pixelRatio, height * pixelRatio)
      })
    }
  }

  // combine All needed components to apply any 'transforms' to their visuals
  let items$ = state$.pluck('items') // .distinctUntilChanged()
  // TODO : we DO  want distinctUntilChanged() to prevent spamming here at any state change
  // TODO we want to zoomToFit only when mode is viewer && we just recieved the FIRST model ??
  /* settings$
    .filter(s=> s.mode === 'viewer')
    .forEach(e=>console.log('settings',e))*/

  // do diffing to find what was added/changed
  let itemChanges$ = items$.scan(function (acc, x) {
    let cur = x
    let prev = acc.cur
    return {cur, prev}
  }, {prev: undefined, cur: undefined})
    .map(function (typeData) {
      let {cur, prev} = typeData
      let changes = extractChanges(prev, cur)
      // console.log('changes', changes)
      return changes
    })

  // experimenting with selections effects
  //FIXME : use data, not mesh level things
  outlineSelections$
    .pluck('selectedMeshesFromSelections')
    .distinctUntilChanged()
    .filter(exists)
    .forEach(function (selectedMeshes) {
      if (outScene) {
        const sceneItems = selectedMeshes.filter(exists)
        outScene.children = sceneItems
        maskScene.children = sceneItems
      }
    })

  // transformControls handling
  // we modify the transformControls mode based on the active tool
  // every time either activeTool or selection changes, reset/update transform controls
  let selectedMeshesChanges$ = state$.pluck('selectedMeshes').distinctUntilChanged()
    .scan(function (acc, x) {
      let cur = x
      let prev = acc.cur
      return {cur, prev}
    }, {prev: [], cur: []})
    .map(function (typeData) {
      let {cur, prev} = typeData
      let changes = extractChanges(prev, cur)
      return changes
    })
    .distinctUntilChanged()
    .shareReplay(1)

  combineLatestObj({
    selections: selectedMeshesChanges$,
    tool: activeTool$.distinctUntilChanged()
  })
    .forEach(function ({selections, tool}) {
      // console.log('updating transformControls',selections,tool)
      // remove transformControls from removed meshes
      selections.removed.map(mesh => transformControls.detach(mesh))

      selections.added.map(function (mesh) {
        if (tool && mesh && ['translate', 'rotate', 'scale'].indexOf(tool) > -1) {
          transformControls.attach(mesh)
          transformControls.setMode(tool)
        }
        else if ((!tool && mesh) || ['translate', 'rotate', 'scale'].indexOf(tool) === -1) { // tool is undefined, but we still had selections
          transformControls.detach(mesh)
        }
      })
    })

  // hande all the cases where events require re-rendering
  let reRender$ = merge(
    initialized$
      .filter(i => i === true)
      .do(i => handleResize({
        width: window.innerWidth,
        height: window.innerHeight,
        aspect: window.innerWidth / window.innerHeight
      }))

    , fromEvent(controls, 'change')
    , fromEvent(transformControls, 'change')
    , state$.pluck('selectedMeshes')

    , windowResizes$.do(handleResize) // we need the resize to take place before we render
  )
    .shareReplay(1)

  // /////////
  setupScene()

  update$.forEach(update)
  reRender$.forEach(render)

  // settings handling
  settings$ = settings$
    .filter(exists)
    .distinctUntilChanged()

  settings$.map(s => s.camera.autoRotate)
    .forEach(autoRotate => controls.autoRotate = autoRotate)

  settings$.map(s => s.grid.show)
    .forEach(function (showGrid) {
      scene.remove(grid)
      if (showGrid) {
        scene.add(grid)
      }
    })

  // react based on diffs
  itemChanges$
    .do(function (changes) {
      // console.log('reacting to changes', changes)
      changes.added.map(function (mesh) {
        addToScene(mesh)
        meshAddedToScene$.onNext(mesh)
      })
      changes.removed.map(function (mesh) {
        removeFromScene(mesh)
        meshRemovedFromScene$.onNext(mesh)
      })
    })
    .do(e => render())
    .forEach(e => e)

  // we do not want to change our container (DOM) but the contents (gl)
  const vtree$ = Rx.Observable.just(
    h('div.glView', [
      h('div.container', {
        //key: someUniqueKey,
        hook: {
          insert: (vnode) => { console.log('vnode', vnode); configure(vnode.elm) } //movie.elmHeight = vnode.elm.offsetHeight;
        }
      })
    ])
  )

  // screencapture test
  /* postMessage
    .filter(e=>e.hasOwnProperty('captureScreen'))
    .flatMap(e=>{
      let img = domElementToImage(renderer.domElement)

      let resolutions = e.captureScreen

      let images$ = resolutions.map(function(resolution){
          let [width,height] = resolution
          console.log('resolution',resolution)

          let obs = new Rx.Subject()
          aspectResize(img, width, height, e=>{
            obs.onNext(e)
            obs.onCompleted()})
          return obs
        })

      let results$ = Rx.Observable.forkJoin(images$)

      return results$
    })
    .forEach(e=>{
      e.map(img=>console.log(img))
    })*/

  return {
    DOM: vtree$,
    events: {
      // initialized:initialized$,
      shortSingleTaps$: actions.shortSingleTapsWPicking$,
      shortDoubleTaps$: actions.shortDoubleTapsWPicking$,
      longTaps$: actions.longTapsWPicking$,
      selectionsTransforms$: actions.selectionsTransforms$,
      selectedMeshes$: actions.selectMeshes$
    }
  }
}

export default GLView
