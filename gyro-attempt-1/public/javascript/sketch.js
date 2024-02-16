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

let stars = [];
let numberOfStars = 2000; // Total number of stars
let cloudVector = [];

function preload() {
  rocket = loadModel('./javascript/assets/Rocket.obj', true);
  mat = loadImage('./javascript/assets/texture.png');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  //debugMode();
  //camera(0, 0, 250);
  createEasyCam();
  for(let i = 0; i < 3; i++) {
    curArgs[i] = 0;
  }

  for(let j = 0; j < 4; j++) {
    cloudVector[j] = [];
  }

  let starFieldSize = 2000; 

  for (let i = 0; i < numberOfStars; i++) {
    stars.push({
      x: random(-starFieldSize, starFieldSize), // Using the starFieldSize variable to increase the range
      y: random(-starFieldSize, starFieldSize),
      z: random(-starFieldSize, starFieldSize)
    });
  }
  
}

function draw() {
  background(20);

  noStroke();
  lights();

  drawStars(2000);
  rocketMovement();
}

function rocketMovement(){
  push();

  rotateZ(roll);
  rotateX(pitch);
  rotateY(yaw);

  translate(0, yAxis, zAxis);
  texture(mat);
  model(rocket);

  pop();

  let cXPos = [];
  let cYPos = [];
  let cZPos = [];

  cXPos[0] = 50*cos(yaw) + 30;
  cYPos[0] = 50*cos(pitch) + yAxis;
  cZPos[0] = 50*sin(pitch) + 50*sin(yaw) + zAxis;

  cXPos[1] = 50*cos(yaw) + 30;
  cYPos[1] = -50*cos(pitch) + yAxis;
  cZPos[1] = -50*sin(pitch) + 50*sin(yaw) + zAxis;

  for(let i = 0; i < cXPos.length; i++) {
    let pos = createVector(cXPos[i], cYPos[i], cZPos[i]); 
    cloudVector[i].push(pos); //document the position of trail vertex

    if(cloudVector[i].length > 50) {
      cloudVector[i].splice(0, 1);
    }
  }

  for(let i = 0; i < cloudVector.length; i++) {
    push();

    for(let j = 0; j < cloudVector[i].length; j++) {

      let colour = map(j, 50, 0, 255, 0);
      strokeWeight(5);
      stroke(255, colour);
      noFill();
      if(j > 0) {
        beginShape();
        vertex(cloudVector[i][j].x + 500-(10*j), cloudVector[i][j].y, cloudVector[i][j].z);
        vertex(cloudVector[i][j-1].x + 500-(10*(j+1)), cloudVector[i][j-1].y, cloudVector[i][j-1].z);
        endShape();
      }
      
    }

    pop();
  }
}

function drawStars(numberOfStars) {
  push(); // Save the current drawing settings
  stroke(255); // Set the colour of the star to white
  strokeWeight(2); // You can adjust the size of the stars
  for (let star of stars) {
    point(star.x, star.y, star.z);
  }
  pop(); // Restore the previous drawing settings
}

//process the incoming OSC message and use them for our sketch
function unpackOSC(message){

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
    yAxis = -curArgs[1] * 500;
    zAxis = curArgs[2] * 500;
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