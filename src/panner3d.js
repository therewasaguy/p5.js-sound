'use strict';

define(function (require) {
  var Effect = require('effect');

  /**
   * Panner3D is based on the <a title="Web Audio Panner docs"  href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
   * Web Audio Spatial Panner Node</a>.
   * This panner is a spatial processing node that allows audio to be positioned
   * and oriented in 3D space.
   *
   * The position is relative to an <a title="Web Audio Listener docs" href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/AudioListener">
   * Audio Context Listener</a>, which can be accessed
   * by <code>p5.soundOut.audiocontext.listener</code>
   *
   *
   * @class p5.Panner3D
   * @constructor
   */
  p5.Panner3D = function() {
    Effect.call(this);

    /**
     *  <a title="Web Audio Panner docs"  href=
     *  "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
     *  Web Audio Spatial Panner Node</a>
     *
     *  Properties include
     *    -  <a title="w3 spec for Panning Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-PanningModelType"
     *    >panningModel</a>: "equal power" or "HRTF"
     *    -  <a title="w3 spec for Distance Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-DistanceModelType"
     *    >distanceModel</a>: "linear", "inverse", or "exponential"
     *
     *  @property {AudioNode} panner
     *
     */
    this.panner = this.audiocontext.createPanner();
    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.connect(this.output);
    this.input.connect(this.panner);
  };

  p5.Panner3D.prototype = Object.create(Effect.prototype);


  /**
   * Connect an audio source
   *
   * @method  process
   * @param  {Object} src Input source
   */
  p5.Panner3D.prototype.process = function(src) {
    src.connect(this.input);
  };

  /**
   * Set the X,Y,Z position of the Panner
   * @method set
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.set = function(xVal, yVal, zVal, rampTime, timeFromNow) {
    return [this.positionX(xVal, rampTime, timeFromNow),
      this.positionY(yVal, rampTime, timeFromNow),
      this.positionZ(zVal, rampTime, timeFromNow)];
  };

  /**
   * Getter and setter methods for position coordinates
   * @method positionX
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionY
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionZ
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.positionX = function(xVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.positionX, xVal, rampTime, timeFromNow);
  };
  p5.Panner3D.prototype.positionY = function(yVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.positionY, yVal, rampTime, timeFromNow);
  };
  p5.Panner3D.prototype.positionZ = function(zVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.positionZ, zVal, rampTime, timeFromNow);
  };

  /**
   * Set the X,Y,Z position of the Panner
   * @method  orient
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.orient = function(xVal, yVal, zVal, rampTime, timeFromNow) {
    return [this.orientX(xVal, rampTime, timeFromNow),
      this.orientY(yVal, rampTime, timeFromNow),
      this.orientZ(zVal, rampTime, timeFromNow)];
  };

  /**
   * Getter and setter methods for orient coordinates
   * @method orientX
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientY
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @param  {Number} value
   * @param {Number} [rampTime] create a fade that lasts rampTime in seconds
   * @param {Number} [timeFromNow] schedule this event to begin
   *                                seconds from now
   * @method orientZ
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.orientX = function(xVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.orientationX, xVal, rampTime, timeFromNow);
  };
  p5.Panner3D.prototype.orientY = function(yVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.orientationY, yVal, rampTime, timeFromNow);
  };
  p5.Panner3D.prototype.orientZ = function(zVal, rampTime, timeFromNow) {
    return this._scheduleAudioParamValue(this.panner.orientationZ, zVal, rampTime, timeFromNow);
  };

  /**
   * Set the rolloff factor and max distance
   * @method  setFalloff
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]
   */
  p5.Panner3D.prototype.setFalloff = function(maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  };
  /**
   * Maxium distance between the source and the listener
   * @method  maxDist
   * @param  {Number} maxDistance
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.maxDist = function(maxDistance) {
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  };

  /**
   * How quickly the volume is reduced as the source moves away from the listener
   * @method  rollof
   * @param  {Number} rolloffFactor
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.rolloff = function(rolloffFactor) {
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  };

  p5.Panner3D.dispose = function() {
    Effect.prototype.dispose.apply(this);
    this.panner.disconnect();
    delete this.panner;
  };

  return p5.Panner3D;

});
