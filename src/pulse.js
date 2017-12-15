'use strict';

define(function (require) {

  var p5sound = require('master');
  var p5Oscillator = require('oscillator');
  var AudioParamUtils = require('utils/audioParam');

  /**
   *  Creates a Pulse object, an oscillator that implements
   *  Pulse Width Modulation.
   *  The pulse is created with two oscillators.
   *  Accepts a parameter for frequency, and to set the
   *  width between the pulses. See <a href="
   *  http://p5js.org/reference/#/p5.Oscillator">
   *  <code>p5.Oscillator</code> for a full list of methods.
   *
   *  @class p5.Pulse
   *  @extends p5.Oscillator
   *  @constructor
   *  @param {Number} [freq] Frequency in oscillations per second (Hz)
   *  @param {Number} [w]    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   *  @example
   *  <div><code>
   *  var pulse;
   *  function setup() {
   *    background(0);
   *
   *    // Create and start the pulse wave oscillator
   *    pulse = new p5.Pulse();
   *    pulse.amp(0.5);
   *    pulse.freq(220);
   *    pulse.start();
   *  }
   *
   *  function draw() {
   *    var w = map(mouseX, 0, width, 0, 1);
   *    w = constrain(w, 0, 1);
   *    pulse.width(w)
   *  }
   *  </code></div>
   */
  p5.Pulse = function(freq, w) {
    p5Oscillator.call(this, freq, 'sawtooth');

    // width of PWM, should be betw 0 to 1.0
    this.w = w || 0;

    // create a second oscillator with inverse frequency
    this.osc2 = new p5.SawOsc(freq);

    // create a delay node
    this.dNode = p5sound.audiocontext.createDelay();

    // dc offset
    this.dcOffset = createDCOffset();
    this.dcGain = p5sound.audiocontext.createGain();
    this.dcOffset.connect(this.dcGain);
    this.dcGain.connect(this.output);
    // set delay time based on PWM width
    this.f = freq || 440;
    var mW = this.w / this.oscillator.frequency.value;
    this.dNode.delayTime.value = mW;
    this.dcGain.gain.value = 1.7*(0.5-this.w);

    // disconnect osc2 and connect it to delay, which is connected to output
    this.osc2.disconnect();
    this.osc2.panner.disconnect();
    this.osc2.amp(-1); // inverted amplitude
    this.osc2.output.connect(this.dNode);
    this.dNode.connect(this.output);

    this.output.gain.value = 1;
    this.output.connect(this.panner);
  };

  p5.Pulse.prototype = Object.create(p5Oscillator.prototype);

  /**
   *  Set the width of a Pulse object (an oscillator that implements
   *  Pulse Width Modulation).
   *
   *  @method  width
   *  @param {Number} [width]    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   */
  p5.Pulse.prototype.width = function(w) {
    if (typeof w === 'number') {
      if (w <= 1.0 && w >= 0.0) {
        this.w = w;
        // set delay time based on PWM width

        // var mW = map(this.w, 0, 1.0, 0, 1/this.f);
        var mW = this.w / this.oscillator.frequency.value;
        this.dNode.delayTime.value = mW;
      }

      this.dcGain.gain.value = 1.7*(0.5-this.w);
    } else {
      w.connect(this.dNode.delayTime);
      var sig = new p5.SignalAdd(-0.5);
      sig.setInput(w);
      sig = sig.mult(-1);
      sig = sig.mult(1.7);
      sig.connect(this.dcGain.gain);
    }
  };

  p5.Pulse.prototype.start = function(f, time) {
    var now = p5sound.audiocontext.currentTime;
    var t = time || 0;
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.oscillator.type = type;
      this.oscillator.connect(this.output);
      this.oscillator.start(t + now);

      // set up osc2
      this.osc2.oscillator = p5sound.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.setValueAtTime(freq, t + now);
      this.osc2.oscillator.type = type;
      this.osc2.oscillator.connect(this.osc2.output);
      this.osc2.start(t + now);
      this.freqNode = [this.oscillator.frequency, this.osc2.oscillator.frequency];

      // start dcOffset, too
      this.dcOffset = createDCOffset();
      this.dcOffset.connect(this.dcGain);
      this.dcOffset.start(t + now);

      // if LFO connections depend on these oscillators
      if (this.mods !== undefined && this.mods.frequency !== undefined) {
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);
      }
      this.started = true;
      this.osc2.started = true;
    }
  };

  p5.Pulse.prototype.stop = function(time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.osc2.oscillator.stop(t + now);
      this.dcOffset.stop(t + now);
      this.started = false;
      this.osc2.started = false;
    }
  };

  p5.Pulse.prototype.freq = function(val, rampTime, tFromNow) {
    var param1 = this.oscillator.frequency;
    var param2 = this.osc2.oscillator.frequency;
    AudioParamUtils.setExponentialValue(param1, val, rampTime, tFromNow);
    return AudioParamUtils.setExponentialValue(param2, val, rampTime, tFromNow);
  };

  // inspiration: http://webaudiodemos.appspot.com/oscilloscope/
  function createDCOffset() {
    var ac = p5sound.audiocontext;
    var buffer=ac.createBuffer(1,2048,ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i=0; i<2048; i++)
      data[i]=1.0;
    var bufferSource=ac.createBufferSource();
    bufferSource.buffer=buffer;
    bufferSource.loop=true;
    return bufferSource;
  }

});
