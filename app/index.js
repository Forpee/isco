import { Renderer, Camera, Transform, Plane } from "ogl";
import NormalizeWheel from "normalize-wheel";
import { Curtains, Plane as Plane2, Vec2 } from "curtainsjs";
import debounce from "lodash/debounce";
import * as THREE from "three";
import _ from "lodash";
import { lerp } from "utils/math";

import Image1 from "images/brazilsamba.png";
import Image2 from "images/combinedisland.png";
import Image3 from "images/north.png";
import Image4 from "images/roughnecks.png";
import Image5 from "images/barbados.png";
import Image6 from "images/socarival.png";
import Image7 from "images/sccolombia.png";
import Image8 from "images/frenchconnection.png";
import Image9 from "images/fcespanol.png";
import Image10 from "images/haiti.png";

import logo from "images/logo.png"
import Media from "./Media";
import Background from "./Background";
import slide3 from "images/slide3.jpg"
import cuplogo from "images/cuplogo.png"
export default class App {
  constructor() {
    document.documentElement.classList.remove("no-js");

    this.scroll = {
      ease: 0.05,
      current: 0,
      target: 0,
      last: 0,
    };

    this.onCheckDebounce = debounce(this.onCheck, 200);

    this.createRenderer();
    this.createCamera();
    this.createScene();

    this.onResize();

    this.createGeometry();
    this.createMedias();
    this.createBackground();

    this.update();

    this.addEventListeners();

    this.createPreloader();
  }

  createPreloader() {
    Array.from(this.mediasImages).forEach(({ image: source }) => {
      const image = new Image();

      this.loaded = 0;

      image.src = source;
      image.onload = (_) => {
        this.loaded += 1;

        if (this.loaded === this.mediasImages.length) {
          document.documentElement.classList.remove("loading");
          document.documentElement.classList.add("loaded");
        }
      };
    });
  }

  createRenderer() {
    this.renderer = new Renderer();

    this.gl = this.renderer.gl;
    this.gl.clearColor(0.0196078, 0.0196078, 0.023529411, 1);
    document.getElementById("test").appendChild(this.gl.canvas);
    //document.body.appendChild(this.gl.canvas)
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias() {
    this.mediasImages = [
      { image: Image1, text: "Samba Warriors" },
      { image: Image2, text: "Combined Islands" },
      { image: Image3, text: "Americana North" },
      { image: Image4, text: "Jamaica Ruffnecks" },
      { image: Image5, text: "Barbados Challengers" },
      { image: Image6, text: "Soca Rivals" },
      { image: Image7, text: "SC Colombia" },
      { image: Image8, text: "French Connection" },
      { image: Image9, text: "As Esponola" },
      { image: Image10, text: "Haiti Pioneers" },
      { image: Image1, text: "Samba Warriors" },
      { image: Image2, text: "Combined Islands" },
      { image: Image3, text: "Americana North" },
      { image: Image4, text: "Jamaica Ruffnecks" },
      { image: Image5, text: "Barbados Challengers" },
      { image: Image6, text: "Soca Rivals" },
      { image: Image7, text: "SC Colombia" },
      { image: Image8, text: "French Connection" },
      { image: Image9, text: "As Esponola" },
      { image: Image10, text: "Haiti Pioneers" },
    ];

    this.medias = this.mediasImages.map(({ image, text }, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text,
        viewport: this.viewport,
      });

      return media;
    });
  }

  createBackground() {
    this.background = new Background({
      gl: this.gl,
      scene: this.scene,
      viewport: this.viewport,
    });
  }

  /**
   * Events.
   */
  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * 0.01;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(event) {
    this.isDown = false;

    this.onCheck();
  }

  onWheel(event) {
    const normalized = NormalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.005;

    this.onCheckDebounce();
  }

  onCheck() {
    const { width } = this.medias[0];
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;

    if (this.scroll.target < 0) {
      this.scroll.target = -item;
    } else {
      this.scroll.target = item;
    }
  }

  /**
   * Resize.
   */
  onResize() {
    this.screen = {
      height: window.innerHeight,
      width: window.innerWidth,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({
          screen: this.screen,
          viewport: this.viewport,
        })
      );
    }
  }

  /**
   * Update.
   */
  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    if (this.scroll.current > this.scroll.last) {
      this.direction = "right";
    } else {
      this.direction = "left";
    }

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    if (this.background) {
      this.background.update(this.scroll, this.direction);
    }

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });

    this.scroll.last = this.scroll.current;

    window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));

    window.addEventListener("mousewheel", this.onWheel.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));
  }
}



var canvas = document.getElementById("canvas2");
var width, height;

var viewAngle = 45,
  aspect = width / height,
  near = 0.01,
  far = 10000;

var renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

var scene = new THREE.Scene();

var material = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.9,
});

var sideLength, a, b, c, d, e, f, g, h, cords, lineWidth;

sideLength = 50;
lineWidth = 2;

a = 0.0;
b = 1.0;
c = 2.0;
d = (1.0 + Math.sqrt(5.0)) / 2.0;
e = 3.0 * d;
f = 1.0 + 2.0 * d;
g = 2.0 + d;
h = 2.0 * d;

a *= sideLength;
b *= sideLength;
c *= sideLength;
d *= sideLength;
e *= sideLength;
f *= sideLength;
g *= sideLength;
h *= sideLength;

var cords = [
  [+a, +b, +e],
  [+a, +b, -e],
  [+a, -b, +e],
  [+a, -b, -e],

  [+b, +e, +a],
  [+b, -e, +a],
  [-b, +e, +a],
  [-b, -e, +a],

  [+e, +a, +b],
  [-e, +a, +b],
  [+e, +a, -b],
  [-e, +a, -b],

  [+c, +f, +d],
  [+c, +f, -d],
  [+c, -f, +d],
  [-c, +f, +d],
  [+c, -f, -d],
  [-c, +f, -d],
  [-c, -f, +d],
  [-c, -f, -d],

  [+f, +d, +c],
  [+f, -d, +c],
  [-f, +d, +c],
  [+f, +d, -c],
  [-f, -d, +c],
  [+f, -d, -c],
  [-f, +d, -c],
  [-f, -d, -c],
  [+d, +c, +f],
  [-d, +c, +f],
  [+d, +c, -f],
  [+d, -c, +f],
  [-d, +c, -f],
  [-d, -c, +f],
  [+d, -c, -f],
  [-d, -c, -f],

  [+b, +g, +h],
  [+b, +g, -h],
  [+b, -g, +h],
  [-b, +g, +h],
  [+b, -g, -h],
  [-b, +g, -h],
  [-b, -g, +h],
  [-b, -g, -h],

  [+g, +h, +b],
  [+g, -h, +b],
  [-g, +h, +b],
  [+g, +h, -b],
  [-g, -h, +b],
  [+g, -h, -b],
  [-g, +h, -b],
  [-g, -h, -b],

  [+h, +b, +g],
  [-h, +b, +g],
  [+h, +b, -g],
  [+h, -b, +g],
  [-h, +b, -g],
  [-h, -b, +g],
  [+h, -b, -g],
  [-h, -b, -g],
];

var football = new THREE.Object3D();
var footballEdge;

var p0 = new THREE.Vector3(0, 0, 0);
var radius = new THREE.Vector3(
  cords[0][0],
  cords[0][1],
  cords[0][2]
).distanceTo(p0);

footballEdge = new THREE.Object3D();
footballEdge.position.z = radius / 7;

footballEdge.add(
  new THREE.Mesh(
    new THREE.TorusBufferGeometry(radius, lineWidth, 8, 128),
    material
  )
);

for (var i = 0; i < cords.length; ++i) {
  for (var j = 0; j < cords.length; ++j) {
    if (i === j) continue;

    var p1, p2, p3, distance, mid;

    (p1 = new THREE.Vector3(cords[i][0], cords[i][1], cords[i][2])),
      (p2 = new THREE.Vector3(cords[j][0], cords[j][1], cords[j][2]));

    distance = p1.distanceTo(p2);

    if (Math.round(distance) > c) continue;

    mid = new THREE.Vector3(
      (cords[i][0] + cords[j][0]) / 2,
      (cords[i][1] + cords[j][1]) / 2,
      (cords[i][2] + cords[j][2]) / 2
    );

    var scale = p1.distanceTo(p0) / mid.distanceTo(p0);
    p3 = new THREE.Vector3(
      mid.x * scale * scale,
      mid.y * scale * scale,
      mid.z * scale * scale
    );

    var curve = new THREE.QuadraticBezierCurve3(p1, p3, p2);

    var tubeGeom = new THREE.TubeGeometry(curve, 8, lineWidth, 4, false);

    football.add(new THREE.Mesh(tubeGeom, material));
  }
}

var facesCords = [
  [0, 28, 36, 39, 29],
  [1, 32, 41, 37, 30],
  [2, 33, 42, 38, 31],
  [3, 34, 40, 43, 35],
  [4, 12, 44, 47, 13],
  [5, 16, 49, 45, 14],
  [6, 17, 50, 46, 15],
  [7, 18, 48, 51, 19],
  [8, 20, 52, 55, 21],
  [9, 24, 57, 53, 22],
  [10, 25, 58, 54, 23],
  [11, 26, 56, 59, 27],

  // [0, 2, 31, 55, 52, 28],
  // [0, 29, 53, 57, 33, 2],
  // [1, 3, 35, 59, 56, 32],
  // [1, 30, 54, 58, 34, 3],
  // [4, 6, 15, 39, 36, 12],
  // [4, 13, 37, 41, 17, 6],
  // [5, 7, 19, 43, 40, 16],
  // [5, 14, 38, 42, 18, 7],
  // [8, 10, 23, 47, 44, 20],
  // [8, 21, 45, 49, 25, 10],
  // [9, 11, 27, 51, 48, 24],
  // [9, 22, 46, 50, 26, 11],
  // [12, 36, 28, 52, 20, 44],
  // [13, 47, 23, 54, 30, 37],
  // [14, 45, 21, 55, 31, 38],
  // [15, 46, 22, 53, 29, 39],
  // [16, 40, 34, 58, 25, 49],
  // [17, 41, 32, 56, 26, 50],
  // [18, 42, 33, 57, 24, 48],
  // [19, 51, 27, 59, 35, 43],
];

var indicesOfFaces = [];

for (var i = 0; i < facesCords.length; ++i) {
  var faceCord = facesCords[i];
  for (var j = 0; j < faceCord.length - 2; ++j) {
    indicesOfFaces.push(faceCord[0]);
    indicesOfFaces.push(faceCord[j + 1]);
    indicesOfFaces.push(faceCord[j + 2]);
  }
}

var facesGeom = new THREE.PolyhedronBufferGeometry(
  _.flattenDeep(cords),
  indicesOfFaces,
  radius,
  2
);

football.add(new THREE.Mesh(facesGeom, material));

scene.add(footballEdge);
scene.add(football);

function update() {
  football.rotation.x += 1 / 50;
  football.rotation.y += 1 / 100;
}

function resize() {
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  update();
}

function init() {
  scene.fog = new THREE.Fog(0x808080, 800, 1300);

  camera.position.z = 1000;
  renderer.setClearColor(0x000000, 0.0);
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  canvas.append(renderer.domElement);

  window.addEventListener("resize", _.debounce(resize, 50));
  render();
  resize();
}

window.addEventListener("load", init);

new App();
