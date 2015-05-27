define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  <p>FFT (Fast Fourier Transform) is an analysis algorithm that
   *  isolates individual
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency">
   *  audio frequencies</a> within a waveform.</p>
   *
   *  <p>Once instantiated, a p5.FFT object can return an array based on
   *  two types of analyses: <br> • <code>FFT.waveform()</code> computes
   *  amplitude values along the time domain. The array indices correspond
   *  to samples across a brief moment in time. Each value represents
   *  amplitude of the waveform at that sample of time.<br>
   *  • <code>FFT.analyze() </code> computes amplitude values along the
   *  frequency domain. The array indices correspond to frequencies (i.e.
   *  pitches), from the lowest to the highest that humans can hear. Each
   *  value represents amplitude at that slice of the frequency spectrum.
   *  Use with <code>getEnergy()</code> to measure amplitude at specific
   *  frequencies, or within a range of frequencies. </p>
   *
   *  <p>FFT analyzes a very short snapshot of sound called a sample
   *  buffer. It returns an array of amplitude measurements, referred
   *  to as <code>bins</code>. The array is 1024 bins long by default.
   *  You can change the bin array length, but it must be a power of 2
   *  between 16 and 1024 in order for the FFT algorithm to function
   *  correctly. The actual size of the FFT buffer is twice the 
   *  number of bins, so given a standard sample rate, the buffer is
   *  2048/44100 seconds long.</p>
   *  
   * 
   *  @class p5.FFT
   *  @constructor
   *  @param {Number} [smoothing]   Smooth results of Freq Spectrum.
   *                                0.0 < smoothing < 1.0.
   *                                Defaults to 0.8.
   *  @param {Number} [bins]    Length of resulting array.
   *                            Must be a power of two between
   *                            16 and 1024. Defaults to 1024.
   *  @return {Object}    FFT Object
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup(){
   *    createCanvas(100,100);
   *    sound.loop();
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    var spectrum = fft.analyze(); 
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      var x = map(i, 0, spectrum.length, 0, width);
   *      var h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h )
   *    }
   *
   *    var waveform = fft.waveform();
   *    noFill();
   *    beginShape();
   *    stroke(255,0,0); // waveform is red
   *    strokeWeight(1);
   *    for (var i = 0; i< waveform.length; i++){
   *      var x = map(i, 0, waveform.length, 0, width);
   *      var y = map( waveform[i], 0, 255, 0, height);
   *      vertex(x,y);
   *    }
   *    endShape();
   *  }
   *  
   *  function mouseClicked(){
   *    sound.stop();
   *  }
   *  </code></div>
   */
  p5.FFT = function(smoothing, bins) {
    this.smoothing = smoothing || 0.8;
    this.bins = bins || 1024;

    var FFT_SIZE = this.bins*2;
    this.analyser = p5sound.audiocontext.createAnalyser();

    // default connections to p5sound master
    p5sound.fftMeter.connect(this.analyser);

    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.fftSize = FFT_SIZE;

    this.freqDomain = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);

    // predefined frequency ranages, these will be tweakable
    this.bass = [20, 140];
    this.lowMid = [140, 400];
    this.mid = [400, 2600];
    this.highMid = [2600, 5200];
    this.treble = [5200, 14000];

  };

  /**
   *  Set the input source for the FFT analysis. If no source is
   *  provided, FFT will analyze all sound in the sketch.
   *
   *  @method  setInput
   *  @param {Object} [source] p5.sound object (or web audio API source node)
   */
  p5.FFT.prototype.setInput = function(source) {
    if (!source) {
      p5sound.fftMeter.connect();

    } else {
      if (source.output){
        source.output.connect(this.analyser);
      } else if(source) {
        source.connect(this.analyser);
      }
      p5sound.fftMeter.disconnect();
    }

  };

  /**
   *  Returns an array of amplitude values (between 0-255) that represent
   *  a snapshot of amplitude readings in a single buffer. Length will be
   *  equal to bins (defaults to 1024). Can be used to draw the waveform
   *  of a sound. 
   *  
   *  @method waveform
   *  @param {Number} [bins]    Must be a power of two between
   *                            16 and 1024. Defaults to 1024.
   *  @return {Array}  Array    Array of amplitude values (0-255)
   *                            over time. Array length = bins.
   *
   */
  p5.FFT.prototype.waveform = function(bins) {
    if (bins) {
      this.analyser.fftSize = bins*2;
    } else {
      this.analyser.fftSize = this.bins * 2;
    }
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.getByteTimeDomainData(this.timeDomain);
    var  normalArray = Array.apply( [], this.timeDomain );
    normalArray.length === this.analyser.fftSize;
    normalArray.constructor === Array;
    return normalArray;
  };

  /**
   *  Returns an array of amplitude values (between 0 and 255)
   *  across the frequency spectrum. Length is equal to FFT bins
   *  (1024 by default). The array indices correspond to frequencies
   *  (i.e. pitches), from the lowest to the highest that humans can
   *  hear. Each value represents amplitude at that slice of the
   *  frequency spectrum. Must be called prior to using
   *  <code>getEnergy()</code>.
   *
   *  @method analyze
   *  @param {Number} [bins]    Must be a power of two between
   *                             16 and 1024. Defaults to 1024.
   *  @return {Array} spectrum    Array of energy (amplitude/volume)
   *                              values across the frequency spectrum.
   *                              Lowest energy (silence) = 0, highest
   *                              possible is 255.
   *  @example
   *  <div><code>
   *  var osc;
   *  var fft;
   *
   *  function setup(){
   *    createCanvas(100,100);
   *    osc = new p5.Oscillator();
   *    osc.start();
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    var freq = map(mouseX, 0, 800, 20, 15000);
   *    freq = constrain(freq, 1, 20000);
   *    osc.freq(freq);
   *
   *    var spectrum = fft.analyze(); 
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      var x = map(i, 0, spectrum.length, 0, width);
   *      var h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h )
   *    }
   *
   *    stroke(255);
   *    text('Freq: ' + round(freq)+'Hz', 10, 10); 
   *  }
   *  </code></div>
   *                                   
   *
   */
  p5.FFT.prototype.analyze = function(bins) {
    if (bins) {
      this.analyser.fftSize = bins*2;
    } else {
      this.analyser.fftSize = this.bins * 2;
    }
    this.analyser.smoothingTimeConstant = this.smoothing;
    this.analyser.getByteFrequencyData(this.freqDomain);
    var  normalArray = Array.apply( [], this.freqDomain );
    normalArray.length === this.analyser.fftSize;
    normalArray.constructor === Array;
    return normalArray;
  };

  /**
   *  Returns the amount of energy (volume) at a specific
   *  <a href="en.wikipedia.org/wiki/Audio_frequency" target="_blank">
   *  frequency</a>, or the average amount of energy between two
   *  frequencies. Accepts Number(s) corresponding
   *  to frequency (in Hz), or a String corresponding to predefined
   *  frequency ranges ("bass", "lowMid", "mid", "highMid", "treble").
   *  Returns a range between 0 (no energy/volume at that frequency) and
   *  255 (maximum energy). 
   *  <em>NOTE: analyze() must be called prior to getEnergy(). Analyze()
   *  tells the FFT to analyze frequency data, and getEnergy() uses
   *  the results determine the value at a specific frequency or
   *  range of frequencies.</em></p>
   *  
   *  @method  getEnergy
   *  @param  {Number|String} frequency1   Will return a value representing
   *                                energy at this frequency. Alternately,
   *                                the strings "bass", "lowMid" "mid",
   *                                "highMid", and "treble" will return
   *                                predefined frequency ranges.
   *  @param  {Number} [frequency2] If a second frequency is given,
   *                                will return average amount of
   *                                energy that exists between the
   *                                two frequencies.
   *  @return {Number}   Energy   Energy (volume/amplitude) from
   *                              0 and 255.
   *                                       
   */
  p5.FFT.prototype.getEnergy = function(frequency1, frequency2) {
    var nyquist = p5sound.audiocontext.sampleRate/2;

    if (frequency1 === 'bass') {
      frequency1 = this.bass[0];
      frequency2 = this.bass[1];
    } else if (frequency1 === 'lowMid') {
      frequency1 = this.lowMid[0];
      frequency2 = this.lowMid[1];
    } else if (frequency1 === 'mid') {
      frequency1 = this.mid[0];
      frequency2 = this.mid[1];
    } else if (frequency1 === 'highMid') {
      frequency1 = this.highMid[0];
      frequency2 = this.highMid[1];
    } else if (frequency1 === 'treble') {
      frequency1 = this.treble[0];
      frequency2 = this.treble[1];
    }

    if (typeof(frequency1) !== 'number') {
      throw 'invalid input for getEnergy()';
    }

    // if only one parameter:
    else if (!frequency2) {
      var index = Math.round(frequency1/nyquist * this.freqDomain.length);
      return this.freqDomain[index];
    }

    // if two parameters:
    else if (frequency1 && frequency2) {
      // if second is higher than first
      if (frequency1 > frequency2) {
        var swap = frequency2;
        frequency2 = frequency1;
        frequency1 = swap;
      }
      var lowIndex = Math.round(frequency1/nyquist * this.freqDomain.length);
      var highIndex = Math.round(frequency2/nyquist * this.freqDomain.length);

      var total = 0;
      var numFrequencies = 0;
      // add up all of the values for the frequencies
      for (var i = lowIndex; i<=highIndex; i++) {
        total += this.freqDomain[i];
        numFrequencies += 1;
      }
      // divide by total number of frequencies
      var toReturn = total/numFrequencies;
      return toReturn;
    }
    else {
      throw 'invalid input for getEnergy()';
    }
  };

  // compatability with v.012, changed to getEnergy in v.0121. Will be deprecated...
  p5.FFT.prototype.getFreq = function(freq1, freq2) {
    console.log('getFreq() is deprecated. Please use getEnergy() instead.');
    var x = this.getEnergy(freq1, freq2);
    return x;
  }
  /**
   *  Smooth FFT analysis by averaging with the last analysis frame.
   *  
   *  @method smooth
   *  @param {Number} smoothing    0.0 < smoothing < 1.0.
   *                               Defaults to 0.8.
   */
  p5.FFT.prototype.smooth = function(s) {
    this.smoothing = s;
    this.analyser.smoothingTimeConstant = s;
  };

  /**
   *  Get Pitch inspired by Chris Wilson's Pitch Detect
   *  
   *  https://github.com/cwilso/PitchDetect
   *
   *  Note: This temporarily resets the fftSize to the
   *  maximum amount for more accuracy, resulting in 1024 bins.
   *
   *  Note: This won't work on Safari because analyser.getFloatTimeDomainData is not yet implemented.
   *  
   *  @method  getPitch
   *  @param {Number} returnType 0 = frequency (Hz), 1 = MIDI number, 2 = Array [midiNumber, cents]
   *  @return {Number} Pitch as a frequency or MIDI number
   */
   p5.FFT.prototype.getPitch = function(_returnType) {
    var returnType = _returnType || 0;
    var fftSize = 2048;
    var bufLen = fftSize/2;
    var buf = new Float32Array( bufLen );

    // this.analyser.smoothingTimeConstant = 0.7;
    this.analyser.fftSize = fftSize;
    this.analyser.getFloatTimeDomainData( buf );

    var pitch = _autoCorrelate( buf );

    if (pitch > 80 && pitch < 1200) {
      var dif = Math.sqrt( Math.abs(pitch*pitch - this._lastPitch*this._lastPitch) );

      // throw out big attacks
      if (this._lastPitch && dif > 400) {
        this._lastPitch = Math.abs(pitch - this._lastPitch)/2;
        return false;
      }

      this._lastPitch = pitch;

      var note = p5.prototype.freqToMidi(pitch);
      var cents = centsOffFromPitch (pitch, note);

      switch(returnType) {
        case 0:
          return pitch;
        case 1:
          return note;
        case 2:
          var noteName = noteStrings[note%12];
          var octave = Math.floor(note/12);
          return noteName + octave;
        case 3:
          return [note, cents];
        case 4:
          return [pitch, note, cents];
      }
    } else {
      return false;
    }
   };

    var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

   // (c) Chris Wilson MIT License 2014 via https://github.com/cwilso/PitchDetect
   // also useful: https://plus.google.com/u/0/+ChrisWilson/posts/9zHsF9PCDAL
   // returns frequency
   function _autoCorrelate( buf ) {
    var bufLen = buf.length;
    var max_samples = Math.floor(bufLen/2);
    var min_samples = 0;
    var best_offset = -1;
    var best_correlation = 0;
    var rms = 0;
    var foundGoodCorrelation = false;
    var correlations = new Array(max_samples);
    var sampleRate = p5sound.audiocontext.sampleRate;

    for (var i = 0; i < bufLen; i++) {
      var val = buf[i];
      rms += val*val;
    }

    rms = Math.sqrt(rms/bufLen);

    // not enough signal
    if (rms < 0.01) {
      return -1;
    }

    var lastCorrelation = 1;

    for (var offset = min_samples; offset < max_samples; offset++) {
      var correlation = 0;

      for (var i = 0; i < max_samples; i++) {
        correlation += Math.abs( (buf[i]) - (buf[i+offset]) );
      }

      correlation = 1 - (correlation/max_samples);
      correlations[offset] = correlation; // store it

      if ( (correlation > 0.92) && (correlation > lastCorrelation) ) {
        foundGoodCorrelation = true;
        if (correlation > best_correlation) {
          best_correlation = correlation;
          best_offset = offset;
        }
      }
      else if (foundGoodCorrelation) {
        // via https://plus.google.com/u/0/+ChrisWilson/posts/9zHsF9PCDAL
        // var alpha = buf[best_offset-1]/0.434294481;
        // var beta = buf[best_offset]/0.434294481;
        // var gamma = buf[best_offset+1]/0.434294481;
        // best_offset += (gamma-alpha)/(2*((2*beta)-gamma-alpha));

        // // Then, the fundamental frequency is calculated as:
        // var pitch = best_offset*(sampleRate/(2*bufLen));﻿
        // console.log(pitch);
        // return pitch;

        // short circuit return
        var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];
        var pitch = sampleRate/(best_offset+(8*shift));
        if (pitch > 80 && pitch < 1400) {
          return pitch;
        }
      }
      lastCorrelation = correlation;
    }

    if (best_correlation > 0.01) {
      var pitch = sampleRate/best_offset;
      if (pitch > 80 && pitch < 1400) {
        return sampleRate/best_offset;
      }
    }
    return -1;
   }

    // helper
    function centsOffFromPitch( frequency, note ) {
      return Math.floor( 1200 * Math.log( frequency / midiToFreq( note ))/Math.log(2) );
    }

});