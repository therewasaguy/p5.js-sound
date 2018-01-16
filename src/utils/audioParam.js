'use strict';

// Util functions for Audio Params
// to schedule value changes along the web audio timeline

define(function () {
  var ac = p5.prototype.getAudioContext();
  var TimelineSignal = require('Tone/signal/TimelineSignal');

  function setValue(audioParam, val, rampTime, timeFromNow, rampType) {
    var acTime = (timeFromNow || 0) + ac.currentTime;
    var rampTime = rampTime || 0;
    var curVal = audioParam.timelineSignal
      ? audioParam.timelineSignal.getValueAtTime(acTime)
      : audioParam.value;

    // if audio param doesn't have a timeline signal, add one
    if(!audioParam.timelineSignal) {
      audioParam.timelineSignal = new TimelineSignal();
    }
    if (typeof val !== 'undefined') {
      audioParam.cancelScheduledValues(acTime);
      audioParam.timelineSignal.cancelScheduledValues(acTime);
      if (typeof val === 'number') {
        audioParam.setValueAtTime(curVal, acTime);
        audioParam.timelineSignal.setValueAtTime(curVal, acTime);
        if (rampType === 'exponential' && !(val === 0 || curVal === 0)) {
          audioParam.exponentialRampToValueAtTime(val, acTime + rampTime);
          audioParam.timelineSignal.exponentialRampToValueAtTime(val, acTime + rampTime);
        } else {
          audioParam.linearRampToValueAtTime(val, acTime + rampTime);
          audioParam.timelineSignal.linearRampToValueAtTime(val, acTime + rampTime);
        }
      } else {
        val.connect(audioParam);
      }
    }

    return audioParam.timelineSignal.getValueAtTime(acTime + rampTime);
  }

  return {
    // handle change in value to an AudioParam
    // `val` can be a number, or an audio control signal
    // `timeFromNow` is when this change begins
    // `rampTime` is how long to ramp the change
    setValue: function(audioParam, val, rampTime, timeFromNow) {
      return setValue(audioParam, val, rampTime, timeFromNow, 'linear');
    },
    setExponentialValue: function(audioParam, val, rampTime, timeFromNow) {
      return setValue(audioParam, val, rampTime, timeFromNow, 'exponential');
    },
  };
});
