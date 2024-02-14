
// Create connection to Node.JS Server
const socket = io();

let stars = []; // An array for storing the positions of the stars
let numberOfStars = 2000; // Total number of stars
let canvas;
let roll = 0;
let pitch = 0;
let yaw = 0;
let m;//Model rockets

function preload(){
  m = loadModel('./javascript/Rocket.obj');

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  debugMode();
  createEasyCam();

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
  background(0);

  //star
  drawStars(2000); 

  rotateX(frameCount*0.01);
  rotateY(frameCount*0.01);
  model(m);
 

  noStroke();
  lights();
  ambientMaterial(100, 0, 100);

  rotateZ(pitch);
  rotateX(roll);
  rotateY(yaw);

}


// Functions for drawing stars
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
  // if(message.address == "/gyrosc/public/Rocket.obj"){
  //   roll += map(message.args[0],-3,3,-0.1,0.1);
  //   pitch += map(message.args[1],-3,3,-0.1,0.1);
  //   yaw += map(message.args[2],-3,3,-0.1,0.1);

  // }

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

  console.log(_message);

  unpackOSC(_message);

});