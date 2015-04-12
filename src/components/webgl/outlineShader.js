shader = {
  'outline': {
    vertex_shader: ["uniform float offset;", "void main() {", "vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );", "gl_Position = projectionMatrix * pos;", "}"].join("\n"),
    fragment_shader: ["void main(){", "gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );", "}"].join("\n")
  }
};