import THREE from 'three'

/**
 * @author kaosat-dev
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */
var OrbitControls = function ( object, domElement, upVector ) {

    //this.object = object
    this.objects = []
    this.objectOptions = []
    this.camStates = []

    this.domElement = ( domElement !== undefined ) ? domElement : document
    this.upVector = upVector || new THREE.Vector3(0,1,0)


    // API
    this.enabled = true

    //this.center = new THREE.Vector3()
    this.centers = []

    this.userZoom = true
    this.userZoomSpeed = 1.0

    this.userRotate = true
    this.userRotateSpeed = 1.0

    this.userPan = true
    this.userPanSpeed = 2.0

    this.autoRotate = false
    this.autoRotateSpeed = 2.0 // 30 seconds per round when fps is 60

    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    this.minDistance = 0.2
    this.maxDistance = 600

    this.active = false
    this.mainPointerPressed = false

    // internals

    var scope = this

    var EPS = 0.000001
    var PIXELS_PER_ROUND = 1800

    var phiDelta = 0
    var thetaDelta = 0
    var scale = 1
    
    var origPhiDelta = phiDelta
    var origThetaDelta = thetaDelta
    var origScale = scale

    //to add control of multiple cameras
    this.addObject = function( object, options){
      if(this.objects.indexOf(object) != -1) return
      const DEFAULTS = {userZoom:true, userPan:true, userRotate:true} 
      options = Object.assign({}, DEFAULTS, options)
      
      this.objects.push( object )
      this.objectOptions.push(options)
      this.centers.push( new THREE.Vector3() )
      this.camStates.push( {phiDelta:0,thetaDelta:0,scale:1,lastPosition:new THREE.Vector3()} )
    }

    // events
    var changeEvent = { type: 'change' }

    this.update = function (dt) {
        //this is a modified version, with inverted Y and Z (since we use camera.z => up)
        //we also allow multiple objects/cameras
        for(var i =0; i< this.objects.length;i++)
        {
          var object = this.objects[i]
          var center = this.centers[i]
          var camState = this.camStates[i]
          
          var curThetaDelta = camState.thetaDelta
          var curPhiDelta   = camState.phiDelta
          var curScale      = camState.scale
          
          var lastPosition = camState.lastPosition
          
          var position = object.position
          var offset = position.clone().sub( center )

          if(this.upVector.z == 1)
          {
            // angle from z-axis around y-axis, upVector : z
            var theta = Math.atan2( offset.x, offset.y )
            // angle from y-axis
            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.y * offset.y ), offset.z )
          }
          else
          {
            //in case of y up
            var theta = Math.atan2( offset.x, offset.z )
            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y )
            curThetaDelta = -(curThetaDelta)
          }

          if ( this.autoRotate ) {
              //this.rotateLeft( getAutoRotationAngle() )
              //PER camera
              this.objects.map(function(object, index){
                if(scope.objectOptions[index].userRotate){
                  scope.camStates[index].thetaDelta += getAutoRotationAngle()
                }
              })   
          }

          theta += curThetaDelta
          phi += curPhiDelta

          // restrict phi to be between desired limits
          phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) )
          // restrict phi to be betwee EPS and PI-EPS
          phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) )
          //multiply by scaling effect
          var radius = offset.length() * curScale
          // restrict radius to be between desired limits
          radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) )

          if(this.upVector.z == 1)
          {
            offset.x = radius * Math.sin( phi ) * Math.sin( theta )
            offset.z = radius * Math.cos( phi )
            offset.y = radius * Math.sin( phi ) * Math.cos( theta )
          }
          else
          {
            offset.x = radius * Math.sin( phi ) * Math.sin( theta )
            offset.y = radius * Math.cos( phi )
            offset.z = radius * Math.sin( phi ) * Math.cos( theta )
          }

          //
          position.copy( center ).add( offset )
          object.lookAt( center )

          if ( lastPosition.distanceTo( object.position ) > 0 ) {
              //this.active = true
              this.dispatchEvent( changeEvent )

              lastPosition.copy( object.position )
              
          }
          else
          {
            //fireDeActivated()
          }
          
          camState.thetaDelta /= 1.5
          camState.phiDelta /= 1.5
          camState.scale = 1
        }
    }

    function getAutoRotationAngle() {
      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed
    }

    function getZoomScale() {
      return Math.pow( 0.95, scope.userZoomSpeed )
    }
    
    this.enable= function (){
    	scope.enabled = true
    	this.enabled = true
    }
    
    this.disable = function(){
    	scope.enabled = false
    	this.enabled = false
    }

    this.reset = function(){
      for(var i=0;i<this.objects.length;i++)
      {
        var center = this.centers[i]
        center = new THREE.Vector3()
      }
      this.objects.map(function(object, index){
        let center = this.centers[index]
        center = new THREE.Vector3()
        this.camStates[index].phiDelta   = origPhiDelta
        this.camStates[index].thetaDelta = origThetaDelta 
        this.camStates[index].scale = origScale = scale
      })

      this.update()
    } 
    
    this.setObservables=function(observables){
      console.log("setting observables")
      let {dragMoves$, zooms$} = observables

      let self = this

      /* are these useful ?
      scope.userZoomSpeed = 0.6

      onPinch
      */
      function zoom(zoomDir, zoomScale, cameras){

        if ( scope.enabled === false ) return
        if ( scope.userZoom === false ) return

        //PER camera
        cameras.map(function(object, index){
          if(scope.objectOptions[index].userZoom){

            if(zoomDir < 0) scope.camStates[index].scale /= zoomScale
            if(zoomDir > 0) scope.camStates[index].scale *= zoomScale
          }
        })  
      }

      function rotate(cameras, angle){
        
        if ( scope.enabled === false ) return
        if ( scope.userRotate === false ) return

        //PER camera
        cameras.map(function(object, index){
          if(scope.objectOptions[index].userRotate){
            scope.camStates[index].thetaDelta += angle.x
            scope.camStates[index].phiDelta   += angle.y

          }
        })   
      }

      //TODO: implement
      function pan(cameras, offset){
        //console.log(event)
        var _origDist = distance.clone()

         //do this PER camera
        cameras.map(function(object, index){
            if(scope.objectOptions[index].userPan){
              let distance = _origDist.clone()
              distance.transformDirection( object.matrix )
              distance.multiplyScalar( scope.userPanSpeed )
              
              object.position.add( distance )
              scope.centers[index].add( distance )
            }
          })  
      }


      dragMoves$
        .subscribe(function(e){
          let delta = e.delta

          /*if ( angle === undefined ) {
          angle = 2 * Math.PI /180  * scope.userRotateSpeed
        }*/
          let angle ={x:0,y:0} 
          angle.x = 2 * Math.PI * delta.x / PIXELS_PER_ROUND * scope.userRotateSpeed
          angle.y = -2 * Math.PI * delta.y / PIXELS_PER_ROUND * scope.userRotateSpeed
              
          /*if ( angle === undefined ) {
            angle = 2 * Math.PI /180  * scope.userRotateSpeed
          } */     
          rotate(self.objects, angle)

        })
        //.subscribe(e=>e)//console.log("dragMoves",e.delta))
 
      zooms$
        .subscribe(function(delta){
          let zoomScale = undefined
          if ( !zoomScale ) {
            zoomScale = getZoomScale()
          }
          zoom(delta, zoomScale, self.objects)
        })
        //.subscribe(e=>e)//console.log("zoom",e))
    
  }
}

OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype )

export default OrbitControls
