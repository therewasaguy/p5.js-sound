'use strict';

define(function () {
  var Tone = require('Tone/core/Tone');
  require('Tone/core/Context');

  // Share the Audio Context from Tone
  var audiocontext = Tone.context._context;

  /**
   * <p>Returns the Audio Context for this sketch. Useful for users
   * who would like to dig deeper into the <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext for this sketch
   */
  p5.prototype.getAudioContext = function() {
    return audiocontext;
  };

  // Polyfill for AudioIn, also handled by p5.dom createCapture
  navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;


  /**
   * Determine which filetypes are supported (inspired by buzz.js)
   * The audio element (el) will only be used to test browser support for various audio formats
   */
  var el = document.createElement('audio');

  p5.prototype.isSupported = function() {
    return !!el.canPlayType;
  };
  var isOGGSupported = function() {
    return !!el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"');
  };
  var isMP3Supported = function() {
    return !!el.canPlayType && el.canPlayType('audio/mpeg;');
  };
  var isWAVSupported = function() {
    return !!el.canPlayType && el.canPlayType('audio/wav; codecs="1"');
  };
  var isAACSupported = function() {
    return !!el.canPlayType && (el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;'));
  };
  var isAIFSupported = function() {
    return !!el.canPlayType && el.canPlayType('audio/x-aiff;');
  };
  p5.prototype.isFileSupported = function(extension) {
    switch(extension.toLowerCase())
    {
      case 'mp3':
        return isMP3Supported();
      case 'wav':
        return isWAVSupported();
      case 'ogg':
        return isOGGSupported();
      case 'aac':
      case 'm4a':
      case 'mp4':
        return isAACSupported();
      case 'aif':
      case 'aiff':
        return isAIFSupported();
      default:
        return false;
    }
  };

  // if it is iOS, we have to have a user interaction to start Web Audio
  // http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
  var iOS =  navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false ;
  if (iOS) {
    var iosStarted = false;
    var startIOS = function() {
      if (iosStarted) return;

      // create empty buffer
      var buffer = audiocontext.createBuffer(1, 1, 22050);
      var source = audiocontext.createBufferSource();
      source.buffer = buffer;

      // connect to output (your speakers)
      source.connect(audiocontext.destination);
      // play the file
      source.start(0);
      console.log('start ios!');

      if (audiocontext.state === 'running') {
        iosStarted = true;
      }
    };
    document.addEventListener('touchend', startIOS, false);
    document.addEventListener('touchstart', startIOS, false);

    // TO DO: fake touch event so that audio will just start
  }

});
