/**
 * This example uses the "db" option when calling fft.analyze to get
 * floating point results in dBFS (decibel full scale) where
 * 0 is the loudest amplitude this system can handle, and every
 * -6dB is half the aplitude.
 * 
 * The amplitude of the frequency spectrum is measured across 1024
 * points ("bins") and represented with color, from red/orange
 * at the lowest to purple/red at the highest frequencies.
 * 
 */

var soundFile;
var fft;
var binSize = 1024;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../_files/beat');
}

function setup() {
  colorMode(HSB);
  soundFile.play();

  createCanvas(1024, 400); 
  fill(255, 40, 255);
  noStroke();

  fft = new p5.FFT();
}

function draw() {
  background(30,20,30);

  var spectrum = fft.analyze(binSize, "db");

  for (var i = 0; i < binSize; i++){
    noStroke();

    // color in HSB, from 0 to 255
    fill(map(i, 0, binSize, 0, 255), 255, 255);

    // get the value of this bin
    var freqValue = spectrum[i];

    // map value to height
    var h = -height + map(freqValue, -140, 0, height, 0);

    // draw
    rect((i+1)*width/binSize - width/binSize, height, width/binSize, h);
    stroke(255);
  }
}

function keyPressed() {
  if (soundFile.isPlaying()){
    soundFile.pause();
  } else {
    soundFile.play();
  }
}
