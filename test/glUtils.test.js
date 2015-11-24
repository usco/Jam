import assert from 'assert'
import THREE from 'three'
import {
  getEntryExitThickness,
  getObjectPointNormal,
  computeCenterDiaNormalFromThreePoints} from '../src/components/webgl/utils'



describe('Gl-utils', function() {
  describe('getEntryExitThickness', function() {

    it('should return an object, entry & exit points & thickness ', function () {
      let entryInteresect = {
        face:{normal: new THREE.Vector3(0,0,-1)},
        point:new THREE.Vector3(0,0,15),
        object: new THREE.Mesh(new THREE.BoxGeometry(10,10,10))
      }

      let result = getEntryExitThickness(entryInteresect)
      let expected = {
        object: entryInteresect.object
        ,entryPoint: new THREE.Vector3(0,0,15)
        ,exitPoint: new THREE.Vector3(0,0,5)
        ,thickness: 10
      }

      assert.equal(JSON.stringify(result), JSON.stringify(expected))

    })

  })


  describe('getObjectPointNormal', function() {

    it('should return an object a point and a normal', function () {
     
      let pickingInfos = {
        face:{
          normal: new THREE.Vector3(0,0,1)
        }
        ,point:  new THREE.Vector3(7,2.98,-19)
        ,object: new THREE.Object3D()

      }

      let result = getObjectPointNormal(pickingInfos)
      let expected = {
        object: pickingInfos.object
        ,point: pickingInfos.point
        ,normal: pickingInfos.face.normal
      }

      assert.equal(JSON.stringify(result), JSON.stringify(expected))

    })

  })


  describe('computeCenterDiaNormalFromThreePoints', function() {

    it('should compute center , dia/radius from three(3) 3d points', function () {
      let pointA = new THREE.Vector3(0,10,0)
      let pointB = new THREE.Vector3(15,10,0)
      let pointC = new THREE.Vector3(10,15,0)

      let result = computeCenterDiaNormalFromThreePoints(pointA,pointB, pointC)

      let expected = {
        center:new THREE.Vector3(7.5,7.5,0)
        ,diameter:15.811388300841896
        ,normal:new THREE.Vector3(0,0,1)}

      assert.equal(JSON.stringify(result), JSON.stringify(expected))

    })

  })
})