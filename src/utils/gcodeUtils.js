import THREE from 'three'

export function convert (data) {
  const {colors, positions} = data

  let material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    linewidth: 5,
    vertexColors: THREE.VertexColors,
    opacity: 0.5,
    transparent: true
  })

  var geometry = new THREE.BufferGeometry()
  geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
  geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4))

  let group = new THREE.Object3D()
  group.add(new THREE.Line(geometry, material))

  return group
}
