'use strict';

global.TONE_SILENCE_VERSION_LOGGING = true;

const INIT_AUDIO_ID = 'p5_loading';

define(['startaudiocontext', 'Tone/core/Context', 'Tone/core/Tone'], function (StartAudioContext, Context, Tone) {
  // Create the Audio Context
  const audiocontext = new window.AudioContext();

  // Tone and p5.sound share the same audio context
  Tone.context.dispose();
  Tone.setContext(audiocontext);

  /**
   * <p>Returns the Audio Context for this sketch. Useful for users
   * who would like to dig deeper into the <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * <p>Some browsers require users to startAudioContext
   * with a user gesture, such as touchStarted in the example below.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext for this sketch
   * @example
   * <div><code>
   *  function draw() {
   *    background(255);
   *    textAlign(CENTER);
   *
   *    if (getAudioContext().state !== 'running') {
   *      text('click to start audio', width/2, height/2);
   *    } else {
   *      text('audio is enabled', width/2, height/2);
   *    }
   *  }
   *
   *  function touchStarted() {
   *    if (getAudioContext().state !== 'running') {
   *      getAudioContext().resume();
   *    }
   *    var synth = new p5.MonoSynth();
   *    synth.play('A4', 0.5, 0, 0.2);
   *  }
   *
   * </div></code>
   */
  p5.prototype.getAudioContext = function() {
    return audiocontext;
  };

  const userStartAudio = function(elements, callback) {
    let elt = elements;
    console.log('Z', elt);
    if (elements instanceof p5.Element) {
      elt = elements.elt;
    } else if (elements instanceof Array && elements[0] instanceof p5.Element ) {
      elt = elements.map(function(e) { return e.elt; });
    }
    const initBeforePreload = new Promise(() => {
      p5.prototype.registerMethod('init', function() {
        const p5Context = this;

        // ensure that a preload function exists so that p5 will wait for preloads to finish
        if (!this.preload && !window.preload) {
          this.preload = function() {};
        }
        this._incrementPreload();
        audiocontext.resume()
          .then(() => this._decrementPreload())
          .catch(e => console.error('unable to start audio context', e));

        if (!elt) {
          elt = `#${INIT_AUDIO_ID}`;
          createInitSoundButton(p5Context);
        }
        console.log('A', elt);
        return StartAudioContext(audiocontext, elt, callback);
      });
    });

    // if preload has already been called, a specific element must be provided
    if (elt || document.querySelector('canvas') !== null) {
      console.log('B');
      audiocontext.resume().then(() => {});
      return StartAudioContext(audiocontext, elt, callback);
    } else {
      createInitSoundButton({});
      return StartAudioContext(audiocontext, elt, callback);
    }
  };

  p5.prototype.userStartAudio = (elements, callback) => {
    console.warn('userStartAudio() is deprecated in favor of p5.initSound()');
    return userStartAudio(elements, callback);
  };

  /**
   *  <p>It is a good practice to give users control over starting audio playback.
   *  This practice is enforced by Google Chrome's autoplay policy
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, and other browsers.
   *  </p>
   *
   *  <p>
   *  p5.initSound() starts the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
   *  target="_blank" title="Audio Context @ MDN">Audio Context</a> on a user gesture. It utilizes
   *  the <a href="https://github.com/tambien/StartAudioContext">StartAudioContext</a> library by
   *  Yotam Mann (MIT Licence, 2016). Read more at https://github.com/tambien/StartAudioContext.
   *  </p>
   *
   *  <p>Starting the audio context on a user gesture can be as simple as <code>p5.initSound()</code>
   *  at the top of any sketch that uses audio/sound. By default, it will create a button that
   *  initializes the audio context when pressed.</p>
   *
   *  <p>The button element has the ID "p5_loading" and it can be stylized using CSS.
   *  If an HTML element with that ID already exists on the page, then that element will be used.</p>
   *
   *  <p>When p5.initSound() runs before preload, setup, and draw, it will wait until the
   *  audio context has been initialized before running preload, setup or draw.</p>
   *
   * <p>Optional parameters let you decide on a specific element,
   *  or an array of elements, that will start the audio context.
   *  and/or call a function once the audio context is started.</p>
   *  @param  {Element|Array}   [element(s)] This argument can be an Element,
   *                                Selector String, NodeList, p5.Element,
   *                                jQuery Element, or an Array of any of those.
   *  @param  {Function} [callback] Callback to invoke when the AudioContext has started
   *  @return {Promise}            Returns a Promise which is resolved when
   *                                       the AudioContext state is 'running'
   *  @method p5.initSound
   *  @for p5
   *  @example
   *  <div><code>
   *  p5.initSound();
   *
   *  // Setup won't run until the context has started
   *  function setup() {
   *    background(0, 255, 0);
   *    var mySynth = new p5.MonoSynth();
   *    mySynth.play('A6');
   *  }
   *  </code></div>
   *  @example
   *  <div><code>
   *  function setup() {
   *    background(255, 0, 0);
   *
   *    var myButton = createButton('click to start audio');
   *    myButton.position(0, 0);
   *
   *    p5.initSound(myButton).then(() => {
   *      var mySynth = new p5.MonoSynth();
   *      mySynth.play('A6');
   *      background(0, 255, 0);
   *      myButton.remove();
   *    });
   */
  p5.initSound = userStartAudio;
  // p5.initSound();
  return audiocontext;
});

function createInitSoundButton(p5Context) {
  if (document.getElementById(INIT_AUDIO_ID) === null) {
    const sndString = document.characterSet === 'UTF-8' ? '🔊' : 'Sound';
    const initSoundButton = document.createElement('button');
    initSoundButton.setAttribute('id', INIT_AUDIO_ID);
    initSoundButton.innerText = `Init ${sndString}`;
    initSoundButton.style.position = 'absolute';
    const node = p5Context._userNode || document.body;
    node.appendChild(initSoundButton);
  }
}
