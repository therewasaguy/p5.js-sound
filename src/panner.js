'use strict';

define(function (require) {

  var p5sound = require('master');
  var ac = p5sound.audiocontext;
  var AudioParamUtils = require('utils/audioParam');

  // Stereo panner
  // if audioContext has a stereo panner node, use it
  if(typeof ac.createStereoPanner !== 'undefined') {
    p5.Panner = function (input, output) {
      this.stereoPanner = this.input = this.output = ac.createStereoPanner();
      input.connect(this.stereoPanner);
      this.connect(output);
    };

    p5.Panner.prototype.pan = function(val, rampTime, tFromNow) {
      return AudioParamUtils.setValue(this.stereoPanner.pan, val, rampTime, tFromNow);
    };

    //not implemented because stereopanner
    //node does not require this and will automatically
    //convert single channel or multichannel to stereo.
    //tested with single and stereo, not with (>2) multichannel
    p5.Panner.prototype.inputChannels = function() {};

    p5.Panner.prototype.disconnect = function() {
      this.stereoPanner.disconnect();
    };

  } else {
    // if there is no createStereoPanner object
    // such as in safari 10.1.1 at the time of writing this
    // use this method to create the effect
    p5.Panner = function(input, output, numInputChannels) {
      this.input = ac.createGain();
      input.connect(this.input);

      this.left = ac.createGain();
      this.right = ac.createGain();
      this.left.channelInterpretation = 'discrete';
      this.right.channelInterpretation = 'discrete';

      // if input is stereo
      if (numInputChannels > 1) {
        this.splitter = ac.createChannelSplitter(2);
        this.input.connect(this.splitter);

        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
      else {
        this.input.connect(this.left);
        this.input.connect(this.right);
      }

      this.output = ac.createChannelMerger(2);
      this.left.connect(this.output, 0, 1);
      this.right.connect(this.output, 0, 0);
      this.connect(output);
    };

    // -1 is left, +1 is right
    p5.Panner.prototype.pan = function(val, rampTime, tFromNow) {
      if (!val) {
        return Math.acos(this.right.gain.value) / (Math.PI/2) * 2 - 1;
      }

      var v = (val + 1) / 2;
      var rightVal = Math.cos(v * Math.PI/2);
      var leftVal = Math.sin(v * Math.PI/2);
      AudioParamUtils.setValue(this.left.gain, leftVal, rampTime, tFromNow);
      return AudioParamUtils.setValue(this.right.gain, rightVal, rampTime, tFromNow);
    };

    p5.Panner.prototype.inputChannels = function(numChannels) {
      if (numChannels === 1) {
        this.input.disconnect();
        this.input.connect(this.left);
        this.input.connect(this.right);
      } else if (numChannels === 2) {
        if (typeof(this.splitter === 'undefined')) {
          this.splitter = ac.createChannelSplitter(2);
        }
        this.input.disconnect();
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
    };
  }

  // shared methods
  p5.Panner.prototype.connect = function(unit) {
    if (!unit) {
      this.output.connect(p5sound.input);
    }
    else {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else {
        this.output.connect(unit);
      }
    }
  };

  p5.Panner.prototype.disconnect = function() {
    this.output.disconnect();
  };
});
