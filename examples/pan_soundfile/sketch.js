// ====================
// DEMO: play a sound at a random speed/pitch when the ball hits the edge.
// Pan the sound file left when ball hits left edge and vice versa.
// ====================



var ball;
var soundFile;
var panning;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/drum');
}

function setup() {
  createCanvas(400, 400); 

  soundFile.volume = .6;

  // create the ball
  ball = {
    x: width/2,
    y: height/2,
    speed: 7
  }
}

function draw() {
  background(0);

  ball.x += ball.speed;

  panning = constrain(map(ball.x, 0, width, -1, 1), -1, 1);

  // when the ball hits the wall...
  if (ball.x > width || ball.x < 0) {

    // map the ball's x location to a panning degree (float between -1.0 and 1.0)
    soundFile.pan(panning);

    // set a random playback speed for the sound
    var newSpeed = random(1);
    ball.speed = -ball.speed;
    // soundFile.rate(newSpeed);

    // play the sound
    soundFile.play();
  }
  ellipse(ball.x, ball.y, 100, 100);
  fill(255)
  text('pan ' + soundFile.pan() , 20, 20);
  text('desired ' + panning, 20, 40);
}
