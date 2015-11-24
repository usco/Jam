let shader = {
  'outline': {
    vertex_shader: [
      "uniform float offset;", 
      "void main() {", 
      "vec4 pos = vec4( position + normal * offset/2.0, 1.0 );", 
      "gl_Position = projectionMatrix * modelViewMatrix * pos;", "}"].join("\n"),

    fragment_shader: [
      "uniform vec3 color;",
      "void main(){", 
        "gl_FragColor = vec4(color,1.0);  //vec4( 1.0, 0.0, 0.0, 1.0 );", 
      "}"].join("\n")
  }
};

export default shader;