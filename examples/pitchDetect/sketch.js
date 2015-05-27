var file ='../_files/Peter_Johnston_-_12_-_La_ere_gymnopedie.mp3';

var source_file; // sound file
var src_length; // hold its duration

var fft;

var pg; // to draw waveform

var playing = false;
var button;

var osc;

function preload(){
    source_file = loadSound(file); // preload the sound
}

function setup() {
  createCanvas(windowWidth, 250);
  textAlign(CENTER);

  osc = new p5.TriOsc();
  osc.start();
  osc.amp(0);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  println("source duration: " +src_length);

  // draw the waveform to an off-screen graphic
  var peaks = source_file.getPeaks(); // get an array of peaks
  pg = createGraphics(width,150);
  pg.background(100);
  pg.translate(0,75);
  pg.noFill();
  pg.stroke(0);
  for (var i = 0 ; i < peaks.length ; i++){
        var x = map(i,0,peaks.length,0,width);
        var y = map(peaks[i],0,1,0,150);
          pg.line(x,0,x,y);
          pg.line(x,0,x,-y);
   }


    // FFT
   fft = new p5.FFT();
   // source_file.disconnect();
   fft.setInput(source_file);

   amp = new p5.Amplitude();
   amp.setInput(source_file);

    // gui
   button = createButton('play');
   button.position(3, 3);
   button.mousePressed(play);
}


function draw() {
    background(180);

    image(pg,0,100); // display our waveform representation

     // draw playhead position 
    fill(255,255,180,150);
    noStroke();
    rect(map(source_file.currentTime(),0,src_length,0,windowWidth),100,3,150);
    //display current time
    text("current time: "+nfc(source_file.currentTime(),1)+" s",60,50);

    // we need to call fft.analyse() before the update functions of our class
    // this is because we use the getEnergy method inside our class.
    var note = fft.getPitch();  

    if (note) {
      console.log(note);
      osc.amp(amp.getLevel()*2);
      osc.freq(note);
      // osc.freq(midiToFreq(note));
    }

    // if (pitch > 0) {
    //   var note = freqToMidi(pitch);

    //   var cents = centsOffFromPitch (pitch, note);

    //   var noteName = noteStrings[note%12];
    //   var octave = Math.floor(note/12);
    //   console.log(noteName + octave + ' cents: ' + cents);
    // }

}

function mouseClicked(){
    if(mouseY>100 && mouseY<350){       
        var playpos = constrain(map(mouseX,0,windowWidth,0,src_length),0,src_length);   
        source_file.play(); 
        source_file.play(0,1,1,playpos,src_length); 
        playing = true;
        button.html('pause');       
    }   
    return false;//callback for p5js
}

function keyTyped(){
    if (key == ' '){
        play();
    }
    return false; // callback for p5js
}

function play(){
    if(playing){
        source_file.pause();
        button.html('play');
        playing = false;
    }
    else{
        source_file.play();
        button.html('pause');
        playing = true;
    }   
}