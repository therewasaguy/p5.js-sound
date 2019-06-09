/**
 * This module has shims
 */

import Tone from 'Tone/core/Tone';

/* AudioContext Monkeypatch
    Copyright 2013 Chris Wilson
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
(function () {
  console.log('okokokoko');
  function fixSetTarget(param) {
    if (!param) // if NYI, just return
      return;
    if (!param.setTargetAtTime)
      param.setTargetAtTime = param.setTargetValueAtTime;
  }

  if (window.hasOwnProperty('webkitAudioContext') &&
      !window.hasOwnProperty('AudioContext')) {
    window.AudioContext = window.webkitAudioContext;

    if (typeof AudioContext.prototype.createGain !== 'function')
      AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
    if (typeof AudioContext.prototype.createDelay !== 'function')
      AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
    if (typeof AudioContext.prototype.createScriptProcessor !== 'function')
      AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
    if (typeof AudioContext.prototype.createPeriodicWave !== 'function')
      AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;


    AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function() {
      var node = this.internal_createGain();
      fixSetTarget(node.gain);
      return node;
    };

    AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
    AudioContext.prototype.createDelay = function(maxDelayTime) {
      var node = maxDelayTime ? this.internal_createDelay(maxDelayTime) : this.internal_createDelay();
      fixSetTarget(node.delayTime);
      return node;
    };

    AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function() {
      var node = this.internal_createBufferSource();
      if (!node.start) {
        node.start = function ( when, offset, duration ) {
          if ( offset || duration )
            this.noteGrainOn( when || 0, offset, duration );
          else
            this.noteOn( when || 0 );
        };
      } else {
        node.internal_start = node.start;
        node.start = function( when, offset, duration ) {
          if( typeof duration !== 'undefined' )
            node.internal_start( when || 0, offset, duration );
          else
            node.internal_start( when || 0, offset || 0 );
        };
      }
      if (!node.stop) {
        node.stop = function ( when ) {
          this.noteOff( when || 0 );
        };
      } else {
        node.internal_stop = node.stop;
        node.stop = function( when ) {
          node.internal_stop( when || 0 );
        };
      }
      fixSetTarget(node.playbackRate);
      return node;
    };

    AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
    AudioContext.prototype.createDynamicsCompressor = function() {
      var node = this.internal_createDynamicsCompressor();
      fixSetTarget(node.threshold);
      fixSetTarget(node.knee);
      fixSetTarget(node.ratio);
      fixSetTarget(node.reduction);
      fixSetTarget(node.attack);
      fixSetTarget(node.release);
      return node;
    };

    AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
    AudioContext.prototype.createBiquadFilter = function() {
      var node = this.internal_createBiquadFilter();
      fixSetTarget(node.frequency);
      fixSetTarget(node.detune);
      fixSetTarget(node.Q);
      fixSetTarget(node.gain);
      return node;
    };

    if (typeof AudioContext.prototype.createOscillator !== 'function') {
      AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() {
        var node = this.internal_createOscillator();
        if (!node.start) {
          node.start = function ( when ) {
            this.noteOn( when || 0 );
          };
        } else {
          node.internal_start = node.start;
          node.start = function ( when ) {
            node.internal_start( when || 0);
          };
        }
        if (!node.stop) {
          node.stop = function ( when ) {
            this.noteOff( when || 0 );
          };
        } else {
          node.internal_stop = node.stop;
          node.stop = function( when ) {
            node.internal_stop( when || 0 );
          };
        }
        if (!node.setPeriodicWave)
          node.setPeriodicWave = node.setWaveTable;
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        return node;
      };
    }
  }

  if (window.hasOwnProperty('webkitOfflineAudioContext') &&
      !window.hasOwnProperty('OfflineAudioContext')) {
    window.OfflineAudioContext = window.webkitOfflineAudioContext;
  }
  console.log('shim happened!');
})(window);
// <-- end MonkeyPatch.

// Polyfill for AudioIn, also handled by p5.dom createCapture
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

// see https://github.com/Tonejs/Tone.js/issues/434
// Tone 13.7+ removes this shim
// via https://github.com/Tonejs/Tone.js/commit/2ca9d89424dfb73eac2e73bed144ef3a07f448a4#diff-55b9b13651a86c2eb1c39effbfb70f41L550
var nativeConnect = AudioNode.prototype.connect;
var nativeDisconnect = AudioNode.prototype.disconnect;

//replace the old connect method
function toneConnect(B, outNum, inNum) {
  if (B.input) {
    inNum = Tone.defaultArg(inNum, 0);
    if (Tone.isArray(B.input)) {
      return this.connect(B.input[inNum]);
    } else {
      return this.connect(B.input, outNum, inNum);
    }
  } else {
    try {
      if (B instanceof AudioNode) {
        nativeConnect.call(this, B, outNum, inNum);
        return B;
      } else {
        nativeConnect.call(this, B, outNum);
        return B;
      }
    } catch (e) {
      throw new Error("error connecting to node: " + B + "\n" + e);
    }
  }
}

//replace the old disconnect method	
function toneDisconnect(B, outNum, inNum) {
  if (B && B.input && Tone.isArray(B.input)) {
    inNum = Tone.defaultArg(inNum, 0);
    this.disconnect(B.input[inNum], outNum, 0);
  } else if (B && B.input) {
    this.disconnect(B.input, outNum, inNum);
  } else {
    try {
      if (B instanceof AudioParam) {
        nativeDisconnect.call(this, B, outNum);
      } else {
        nativeDisconnect.apply(this, arguments);
      }
    } catch (e) {
      throw new Error("error disconnecting node: " + B + "\n" + e);
    }
  }
}

if (window.AudioNode.prototype.connect !== toneConnect) {
  window.AudioNode.prototype.connect = toneConnect;
  window.AudioNode.prototype.disconnect = toneDisconnect;
}
