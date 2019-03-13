/**
 * Determine which filetypes are supported (inspired by buzz.js)
 * The audio element (el) will only be used to test browser support for various audio formats
 */
var el = document.createElement('audio');

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

p5.prototype.isSupported = function () {
  return !!el.canPlayType;
};
p5.prototype.isFileSupported = isFileSupported;

const isFileSupported = function(extension) {
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

module.exports = {
  isFileSupported
};
