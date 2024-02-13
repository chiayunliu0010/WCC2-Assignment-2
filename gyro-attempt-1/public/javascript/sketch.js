

// Create connection to Node.JS Server
const socket = io();

let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;

let xAxis = 0;
let yAxis = 0;
let zAxis = 0;

let rocket, mat;

let averageAmt = 0.1;
let curArgs = [];

function preload() {
  rocket = loadModel('./javascript/assets/Rocket.obj', true);
  mat = loadImage('./javascript/assets/texture.png');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  createEasyCam();
  for(let i = 0; i < 3; i++) {
    curArgs[i] = 0;
  }
  
}

function draw() {
  background(200);

  noStroke();
  lights();

  push();

  rotateZ(roll);
  rotateX(pitch);
  rotateY(yaw);

  translate(xAxis, yAxis, zAxis);
  texture(mat);
  model(rocket);

  pop();

}

//process the incoming OSC message and use them for our sketch
function unpackOSC(message){

  /*-------------

  This sketch is set up to work with the gryosc app on the apple store.
  Use either the gyro OR the rrate to see the two different behaviors
  TASK: 
  Change the gyro address to whatever OSC app you are using to send data via OSC
  ---------------*/

  //maps phone rotation directly 
  // if(message.address == "/gyrosc/gyro"){
  //   roll = message.args[0]; 
  //   pitch = message.args[1];
  //   yaw = message.args[2];
  // }

  //uses the rotation rate to keep rotating in a certain direction
  if(message.address == "/gyrosc/gyro"){
    roll = message.args[0] * 0.5;
    pitch = message.args[1] * 0.5;
    yaw = message.args[2] * 0.5;
  }

  else if(message.address == "/gyrosc/accel"){

    let newArgs = [];

    for(let i = 0; i < message.args.length; i++) {
      newArgs[i] = message.args[i] * averageAmt;
      curArgs[i] = (curArgs[i] * (1 - averageAmt)) + newArgs[i];
    }

    xAxis = curArgs[0] * 500;
    yAxis = curArgs[1] * 500;
    zAxis = curArgs[2] * 500;

    console.log(xAxis);
  }
}

//Events we are listening for
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});

// Callback function to recieve message from Node.JS
socket.on("message", (_message) => {

  //console.log(_message);

  unpackOSC(_message);

});