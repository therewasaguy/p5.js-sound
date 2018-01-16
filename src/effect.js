'use strict';
define(function (require) {
  var CrossFade = require('Tone/component/CrossFade');
  var SoundNode = require('./src/utils/SoundNode');

  /**
   * Effect is a base class for audio effects in p5. <br>
   * This module handles the nodes and methods that are 
   * common and useful for current and future effects.
   *
   *
   * This class is extended by <a href="reference/#/p5.Distortion">p5.Distortion</a>, 
   * <a href="reference/#/p5.Compressor">p5.Compressor</a>,
   * <a href="reference/#/p5.Delay">p5.Delay</a>, 
   * <a href="reference/#/p5.Filter">p5.Filter</a>, 
   * <a href="reference/#/p5.Reverb">p5.Reverb</a>.
   *
   * @class  p5.Effect
   * @constructor
   * 
   * @param {Object} [ac]   Reference to the audio context of the p5 object
   * @param {AudioNode} [input]  Gain Node effect wrapper
   * @param {AudioNode} [output] Gain Node effect wrapper
   * @param {Object} [_drywet]   Tone.JS CrossFade node (defaults to value: 1)
   * @param {AudioNode} [wet]  Effects that extend this class should connect
   *                              to the wet signal to this gain node, so that dry and wet 
   *                              signals are mixed properly.
   */
  p5.Effect = function() {
    SoundNode.call(this);

    this.input = this.audiocontext.createGain();
    this.output = this.audiocontext.createGain();

    /**
    * The p5.Effect class is built
    *   using Tone.js CrossFade
    *   @private
    */
    this._drywet = new CrossFade(1);

    /**
     *  In classes that extend
     *  p5.Effect, connect effect nodes
     *  to the wet parameter
     */
    this.wet = this.audiocontext.createGain();

    this.input.connect(this._drywet.a);
    this.wet.connect(this._drywet.b);
    this._drywet.connect(this.output);

    this.connect();
  };
  p5.Effect.prototype = Object.create(SoundNode.prototype);

  /**
   *  Set the output volume of the filter.
   *  
   *  @method  amp
   *  @param {Number} [vol] amplitude between 0 and 1.0
   *  @param {Number} [rampTime] create a fade that lasts until rampTime 
   *  @param {Number} [tFromNow] schedule this event to happen in tFromNow seconds
   */
  p5.Effect.prototype.amp = function(vol, rampTime, tFromNow) {
    return this._scheduleAudioParamValue(this.output.gain, vol, rampTime, tFromNow);
  };

  /**
   *  Link effects together in a chain  
   *  Example usage: filter.chain(reverb, delay, panner);
   *  May be used with an open-ended number of arguments
   *
   *  @method chain 
     *  @param {Object} [arguments]  Chain together multiple sound objects  
   */   
  p5.Effect.prototype.chain = function() {
    if (arguments.length>0) {
      this.connect(arguments[0]);
      for(var i=1;i<arguments.length; i+=1) {
        arguments[i-1].connect(arguments[i]);
      }
    }
    return this;
  };

  /**
   *  Adjust the dry/wet value. 
   *  
   *  @method drywet
   *  @param {Number} [fade] The desired drywet value (0 - 1.0)
   */
  p5.Effect.prototype.drywet = function(fade) {
    if (typeof fade !== 'undefined') {
      this._scheduleAudioParamValue(this._drywet.fade, fade);
    }
    return this._drywet.fade.value;
  };

  /**
   *  Send output to a p5.js-sound, Web Audio Node, or use signal to
   *  control an AudioParam 
   *  
   *  @method connect 
   *  @param {Object} unit 
   */
  p5.Effect.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all output.  
   *  
   *  @method disconnect 
   */
  p5.Effect.prototype.disconnect = function() {
    this.output.disconnect();
  };

  p5.Effect.prototype.dispose = function() {
    this.input.disconnect();
    this.input = undefined;

    this.output.disconnect();
    this.output = undefined;

    this._drywet.disconnect();
    delete this._drywet;

    this.wet.disconnect();
    delete this.wet;
  };

  return p5.Effect;

});
