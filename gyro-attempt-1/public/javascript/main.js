//import three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';//camera controls
import Stats from 'three/examples/jsm/libs/stats.module';//frame rate and other stats

import { loadGltfs } from './loadGltfs.js';
const manager = new THREE.LoadingManager(); // loading manager - https://threejs.org/docs/#api/en/loaders/managers/LoadingManager
const socket = io();

let filesToLoad = 0; // number of files to load

let scene, camera, renderer, controls;//we can declare variables on one line like this
let light, dirLight;


manager.onStart = function (url, itemsLoaded, itemsTotal) {
  filesToLoad = itemsTotal; // set the total number of files to load
  console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  filesToLoad = itemsTotal; // set the total number of files to load
  console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  console.log(Math.round((itemsLoaded / filesToLoad) * 100))

  document.getElementById("load-progress").innerHTML = Math.round((itemsLoaded / filesToLoad) * 100) + "% Loaded"
};
manager.onLoad = function () {
  console.log('Loading complete!');
  setTimeout(function () { 
    document.getElementById("loading").classList.add("hidden"); 
  }, 1000);
};
manager.onError = function (url) {
  console.log('There was an error loading ' + url);
};

//helpers
let gui, stats, gridHelper;
let models = {};

async function preload() {
  models = await loadGltfs(manager);
  console.log('end of preload');

}

function init() {
  console.log('start of init');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // camera user interaction controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  //set up our scene
  // ambient light (from all around)
  light = new THREE.AmbientLight(0xfffafe); // soft white light
  scene.add(light);

  //directional light
  dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(- 1, 1.75, 1);//angle the light
  dirLight.position.multiplyScalar(20);// move it back... or do it in one line
  scene.add(dirLight);
  //see where your directional light is
  // const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
  // scene.add( dirLightHelper );

  //What is models, it's an object of objects. console log it out to look at how it is structured
  console.log("models object: ", models);
  
  // add loaded models to scene
  for (let mod in models) {
    //mod is the name of the javascript object key for each gltf we loaded in
    console.log("Models key name: ", mod);

    let gltfScene = models[mod].scene;
    scene.add(gltfScene);//add every model gltf scene

  }


  gridHelper = new THREE.GridHelper(40, 40);
  scene.add(gridHelper);

  stats = Stats();
  stats.showPanel(0); 
  document.body.appendChild(stats.dom)

  
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  stats.update();
}

//initialize then call animation loop
await preload();
init();
animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

}

function onKeyDown(event) {

  // console.log(event.key);//https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event
  if (event.key === "d") {
    //show hide the dat gui panel
    if (gui._hidden) {
      gui.show();
    } else {
      gui.hide();
    }
  }

};
