'use strict';

// Util functions for Audio Params
// to schedule value changes along the web audio timeline

define(function () {
  var ac = p5.prototype.getAudioContext();

  function setValue(audioParam, val, rampTime, timeFromNow, rampType) {
    var acTime = (timeFromNow || 0) + ac.currentTime;

    audioParam.cancelScheduledValues(acTime);

    if (typeof val === 'number') {
      if (rampTime) {
        var curVal = audioParam.value;
        audioParam.setValueAtTime(curVal, acTime);
        if (rampType === 'exponential') {
          audioParam.exponentialRampToValueAtTime(val, acTime + rampTime);
        } else {
          audioParam.linearRampToValueAtTime(val, acTime + rampTime);
        }
      } else {
        audioParam.setValueAtTime(val, acTime);
      }
    } else if (val) {
      val.connect(audioParam);
    }

    return audioParam.value;
  }

  return {
    // handle change in value to an AudioParam
    // `val` can be a number, or an audio control signal
    // `timeFromNow` is when this change begins
    // `rampTime` is how long to ramp the change
    setValue: function (audioParam, val, rampTime, timeFromNow) {
      return setValue(audioParam, val, rampTime, timeFromNow, 'linear');
    },
    setExponentialValue: function (audioParam, val, rampTime, timeFromNow) {
      return setValue(audioParam, val, rampTime, timeFromNow, 'exponential');
    },
  };
});
