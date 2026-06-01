// TOUCHLIGHT  –  audio.js
// Marimba-like synthesiser using Web Audio API

var _ctx    = null;
var _reverb = null;
var _dryGain = null;
var _wetGain = null;

function _boot() {
  if (_ctx) return;
  _ctx = new (window.AudioContext || window.webkitAudioContext)();

  /* ---- Synthetic room reverb ---- */
  _reverb = _ctx.createConvolver();
  var sr  = _ctx.sampleRate;
  var len = Math.floor(sr * 1.4);
  var buf = _ctx.createBuffer(2, len, sr);
  for (var ch = 0; ch < 2; ch++) {
    var d = buf.getChannelData(ch);
    for (var i = 0; i < len; i++) {
      // decaying random noise impulse response
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
    }
  }
  _reverb.buffer = buf;

  /* ---- Master dry / wet ---- */
  _dryGain = _ctx.createGain();
  _wetGain = _ctx.createGain();
  _dryGain.gain.value = 0.80;
  _wetGain.gain.value = 0.20;

  _dryGain.connect(_ctx.destination);
  _wetGain.connect(_reverb);
  _reverb.connect(_ctx.destination);
}

function playNote(frequency, duration) {
  duration = duration || 0.85;
  _boot();
  if (_ctx.state === 'suspended') _ctx.resume();

  var ctx = _ctx;
  var now = ctx.currentTime;
  var atk = 0.004; // 4ms attack — percussive

  /* ---- Oscillators ----
     Real marimba bars produce inharmonic overtones.
     We model the 3 main partials with their approximate
     frequency ratios: 1 : 2.756 : 5.404               */
  var o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = frequency;
  var o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = frequency * 2.756;
  var o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = frequency * 5.404;

  var g1 = ctx.createGain();
  var g2 = ctx.createGain();
  var g3 = ctx.createGain();
  var master = ctx.createGain();
  master.gain.value = 0.82;

  /* Envelopes — fundamental decays longest */
  var d1 = duration * 0.92;
  var d2 = duration * 0.32;
  var d3 = duration * 0.14;

  _env(g1.gain, now, atk, d1, 0.62);
  _env(g2.gain, now, atk, d2, 0.20);
  _env(g3.gain, now, atk, d3, 0.06);

  o1.connect(g1); g1.connect(master);
  o2.connect(g2); g2.connect(master);
  o3.connect(g3); g3.connect(master);
  master.connect(_dryGain);
  master.connect(_wetGain);

  var stop = now + duration + 0.12;
  o1.start(now); o1.stop(stop);
  o2.start(now); o2.stop(stop);
  o3.start(now); o3.stop(stop);
}

function _env(param, now, attack, decay, peak) {
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(peak, now + attack);
  param.exponentialRampToValueAtTime(0.0001, now + attack + decay);
}

function playChord(frequencies, duration) {
  frequencies.forEach(function(f) { playNote(f, duration); });
}
