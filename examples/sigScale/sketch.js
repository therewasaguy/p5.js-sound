// note this example does not work on
// Safari because getFloatTimeDomainData
// has not yet been implemented (as of November 2015)

var sqr;
var lowPass;

var mod;
var fftMod;
var fftMain;

var modWave;
var maxAmp = null;
var minAmp = null;

function setup() {
  createCanvas(600, 600);
  noFill();

  sqr = new p5.Oscillator('square');
  sqr.freq(110);
  sqr.disconnect();
  sqr.amp(0.2);

  lowPass = new p5.Filter('lowpass');
  lowPass.res(18);
  lowPass.freq(110);

  sqr.connect(lowPass);
  sqr.start();

  mod = new p5.Oscillator('sine');
  mod.freq(3);
  mod.disconnect();
  mod.scale(50, 20000, 10);
  mod.start();
  mod.amp(1);

  fftMod = new p5.FFT();
  fftMod.setInput(mod);

  fftMain = new p5.FFT();
  fftMain.setInput(lowPass);

  lowPass.freq(mod);
}

function draw() {
  background(220);
  rect(0,0,width/2, height);

  modWave = fftMod.waveform('float');

  getMaxAndMin(modWave);

  noFill();
  beginShape();
  for (var i = 0; i < modWave.length; i++) {
    var x = map(i, 0, modWave.length, 0, width/2);
    var y = map(modWave[i], minAmp, maxAmp, height, 0);
    vertex(x, y);
  }
  endShape();

  var outWave = fftMain.waveform('float');

  beginShape();
  for (var i = 0; i < outWave.length; i++) {
    var x = map(i, 0, outWave.length, width/2, width);
    var y = map(outWave[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();

  fill(0);
  text('max: ' + maxAmp, 20, 20);
  text('min: ' + minAmp, 20, 40);

}

function getMaxAndMin(numArray) {
  var localMax = Math.max.apply(null, numArray);
  if (localMax > maxAmp || !maxAmp) {
    maxAmp = localMax;
  }

  var localMin = Math.min.apply(null, numArray);
  if (localMin < minAmp || !minAmp) {
    minAmp = localMin;
  }
}

