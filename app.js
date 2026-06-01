// TOUCHLIGHT  –  app.js
// Main application: grid, touch handling, free-play + guided mode

/* ============================================================
   COLOR PALETTE  (25 vibrant hues, one per chromatic note)
   ============================================================ */
var COLORS = [
  '#FF4E6A', // C4   coral-red
  '#FF7A45', // C#4  burnt orange
  '#FFC837', // D4   amber
  '#F9F032', // D#4  lemon
  '#A8FF48', // E4   lime
  '#26DE81', // F4   emerald
  '#11EFC8', // F#4  aquamarine
  '#00D4FF', // G4   cyan
  '#00AEFF', // G#4  sky
  '#4480FF', // A4   cobalt
  '#6B5BFF', // A#4  indigo
  '#9B40FF', // B4   violet
  '#D040FB', // C5   magenta
  '#FF3DB8', // C#5  hot pink
  '#FF4D8F', // D5   rose
  '#FF5E78', // D#5  salmon-pink
  '#FF6B35', // E5   tangerine
  '#FFAA00', // F5   gold
  '#FFE033', // F#5  sunflower
  '#B4FF47', // G5   yellow-green
  '#3BFFA8', // G#5  mint
  '#00FFEE', // A5   turquoise
  '#40BFFF', // A#5  powder blue
  '#A066FF', // B5   lavender-violet
  '#FF66CC', // C6   orchid-pink
];

/* ============================================================
   DOM
   ============================================================ */
var gridEl      = document.getElementById('grid');
var modeBtnEl   = document.getElementById('mode-btn');
var songSelectEl= document.getElementById('song-select');
var startBtnEl  = document.getElementById('start-btn');
var progressBar = document.getElementById('progress-bar');
var progressFill= document.getElementById('progress-fill');
var overlayEl   = document.getElementById('overlay');
var overlayText = document.getElementById('overlay-text');

/* ============================================================
   STATE
   ============================================================ */
var mode    = 'free';  // 'free' | 'guided'
var guided  = null;    // { notes, step, total } or null

/* ============================================================
   BUILD GRID
   ============================================================ */
var tiles = NOTES.map(function(note, i) {
  var tile = document.createElement('div');
  tile.className = 'tile';
  tile.setAttribute('role', 'button');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('aria-label', note.name);

  var oct = document.createElement('div');
  oct.className = 'octagon';
  oct.style.setProperty('--color', COLORS[i]);

  var lbl = document.createElement('span');
  lbl.className = 'note-label';
  lbl.textContent = note.label;

  oct.appendChild(lbl);
  tile.appendChild(oct);
  gridEl.appendChild(tile);

  tile.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    onTap(i);
  });

  tile.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(i); }
  });

  return { tile: tile, oct: oct, note: note };
});

/* ============================================================
   MODE TOGGLE
   ============================================================ */
modeBtnEl.addEventListener('click', function() {
  if (mode === 'free') {
    mode = 'guided';
    modeBtnEl.textContent = 'FREE PLAY';
    modeBtnEl.classList.add('active');
    songSelectEl.classList.remove('hidden');
    startBtnEl.classList.remove('hidden');
  } else {
    mode = 'free';
    modeBtnEl.textContent = 'GUIDED';
    modeBtnEl.classList.remove('active');
    songSelectEl.classList.add('hidden');
    startBtnEl.classList.add('hidden');
    progressBar.classList.add('hidden');
    stopGuided();
  }
});

/* ============================================================
   START SONG (guided mode)
   ============================================================ */
startBtnEl.addEventListener('click', function() {
  var key  = songSelectEl.value;
  var song = SONGS[key];
  if (!song) return;

  stopGuided();
  guided = { notes: song.notes.slice(), step: 0, total: song.notes.length };

  progressBar.classList.remove('hidden');
  setProgress(0);
  showMsg(song.emoji + '\n' + song.name, 2200);

  setTimeout(function() { if (guided) highlightStep(); }, 600);
});

/* ============================================================
   TAP HANDLER
   ============================================================ */
function onTap(idx) {
  var t = tiles[idx];
  playNote(t.note.freq);
  triggerFlash(t.oct);

  if (mode === 'guided' && guided) {
    var expected = guided.notes[guided.step];
    var expIdx   = NOTE_INDEX[expected];

    if (idx === expIdx) {
      // Correct note!
      t.oct.classList.remove('guided-active');
      addAnim(t.oct, 'correct', 480);

      guided.step++;
      setProgress(guided.step / guided.total);

      if (guided.step >= guided.notes.length) {
        var g = guided;
        guided = null;
        setTimeout(function() { celebrate(g); }, 280);
      } else {
        setTimeout(function() { if (guided) highlightStep(); }, 320);
      }
    } else {
      // Wrong note
      addAnim(t.oct, 'wrong', 560);
    }
  }
}

/* ============================================================
   GUIDED HELPERS
   ============================================================ */
function highlightStep() {
  if (!guided) return;
  tiles.forEach(function(t) { t.oct.classList.remove('guided-active'); });
  var noteName = guided.notes[guided.step];
  var idx = NOTE_INDEX[noteName];
  if (idx !== undefined) tiles[idx].oct.classList.add('guided-active');
}

function stopGuided() {
  guided = null;
  tiles.forEach(function(t) {
    t.oct.classList.remove('guided-active', 'correct', 'wrong');
  });
}

function setProgress(ratio) {
  progressFill.style.width = Math.min(ratio * 100, 100) + '%';
}

/* ============================================================
   CELEBRATION
   ============================================================ */
function celebrate(finishedGuided) {
  tiles.forEach(function(t) { t.oct.classList.remove('guided-active'); });
  progressBar.classList.add('hidden');

  showMsg('🎉 BRAVO! 🎉', 3500);

  /* Cascade wave across all tiles */
  tiles.forEach(function(t, i) {
    setTimeout(function() {
      addAnim(t.oct, 'celebrate', 780);
    }, i * 52);
  });

  /* Play C-major arpeggio fanfare */
  var fanfare = [0, 4, 7, 12, 7, 4, 12, 16]; // C E G C E G C E
  fanfare.forEach(function(noteIdx, i) {
    setTimeout(function() {
      if (noteIdx < tiles.length) playNote(tiles[noteIdx].note.freq, 0.7);
    }, i * 130);
  });
}

/* ============================================================
   ANIMATION UTILITIES
   ============================================================ */
function triggerFlash(oct) {
  oct.classList.remove('flash', 'guided-active');
  void oct.offsetWidth; // force reflow to restart animation
  oct.classList.add('flash');
  setTimeout(function() { oct.classList.remove('flash'); }, 400);
}

function addAnim(el, cls, duration) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(function() { el.classList.remove(cls); }, duration);
}

/* ============================================================
   MESSAGE OVERLAY
   ============================================================ */
var _msgTimer = null;

function showMsg(text, duration) {
  overlayText.textContent = '';
  // Support newline in message
  text.split('\n').forEach(function(line, i) {
    if (i > 0) overlayText.appendChild(document.createElement('br'));
    overlayText.appendChild(document.createTextNode(line));
  });
  overlayEl.classList.add('visible');
  clearTimeout(_msgTimer);
  _msgTimer = setTimeout(function() {
    overlayEl.classList.remove('visible');
  }, duration || 2000);
}

/* ============================================================
   IDLE AMBIENT TWINKLE
   ============================================================ */
function idleTick() {
  var idx = Math.floor(Math.random() * tiles.length);
  var t   = tiles[idx];
  var oct = t.oct;
  if (!oct.classList.contains('flash') &&
      !oct.classList.contains('guided-active') &&
      !oct.classList.contains('celebrate')) {
    addAnim(oct, 'idle-twinkle', 620);
  }
  setTimeout(idleTick, 200 + Math.random() * 700);
}

setTimeout(idleTick, 1500);

/* ============================================================
   BACKGROUND STAR PARTICLES
   ============================================================ */
(function spawnStars() {
  var container = document.getElementById('app');
  for (var i = 0; i < 60; i++) {
    (function(idx) {
      var star = document.createElement('div');
      star.style.cssText = [
        'position:fixed',
        'pointer-events:none',
        'z-index:0',
        'border-radius:50%',
        'background:#fff',
        'opacity:' + (0.04 + Math.random() * 0.12),
        'width:'  + (1 + Math.random() * 2.5) + 'px',
        'height:' + (1 + Math.random() * 2.5) + 'px',
        'top:'    + Math.random() * 100 + 'vh',
        'left:'   + Math.random() * 100 + 'vw',
      ].join(';');
      document.body.appendChild(star);
    })(i);
  }
})();
