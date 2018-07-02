var poly;
var soundLoop;
var reverb;
var lowPass;

var timeIntervals = [1/32, 1/4, 1/3, 1/2, 1];
var numVoices = [0, 1, 2, 3];
var midiNotes = [41, 48, 57, 60, 64, 67, 72, 74];

var dots = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  noStroke();
  colorMode(HSB);

  poly = new p5.PolySynth('triangle');
  poly.setADSR(0.0001, 0.3);

  reverb = new p5.Reverb();
  reverb.drywet(0.5);
  reverb.set(1.2, 3);

  lowPass = new p5.LowPass();
  lowPass.freq(1700);
  lowPass.biquad.Q.value = 12;
  lowPass.disconnect();

  poly.disconnect();
  poly.connect(lowPass);
  lowPass.connect(reverb);

  soundLoop = new p5.SoundLoop(soundLoop, 1);
  soundLoop.start();
}

function draw() {
  background(255, .02);

  for (var i = 0; i < dots.length; i++) {
    dot = dots[i];
    dot.update() && dot.draw();
  }
}

function soundLoop(t) {
  this.interval = random(timeIntervals);

  var noteCount = random(numVoices);

  for (var i = 0; i < noteCount; i++) {
    var midiNote = random(midiNotes);

    // dont play this note if it is already playing
    if (alreadyPlayingNote(midiNote)) {
      return;
    }

    var pitch = midiToFreq(midiNote);
    var vel = random(0.1, midiNote < 64 ? 0.3 : 0.25);
    var startTime = t + random(-1, 1) * 0;
    var susTime = random(0.2, 1.2) * this.interval;

    // play the note
    poly.play(pitch, vel, startTime, susTime);

    // add dot to render draw
    var dot = new Dot(midiNote, vel, startTime, susTime);
    dots.push(dot);
  }
}


function Dot(midiNote, velocity, startTime, susTime) {
  this.midiNote = midiNote;
  this.velocity = velocity;
  this.startMillis = millis();
  this.susTime = susTime;

  this.x = (width / midiNotes.length) * midiNotes.indexOf(midiNote) + (width / midiNotes.length / 2);
  this.y = 0;
  this.r = this.velocity * (width/midiNotes.length);
  this.alpha = 1;
  this.hue = map(this.x, 0, width, 180, 360);
}

Dot.prototype.update = function(index) {
  var decayRate = map(millis(), this.startMillis, this.startMillis + 1000 * this.susTime, 1.0, 0.975);
  this.alpha *= decayRate;
  this.y += 4;

  if (this.alpha <= 0.001 || this.y <= 0) {
    dots.splice(index, 1);
    return false;
  }
  return true;
}

Dot.prototype.draw = function() {
  fill(this.hue, 80, 120, this.alpha);
  ellipse(this.x, this.y, this.r, this.r);
}

function alreadyPlayingNote(midiNote) {
  var f = dots.filter(function(dot) {
    return dot.midiNote === midiNote
  });
  return f.length > 0;
}
