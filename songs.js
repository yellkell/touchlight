// TOUCHLIGHT  –  songs.js
// Chromatic C4 → C6 (25 notes) note table + song definitions

var NOTES = [
  { name: 'C4',  label: 'C',   freq: 261.63, nat: true  },
  { name: 'C#4', label: 'C#',  freq: 277.18, nat: false },
  { name: 'D4',  label: 'D',   freq: 293.66, nat: true  },
  { name: 'D#4', label: 'D#',  freq: 311.13, nat: false },
  { name: 'E4',  label: 'E',   freq: 329.63, nat: true  },
  { name: 'F4',  label: 'F',   freq: 349.23, nat: true  },
  { name: 'F#4', label: 'F#',  freq: 369.99, nat: false },
  { name: 'G4',  label: 'G',   freq: 392.00, nat: true  },
  { name: 'G#4', label: 'G#',  freq: 415.30, nat: false },
  { name: 'A4',  label: 'A',   freq: 440.00, nat: true  },
  { name: 'A#4', label: 'A#',  freq: 466.16, nat: false },
  { name: 'B4',  label: 'B',   freq: 493.88, nat: true  },
  { name: 'C5',  label: 'C',   freq: 523.25, nat: true  },
  { name: 'C#5', label: 'C#',  freq: 554.37, nat: false },
  { name: 'D5',  label: 'D',   freq: 587.33, nat: true  },
  { name: 'D#5', label: 'D#',  freq: 622.25, nat: false },
  { name: 'E5',  label: 'E',   freq: 659.25, nat: true  },
  { name: 'F5',  label: 'F',   freq: 698.46, nat: true  },
  { name: 'F#5', label: 'F#',  freq: 739.99, nat: false },
  { name: 'G5',  label: 'G',   freq: 783.99, nat: true  },
  { name: 'G#5', label: 'G#',  freq: 830.61, nat: false },
  { name: 'A5',  label: 'A',   freq: 880.00, nat: true  },
  { name: 'A#5', label: 'A#',  freq: 932.33, nat: false },
  { name: 'B5',  label: 'B',   freq: 987.77, nat: true  },
  { name: 'C6',  label: 'C',   freq: 1046.50, nat: true },
];

// name → grid index lookup
var NOTE_INDEX = {};
NOTES.forEach(function(n, i) { NOTE_INDEX[n.name] = i; });

var SONGS = {
  twinkle: {
    name:  'Twinkle Twinkle Little Star',
    emoji: '⭐',
    notes: [
      'C4','C4','G4','G4','A4','A4','G4',
      'F4','F4','E4','E4','D4','D4','C4',
      'G4','G4','F4','F4','E4','E4','D4',
      'G4','G4','F4','F4','E4','E4','D4',
      'C4','C4','G4','G4','A4','A4','G4',
      'F4','F4','E4','E4','D4','D4','C4'
    ]
  },
  birthday: {
    name:  'Happy Birthday',
    emoji: '🎂',
    notes: [
      'G4','G4','A4','G4','C5','B4',
      'G4','G4','A4','G4','D5','C5',
      'G4','G4','G5','E5','C5','B4','A4',
      'F5','F5','E5','C5','D5','C5'
    ]
  },
  mary: {
    name:  'Mary Had a Little Lamb',
    emoji: '🐑',
    notes: [
      'E4','D4','C4','D4','E4','E4','E4',
      'D4','D4','D4',
      'E4','G4','G4',
      'E4','D4','C4','D4','E4','E4','E4',
      'E4','D4','D4','E4','D4','C4'
    ]
  },
  hotcross: {
    name:  'Hot Cross Buns',
    emoji: '🥐',
    notes: [
      'E4','D4','C4',
      'E4','D4','C4',
      'C4','C4','C4','C4',
      'D4','D4','D4','D4',
      'E4','D4','C4'
    ]
  },
  ode: {
    name:  'Ode to Joy',
    emoji: '🎻',
    notes: [
      'E4','E4','F4','G4','G4','F4','E4','D4',
      'C4','C4','D4','E4','E4','D4','D4',
      'E4','E4','F4','G4','G4','F4','E4','D4',
      'C4','C4','D4','E4','D4','C4','C4'
    ]
  }
};
