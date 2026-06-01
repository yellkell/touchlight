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
   MODE TOGGLE  — one tap starts Twinkle Twinkle silently
   ============================================================ */
modeBtnEl.addEventListener('click', function() {
  if (mode === 'free') {
    mode = 'guided';
    modeBtnEl.textContent = '♩';
    modeBtnEl.classList.add('active');
    stopGuided();
    guided = { notes: SONGS.twinkle.notes.slice(), step: 0, total: SONGS.twinkle.notes.length };
    progressBar.classList.remove('hidden');
    setProgress(0);
    setTimeout(function() { if (guided) highlightStep(); }, 400);
  } else {
    mode = 'free';
    modeBtnEl.textContent = '♩';
    modeBtnEl.classList.remove('active');
    progressBar.classList.add('hidden');
    stopGuided();
  }
});


/* ============================================================
   TAP HANDLER
   ============================================================ */
function onTap(idx) {
  var t = tiles[idx];
  playNote(t.note.freq);
  triggerFlash(t.oct);
  spawnRipple(t.tile);

  if (mode === 'guided' && guided) {
    var expected = guided.notes[guided.step];
    var expIdx   = NOTE_INDEX[expected];

    if (idx === expIdx) {
      // Correct note!
      t.tile.classList.remove('guided-hint');
      t.oct.classList.remove('guided-active');
      addAnim(t.oct, 'correct', 480);

      guided.step++;
      setProgress(guided.step / guided.total);

      if (guided.step >= guided.notes.length) {
        var g = guided;
        guided = null;
        setTimeout(function() { celebrate(g); }, 700);
      } else {
        setTimeout(function() { if (guided) highlightStep(); }, 320);
      }
    } else {
      // Wrong note
      addAnim(t.oct, 'wrong', 560);
    }
  }
}

function spawnRipple(tile) {
  var wave = document.createElement('div');
  wave.className = 'ripple-wave';
  tile.appendChild(wave);
  setTimeout(function() { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 580);
}

function getNeighbours(idx) {
  var row = Math.floor(idx / 5), col = idx % 5, result = [];
  [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d) {
    var r = row + d[0], c = col + d[1];
    if (r >= 0 && r < 5 && c >= 0 && c < 5) result.push(r * 5 + c);
  });
  return result;
}

/* ============================================================
   GUIDED HELPERS
   ============================================================ */
function highlightStep() {
  if (!guided) return;
  tiles.forEach(function(t) {
    t.oct.classList.remove('guided-active');
    t.tile.classList.remove('guided-hint');
  });
  var noteName = guided.notes[guided.step];
  var idx = NOTE_INDEX[noteName];
  if (idx !== undefined) {
    tiles[idx].oct.classList.add('guided-active');
    tiles[idx].tile.classList.add('guided-hint');
  }
}

function stopGuided() {
  guided = null;
  tiles.forEach(function(t) {
    t.oct.classList.remove('guided-active', 'correct', 'wrong');
    t.tile.classList.remove('guided-hint');
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

  /* Pure visual cascade — no text */
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
   IDLE AMBIENT TWINKLE  (free-play only)
   ============================================================ */
function idleTick() {
  if (mode === 'free') {
    var idx = Math.floor(Math.random() * tiles.length);
    var t   = tiles[idx];
    var oct = t.oct;
    if (!oct.classList.contains('flash') &&
        !oct.classList.contains('guided-active') &&
        !oct.classList.contains('celebrate')) {
      addAnim(oct, 'idle-twinkle', 720);
    }
  }
  setTimeout(idleTick, 400 + Math.random() * 900);
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
