import * as THREE from "three";

export default class App {
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  cube: THREE.Mesh;
  material: THREE.ShaderMaterial;
  time: number;
  constructor() {
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const width = (canvas.width = 500);
    const height = (canvas.height = 500);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    });
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    this.time = 0.01;

    const plane = new THREE.PlaneGeometry(2, 2);
    const fragmentShader = `
    precision highp float;

    uniform vec2 u_zoomCenter;
    uniform float u_zoomSize;

    vec3 hsl2rgb( in vec3 c ) { // © 2014 Inigo Quilez, MIT license, see https://www.shadertoy.com/view/lsS3Wc
        vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / vec2(500.0, 500.0);
      vec2 c = u_zoomCenter + (uv * 4.0 - vec2(2.0)) * (u_zoomSize / 4.0);
      vec2 x = vec2(0.0);

      float iterations = 0.0;
      do{
        x = mat2(x,-x.y,x.x)*x + c;
        if (length(x) > 2.0) {
          break;
        }
      }while(++iterations<=1000.0);

      if(iterations < 1000.0){
        float l = -log(iterations/1000.0);
        vec3 hsl = vec3(l, 0.5, 0.5);
        gl_FragColor = vec4(hsl2rgb(hsl), 1);
      }else{
        gl_FragColor = vec4(0,0,0,1);
      }
    }

`;

    this.nexPosition = this.getZoomCenter();
    this.material = new THREE.ShaderMaterial({
      fragmentShader: fragmentShader,
      uniforms: {
        u_zoomCenter: {
          value: this.nexPosition,
        },
        u_zoomSize: { value: 5 },
        u_maxIterations: { value: 500 },

        iResolution: { value: new THREE.Vector3() },
      },
    });

    this.cube = new THREE.Mesh(plane, this.material);
    this.scene.add(this.cube);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 1;
  }

  Start() {
    this.tick();
  }

  zoomIn: boolean;
  nexPosition: THREE.Vec2;

  tick() {
    this.time += 0.04;
    var position = this.material.uniforms.u_zoomCenter.value as THREE.Vec2;
    var dX = this.nexPosition.x - position.x;
    var dY = this.nexPosition.y - position.y;

    if (Math.abs(dX) >= 0.01 || Math.abs(dY) >= 0.01) {
      this.material.uniforms.u_zoomCenter.value = new THREE.Vector2(
        position.x + dX / 10.0,
        position.y + dY / 10.0
      );
    } else {
      this.material.uniforms.u_zoomCenter.value = this.nexPosition;
    }

    if (this.zoomIn) {
      this.material.uniforms.u_zoomSize.value *= 0.995;
    } else {
      this.material.uniforms.u_zoomSize.value *= 1.05;
    }

    if (this.material.uniforms.u_zoomSize.value <= 0.00001) {
      this.zoomIn = false;
    } else if (this.material.uniforms.u_zoomSize.value >= 5) {
      let next = this.getZoomCenter();
      while (Math.abs(next.x - this.nexPosition.x) < 0.001) {
        next = this.getZoomCenter();
      }
      this.nexPosition = next;
      this.zoomIn = true;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame((n) => this.tick());
  }

  getZoomCenter(): THREE.Vector2 {
    let val = Math.round(Math.random() * 9);
    switch (val) {
      case 0:
        return new THREE.Vector2(-0.04524074130409, 0.9868162207157852);
      case 1:
        return new THREE.Vector2(0.2549870375144766, -0.0005679790528465);
      case 2:
        return new THREE.Vector2(-1.315180982097868, 0.073481649996795);
      case 3:
        return new THREE.Vector2(-0.7746806106269039, -0.1374168856037867);
      case 4:
        return new THREE.Vector2(-0.7336438924199521, 0.2455211406714035);
      case 5:
        return new THREE.Vector2(0.2929859127507, 0.6117848324958);
      case 6:
        return new THREE.Vector2(0.33698444648918, 0.048778219681);
      case 7:
        return new THREE.Vector2(0.3369844464869, 0.048778219666);
      case 8:
        return new THREE.Vector2(0.432539867562512, 0.226118675951818);
      case 9:
        return new THREE.Vector2(0.432539867562512, 0.226118675951765);
    }
  }
}
