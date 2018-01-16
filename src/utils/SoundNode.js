'use strict';

// Base p5.sound SoundNode class
// Includes utility functions to schedule AudioParam value changes
// along the web audio timeline.

define(function () {
  var p5sound = require('master');
  var ac = p5sound.audiocontext;
  var TimelineSignal = require('Tone/signal/TimelineSignal');

  function SoundNode() {
    this.audiocontext = ac;
    this._audioParams = [];

    // add to the soundArray so we can dispose of it later
    p5sound.soundArray.push(this);
  }

  SoundNode.prototype = {
    // handle change in value to an AudioParam
    // `val` can be a number, or an audio control signal
    // `timeFromNow` is when this change begins
    // `rampTime` is how long to ramp the change
    _scheduleAudioParamValue: function(audioParam, val, rampTime, timeFromNow, rampType) {
      var acTime = (timeFromNow || 0) + ac.currentTime;
      var rampTime = rampTime || 0;
      var curVal = audioParam.timelineSignal
        ? audioParam.timelineSignal.getValueAtTime(acTime)
        : audioParam.value;

      // if audio param doesn't have a timeline signal, add one
      if(!audioParam.timelineSignal) {
        audioParam.timelineSignal = new TimelineSignal();
        this._audioParams.push(audioParam);
      }
      if (typeof val === 'number') {
        audioParam.cancelScheduledValues(acTime);
        audioParam.timelineSignal.cancelScheduledValues(acTime);
        audioParam.setValueAtTime(curVal, acTime);
        audioParam.timelineSignal.setValueAtTime(curVal, acTime);
        if (rampType === 'exponential' && !(val === 0 || curVal === 0)) {
          audioParam.exponentialRampToValueAtTime(val, acTime + rampTime);
          audioParam.timelineSignal.exponentialRampToValueAtTime(val, acTime + rampTime);
        } else {
          audioParam.linearRampToValueAtTime(val, acTime + rampTime);
          audioParam.timelineSignal.linearRampToValueAtTime(val, acTime + rampTime);
        }
      } else if (typeof val !== 'undefined' && val.connect) {
        val.connect(audioParam);
      }

      return audioParam.timelineSignal.getValueAtTime(acTime + rampTime);
    },

    _scheduleLinearAudioParamValue: function(audioParam, val, rampTime, timeFromNow, rampType) {
      return this._scheduleAudioParamValue(audioParam, val, rampTime, timeFromNow, rampType, 'linear');
    },

    _scheduleExponentialAudioParamValue: function(audioParam, val, rampTime, timeFromNow, rampType) {
      return this._scheduleAudioParamValue(audioParam, val, rampTime, timeFromNow, rampType, 'exponential');
    },

    dispose: function() {
      this._audioParams.forEach(function(audioParam) {
        audioParam.timelineSignal.dispose();
      });
      this._audioParams = [];

      // remove reference from soundArray
      var index = p5sound.soundArray.indexOf(this);
      p5sound.soundArray.splice(index, 1);

    }
  };

  return SoundNode;
});
