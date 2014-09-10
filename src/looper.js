define(function (require) {
  'use strict';

  // inspiration: https://github.com/cwilso/metronome/blob/master/js/metronome.js

  var p5sound = require('master');

  var lookahead = 25.0;       // How frequently to call scheduling function 
                              //(in milliseconds)
  var nextNoteTime = 0.0; // when the next note is due.
  var scheduleAheadTime = 0.1;  // How far ahead to schedule audio (sec)
                                // This is calculated from lookahead, and overlaps 
                                // with next interval (in case the timer is late)
  var timerID = 0;            // setInterval identifier.
  var notesInQueue = [];

  var bpm = 120;
  var beatLength;

  var mode;

  var activeParts = []; // array of active parts replaces currentLoop

  var onStep = function(){};

  p5.prototype.setBPM = function(BPM) {
    bpm = BPM;
  };

  // Phrase knows its currentStep
  p5.Phrase = function(name, callback, array) {
    this.phraseStep = 0;
    this.name = name;
    this.callback = callback;
    this.array = array;
  };

  // PARTS
  p5.Part = function(steps, bLength) {
    this.length = steps || 16; // how many beats
    this.partStep = 0;
    this.phrases = [];

    beatLength = bLength*4 || 0.5; // defaults to 4/4
    this.noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note

    this.isPlaying = false;
    // this.parts = [];

    // what does this looper do when it gets to the last step?
    this.onended = function(){
      this.stop();
    };

    this.metro = new p5.Metro();
    this.metro._init();
    this.callback = function(){};
  };

  p5.Part.prototype.setBPM = function(tempo, rampTime) {
    this.metro.setBPM(tempo, rampTime);
  };

  p5.Part.prototype.getBPM = function() {
    return this.metro.getBPM();
  };

  // time = seconds from now
  p5.Part.prototype.start = function(time) {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.metro.resetSync(this);
      var t = time || 0;
      this.metro.start(t);
    }
  };

  p5.Part.prototype.loop = function( ) {
    // rest onended function
    this.onended = function() {
      this.partStep = 0;
      // dont start phrases over, right?
    };
    this.start();
  };

  p5.Part.prototype.noLoop = function( ) {
    // rest onended function
    this.onended = function() {
      this.stop();
    };
  };

  p5.Part.prototype.stop = function(time) {
    this.partStep = 0;
    this.pause(time);
  };

  p5.Part.prototype.pause = function(time) {
    this.isPlaying = false;
    var t = time || 0;
    this.metro.stop(t);
  };

  // can either be a p5.Phrase or a name, callback, array
  p5.Part.prototype.addPhrase = function(name, callback, array) {
    var p;
    if (arguments.length === 3) {
      p = new p5.Phrase(name, callback, array);
    } else if (arguments[0] instanceof p5.Phrase) {
      p = arguments[0];
    } else {
      throw 'invalid input. addPhrase accepts name, callback, array or a p5.Phrase';
    }
    this.phrases.push(p);

    // reset the length if phrase is longer than part's existing length
    if (p.length > this.length) {
      this.length = p;
    }
  };

  p5.Part.prototype.removePhrase = function(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases.split(i, 1);
      }
    }
  };

  p5.Part.prototype.getPhrase = function(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        return this.phrases[i];
      }
    }
  };

  p5.Part.prototype.incrementStep = function(time) {
    if (this.partStep >= this.length) {
      this.onended();
    }
    this.partStep +=1;
    this.callback(time);
    // console.log(this.partStep + '/ ' + this.length);
  };

  /**
   *  Fire a callback function every step
   *  @param  {Function} callback [description]
   *  @return {[type]}            [description]
   */
  p5.Part.prototype.onStep = function(callback) {
    // onStep = callback;
    this.callback = callback;
    // console.log(this.callback);
  };


  // ===============
  // p5.Score
  // ===============

  var score;

  p5.Score = function() {
    // for all of the arguments
    this.parts = [];
    this.currentPart = 0;

    var thisScore = this;
    for (var i in arguments) {
      this.parts[i] = arguments[i];
      this.parts[i].nextPart = this.parts[i+1];
      this.parts[i].onended = function() {
        thisScore.resetPart(i);
        playNextPart(thisScore);
      };
    }
    this.looping = false;
  };

  p5.Score.prototype.onended = function() {
    if (this.looping) {
      this.resetParts();
      this.parts[0].start();
    } else {
      this.parts[this.parts.length - 1].onended = function() {
        this.stop();
        this.resetParts();
      }
    }
    this.currentPart = 0;
  };

  p5.Score.prototype.start = function() {
    mode = 'score';
    // score = this;
    this.parts[this.currentPart].start();
    this.scoreStep = 0;
  };

  p5.Score.prototype.stop = function() {
    this.parts[this.currentPart].stop();
    this.currentPart = 0;
    this.scoreStep = 0;
  };

  p5.Score.prototype.pause = function() {
    this.parts[this.currentPart].stop();
  };

  p5.Score.prototype.loop = function() {
    this.looping = true;
    this.start();
  };

  p5.Score.prototype.noLoop = function() {
    this.looping = false;
  };

  p5.Score.prototype.resetParts = function() {
    for (var i in this.parts) {
      this.parts[i].stop();
      this.parts[i].partStep = 0;
      for (var p in this.parts[i].phrases){
        this.parts[i].phrases[p].phraseStep = 0;
      }
    }
  };

  p5.Score.prototype.resetPart = function(i) {
    this.parts[i].stop();
    this.parts[i].partStep = 0;
    for (var p in this.parts[i].phrases){
      this.parts[i].phrases[p].phraseStep = 0;
    }
  };

  function playNextPart(aScore) {
    aScore.currentPart++;
    if (aScore.currentPart >= aScore.parts.length) {
      aScore.scoreStep = 0;
      aScore.onended();
    } else {
      aScore.scoreStep = 0;
      aScore.parts[aScore.currentPart - 1].stop();
      aScore.parts[aScore.currentPart].start();
    }
  }

});