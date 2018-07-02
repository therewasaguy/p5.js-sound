var poly;
var soundLoop;
var reverb;

var timeIntervals = [1/4, 1/3, 1/2, 1];
var numVoices = [1, 2, 3];
var pitches = [48, 60, 64, 67, 72, 76];

function setup() {
  poly = new p5.PolySynth();
  poly.setADSR(0.001, 0.3);

  reverb = new p5.Reverb();
  reverb.drywet(0.5);

  poly.disconnect();
  poly.connect(reverb);

  soundLoop = new p5.SoundLoop(soundLoop, 1);
  soundLoop.start();
}


function soundLoop(t) {
  this.interval = random(timeIntervals);

  var noteCount = random(numVoices);
  var activeNotes = [];
  for (var i = 0; i < noteCount; i++) {
    var midiNote = midiToFreq(random(pitches));
    if (activeNotes.indexOf(midiNote) > 0) {
      return;
    }
    activeNotes.push(midiNote);
    var vel = random(0.05, 0.15);
    var startTime = t + random() * 0.1;
    var susTime = random() * this.interval/2;
    poly.play(midiNote, vel, startTime, susTime);
  }
}
