function setupPostProcess(){
  /*for generic outlines etc*/
    /*let edgeDetectPass = new THREE.ShaderPass(EdgeShader3)

    //depth data generation
    let width = window.innerWidth
    let height = window.innerHeight
    let depthTarget = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } )
    let depthMaterial = new THREE.MeshDepthMaterial()
    let depthPass = new THREE.RenderPass(scene, camera, depthMaterial)

    let depthComposer = new THREE.EffectComposer( renderer, depthTarget )
    depthComposer.setSize( width, height )
    depthComposer.addPass( depthPass )
    depthComposer.addPass( edgeDetectPass )
    depthComposer.addPass( copyPass )


    //normal data generation
    let normalTarget = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } )
    let normalMaterial = new THREE.MeshNormalMaterial()
    let normalPass = new THREE.RenderPass(scene, camera, normalMaterial)
        
    let normalComposer = new THREE.EffectComposer( renderer, normalTarget )
    normalComposer.setSize(width, height)
    normalComposer.addPass( normalPass )
    normalComposer.addPass( edgeDetectPass )
    normalComposer.addPass( copyPass )

    //final compositing
    //  steps:
    //  render default to @colorTarget
    //  render depth
    //  render normal
    
    let renderPass = new THREE.RenderPass(scene, camera)

    renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
    renderTarget = new THREE.WebGLRenderTarget( width , height, renderTargetParameters )
        
    let finalComposer = new THREE.EffectComposer( renderer , renderTarget )
    finalComposer.setSize(width, height)
    //prepare the final render passes
    finalComposer.addPass( renderPass )
    //finalComposer.addPass( normalPass)

    //finalComposer.addPass(fxaaPass)
    //blend in the edge detection results
    let effectBlend = new THREE.ShaderPass( AdditiveBlendShader, "tDiffuse1" )
    effectBlend.uniforms[ 'tDiffuse2' ].value = normalComposer.renderTarget2
    effectBlend.uniforms[ 'tDiffuse3' ].value = depthComposer.renderTarget2
    effectBlend.uniforms[ 'normalThreshold' ].value = 0.05
    effectBlend.uniforms[ 'depthThreshold' ].value = 0.05
    effectBlend.uniforms[ 'strengh' ].value = 0.4

    finalComposer.addPass( effectBlend )
    
    //finalComposer.addPass( vignettePass )
    finalComposer.passes[finalComposer.passes.length-1].renderToScreen = true*/
}


function makeOutlineFx(mesh){
  //log.debug("makeOutlineFx")
  let geometry = mesh.geometry
  let matFlat  = new THREE.MeshBasicMaterial({color: 0xffffff})
  let maskMesh = new THREE.Mesh( geometry, matFlat )

  //maskMesh.quaternion = mesh.quaternion
  //maskMesh.position.fromArray( entity.pos )
  //maskMesh.rotation.fromArray( entity.rot)
  //maskMesh.scale.fromArray( entity.sca )

  let uniforms = {
    offset: {
      type: "f",
      value: 0.5
    },
    color:{ 
      type: "c", 
      value: new THREE.Color("#ff2500")//[1.0,0.0,0.0] 
    }
  }

  let shader = require("./deps/post-process/OutlineShader")
  let outShader = shader['outline']

  let matShader = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: outShader.vertex_shader,
    fragmentShader: outShader.fragment_shader
  })

  let outlineMesh = new THREE.Mesh(geometry, matShader)
  //outlineMesh.quaternion = mesh1.quaternion
  outlineMesh.material.depthTest = false

  //synch with original
  maskMesh.position.copy( mesh.position )
  maskMesh.rotation.copy( mesh.rotation )
  maskMesh.scale.copy( mesh.scale )

  outlineMesh.position.copy( mesh.position )
  outlineMesh.rotation.copy( mesh.rotation )
  outlineMesh.scale.copy( mesh.scale )
  //outlineMesh.position.fromArray( entity.pos )
  //outlineMesh.rotation.fromArray( entity.rot)
  //outlineMesh.scale.fromArray( entity.sca )

  return {maskMesh, outlineMesh}
}

function outlineStuff(){
    //for outlines, experimental
  function removeOutline(){
    if(outScene){
      outScene.children = []
      maskScene.children = []
    }
  }
  function outlineMesh(mesh){
    let oData = makeOutlineFx(mesh)
    if(outScene)
      outScene.add( oData.outlineMesh )

    if(maskScene)
      maskScene.add( oData.maskMesh )
    return oData
  }
  function unOutlineMesh(oData){
    if(oData && outScene && maskScene){
      console.log("actually removing stuff y know")
      outScene.remove(oData.outlineMesh)
      maskScene.remove(oData.maskMesh)
    }
  }

  function makeFx(){
    let fxByObject = new WeakMap()

    function applyFx(fx,objects){
      //console.log("applyFx to",objects,"fxByObject",fxByObject)
      objects.map(function(object){
        if(!object.highlight)//FIXME: hack: only annotations have these
        {
          let fxData = outlineMesh(object)
          fxByObject.set( object, fxData )  //[object]= fxData//"outline"
        }
        else{ object.highlight(true) }

      })
    }

    function removeFx(fx, objects){
      //console.log("removeFx from",objects,"fxByObject",fxByObject)
      objects.map(function(object){
        if(!object.highlight)//FIXME: hack: only annotations have these
        {
          let fxData = fxByObject.get(object)
          unOutlineMesh(fxData)
          fxByObject.delete(object)
          //delete fxByObject[object]
        }
        else{ object.highlight(false) }
      })
    }

    return {applyFx,removeFx}
  }

  let {applyFx,removeFx} = makeFx()

  //TODO: only do once
  //TODO : fix this
  /*let meshes$ = selections$
    .debounce(200)
    .distinctUntilChanged(null, entityVisualComparer)
    .withLatestFrom( visualMappings$ ,function(selections, mapper){   
      return selections
        .map(mapper)
        .map(s=>s.take(1))
    })
    .map(function(data){//do all this to handle empty arrays of selections
      if(data && data.length>0) return data 
      return [Rx.Observable.just(undefined)]
    })
    .flatMap(Rx.Observable.forkJoin)
    //.shareReplay(1)

  meshes$
    .bufferWithCount(2,1)
    .subscribe(function(meshesBuff){
      let [prev,cur] = meshesBuff

      let {added,removed,changed} = extractChanges(prev,cur)
      applyFx(null,added)
      removeFx(null,removed)
    },e=>console.log("error",e)) */
}