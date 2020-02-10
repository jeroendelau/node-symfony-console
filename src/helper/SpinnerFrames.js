const SpinnerFrameJuggler = require('./SpinnerFrameJuggler');

const BASE = 'BASE';
const DIAMOND ='DIAMOND';
const SIMPLE = 'SIMPLE';
const CIRCLES = 'CIRCLES';
const RUNNER = 'RUNNER';
const MONKEY = 'MONKEY'; 
const SECTORS = 'SECTORS';
const CLOCK = 'CLOCK';
const CLOCK_VARIANT = 'CLOCK_VARIANT';
const CLOCK_VARIANT_1 = 'CLOCK_VARIANT_1';
const EARTH = 'EARTH';
const MOON = 'MOON';
const MOON_REVERSED = 'MOON_REVERSED';
const DOT = 'DOT';
const DOTDOTDOT = 'DOTDOTDOT';
const DOT_REVERSED = 'DOT_REVERSED';
const ARROW_VARIANT_0 = 'ARROW_VARIANT_0';
const ARROW_VARIANT_1 = 'ARROW_VARIANT_1';
const ARROW_VARIANT_3 = 'ARROW_VARIANT_3';
const ARROW_VARIANT_2 = 'ARROW_VARIANT_2';
const WEATHER_VARIANT_1 = 'WEATHER_VARIANT_1';
const WEATHER = 'WEATHER';
const BALL_VARIANT_0 = 'BALL_VARIANT_0';
const SNAKE_VARIANT_0 = 'SNAKE_VARIANT_0';
const SNAKE_VARIANT_1 = 'SNAKE_VARIANT_1';
const SNAKE_VARIANT_2 = 'SNAKE_VARIANT_2';
const SNAKE_VARIANT_3 = 'SNAKE_VARIANT_3';
const DOTS_VARIANT_2 = 'DOTS_VARIANT_2';
const DOTS_VARIANT_3 = 'DOTS_VARIANT_3';
const DOTS_VARIANT_4 = 'DOTS_VARIANT_4';
const DOTS_VARIANT_5 = 'DOTS_VARIANT_5';
const TRIGRAM = 'TRIGRAM';
const BOUNCE = 'BOUNCE';
const SQUARE = 'SQUARE';
const SQUARE_VARIANT_1 = 'SQUARE_VARIANT_1';
const BLOCK_VARIANT_0 = 'BLOCK_VARIANT_0';
const BLOCK_VARIANT_1 = 'BLOCK_VARIANT_1';
const BLOCK_VARIANT_2 = 'BLOCK_VARIANT_2';
const DICE = 'DICE';
const ARROWS = 'ARROWS';
const ARROWS_VARIANT_4 = 'ARROWS_VARIANT_4';
const ARROWS_VARIANT_5 = 'ARROWS_VARIANT_5';
const TREE = 'TREE';
const TOGGLE = 'TOGGLE';
const TOGGLE_VARIANT_1 = 'TOGGLE_VARIANT_1';
const BOUNCING_BAR = 'BOUNCING_BAR';
const BOUNCING_BAR_VARIANT_2 = 'BOUNCING_BAR_VARIANT_2';
const BOUNCING_BAR_VARIANT_3 = 'BOUNCING_BAR_VARIANT_3';
const FEATHERED_ARROWS = 'FEATHERED_ARROWS';

const sets = {
  BASE: [],
  
  DIAMOND: ['♦'],

  SIMPLE: ['/', '|', '\\', '─',],

  CIRCLES: ['◐', '◓', '◑', '◒',],
  RUNNER: ['🚶 ', '🏃 '],
  MONKEY: ['🐵 ', '🙈 ', '🙉 ', '🙊 '],

  SECTORS: ['◴', '◷', '◶', '◵'],

  CLOCK: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛',],
  CLOCK_VARIANT: ['🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦',],

  CLOCK_VARIANT_1: [
    '🕐',
    '🕜',
    '🕑',
    '🕝',
    '🕒',
    '🕞',
    '🕓',
    '🕟',
    '🕔',
    '🕠',
    '🕕',
    '🕡',
    '🕖',
    '🕢',
    '🕗',
    '🕣',
    '🕘',
    '🕤',
    '🕙',
    '🕥',
    '🕚',
    '🕦',
    '🕛',
    '🕧',

  ],
  EARTH: ['🌍', '🌎', '🌏',],

  MOON: ['🌘', '🌗', '🌖', '🌕', '🌔', '🌓', '🌒', '🌑',],
  MOON_REVERSED: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘',],

  DOTDOTDOT: ['', '.', '..', '...'],
  
  DOT: ['⢀', '⡀', '⠄', '⠂', '⠁', '⠈', '⠐', '⠠',],
  DOT_REVERSED: ['⠠', '⠐', '⠈', '⠁', '⠂', '⠄', '⡀', '⢀',],

  ARROW_VARIANT_0: [
    '▹▹▹▹▹',
    '▸▹▹▹▹',
    '▹▸▹▹▹',
    '▹▹▸▹▹',
    '▹▹▹▸▹',
    '▹▹▹▹▸',
  ],

  ARROW_VARIANT_1: [
    '◁ ◁ ◁ ◁ ◀',
    '◁ ◁ ◁ ◀ ◁',
    '◁ ◁ ◀ ◁ ◁',
    '◁ ◀ ◁ ◁ ◁',
    '◀ ◁ ◁ ◁ ◁',
  ],

  ARROW_VARIANT_3: [
    '◃◃◃◃◃',
    '◃◃◃◃◂',
    '◃◃◃◂◃',
    '◃◃◂◃◃',
    '◃◂◃◃◃',
    '◂◃◃◃◃',
  ],

  ARROW_VARIANT_2: [
    '◃◃◃◃◂',
    '◃◃◃◂◃',
    '◃◃◂◃◃',
    '◃◂◃◃◃',
    '◂◃◃◃◃',
    '▸▹▹▹▹',
    '▹▸▹▹▹',
    '▹▹▸▹▹',
    '▹▹▹▸▹',
    '▹▹▹▹▸',

  ],

  WEATHER_VARIANT_1: [
    '🌤 ',
    '🌤 ',
    '🌤 ',
    '🌥 ',
    '🌧 ',
    '🌨 ',
    '🌧 ',
    '🌨 ',
    '🌧 ',
    '🌨 ',
    '🌨 ',
    '🌧 ',
    '🌨 ',
    '🌥 ',
    '🌤 ',
    '🌤 ',
    '🌤 ',
  ],


  WEATHER: [
    // '☀️ ',
    // '☀️ ',
    // '☀️ ',
    '🌤 ',
    '🌤 ',
    '🌤 ',
    '🌤 ',
    '⛅️',
    '🌥 ',
    '☁️ ',
    '🌧 ',
    '🌨 ',
    '🌧 ',
    '🌨 ',
    '🌧 ',
    '🌨 ',
    '⛈ ',
    '⛈ ',
    '🌨 ',
    '⛈ ',
    '🌧 ',
    '🌨 ',
    '☁️ ',
    '🌥 ',
    '⛅️',
    '🌤 ',
    // '☀️ ',
    // '☀️ ',
  ],

  BALL_VARIANT_0: [
    '  ●     ',
    '   ●    ',
    '    ●   ',
    '     ●  ',
    '      ● ',
    '     ●  ',
    '    ●   ',
    '   ●    ',
    '  ●     ',
    ' ●      ',
  ],

  SNAKE_VARIANT_0: ['⠏', '⠛', '⠹', '⢸', '⣰', '⣤', '⣆', '⡇',],
  SNAKE_VARIANT_1: ['⣇', '⡏', '⠟', '⠻', '⢹', '⣸', '⣴', '⣦',],
  SNAKE_VARIANT_2: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  SNAKE_VARIANT_3: [
    '⢀⠀',
    '⡀⠀',
    '⠄⠀',
    '⢂⠀',
    '⡂⠀',
    '⠅⠀',
    '⢃⠀',
    '⡃⠀',
    '⠍⠀',
    '⢋⠀',
    '⡋⠀',
    '⠍⠁',
    '⢋⠁',
    '⡋⠁',
    '⠍⠉',
    '⠋⠉',
    '⠋⠉',
    '⠉⠙',
    '⠉⠙',
    '⠉⠩',
    '⠈⢙',
    '⠈⡙',
    '⢈⠩',
    '⡀⢙',
    '⠄⡙',
    '⢂⠩',
    '⡂⢘',
    '⠅⡘',
    '⢃⠨',
    '⡃⢐',
    '⠍⡐',
    '⢋⠠',
    '⡋⢀',
    '⠍⡁',
    '⢋⠁',
    '⡋⠁',
    '⠍⠉',
    '⠋⠉',
    '⠋⠉',
    '⠉⠙',
    '⠉⠙',
    '⠉⠩',
    '⠈⢙',
    '⠈⡙',
    '⠈⠩',
    '⠀⢙',
    '⠀⡙',
    '⠀⠩',
    '⠀⢘',
    '⠀⡘',
    '⠀⠨',
    '⠀⢐',
    '⠀⡐',
    '⠀⠠',
    '⠀⢀',
    '⠀⡀',
  ],

  DOTS_VARIANT_2: ['⢹', '⢺', '⢼', '⣸', '⣇', '⡧', '⡗', '⡏',],
  DOTS_VARIANT_3: ['⢄', '⢂', '⢁', '⡁', '⡈', '⡐', '⡠'],
  DOTS_VARIANT_4: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
  DOTS_VARIANT_5: ['   ', '.  ', '.. ', '...', ' ..', '  .', '   '],
  TRIGRAM: [
    '☰',        // HEAVEN
    '☱',        // LAKE
    '☲',        // FIRE
    '☴',        // WIND
    '☵',        // WATER
    '☶',        // MOUNTAIN
    '☳',        // THUNDER
    '☷',        // EARTH
  ],

  BOUNCE: [
    '⠁',
    '⠂',
    '⠄',
    '⠂',
  ],

  SQUARE: [
    '◼    ',
    ' ◼   ',
    '  ◼  ',
    '   ◼ ',
    '    ◼',
    '   ◼ ',
    '  ◼  ',
    ' ◼   ',
  ],

  SQUARE_VARIANT_1: [
    '▩',
    '▦',
    '▤',
    '▥',
    '▧',
    '▨',
  ],

  BLOCK_VARIANT_0:
    [
      '▁',
      '▂',
      '▃',
      '▄',
      '▅',
      '▆',
      '▇',
      '█',
      '▉',
      '▊',
      '▋',
      '▌',
      '▍',
      '▎',
      '▏',
      '▏',
      '▎',
      '▍',
      '▌',
      '▋',
      '▊',
      '▉',
      '█',
      '▇',
      '▆',
      '▅',
      '▄',
      '▃',
      '▂',
      '▁',
    ],

  BLOCK_VARIANT_1:
    [
      '▁',
      '▂',
      '▃',
      '▄',
      '▅',
      '▆',
      '▇',
      '█',
      '▇',
      '▆',
      '▅',
      '▄',
      '▃',
      '▂',
      '▁',
    ],
  BLOCK_VARIANT_2:
    [
      '█',
      '▉',
      '▊',
      '▋',
      '▌',
      '▍',
      '▎',
      '▏',
      '▏',
      '▎',
      '▍',
      '▌',
      '▋',
      '▊',
      '▉',
      '█',

    ],


  DICE: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅',],

  ARROWS: ['➙', '➘', '➙', '➚',],
  ARROWS_VARIANT_4: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙',],
  ARROWS_VARIANT_5: ['⇐', '⇖', '⇑', '⇗', '⇒', '⇘', '⇓', '⇙',],
  TREE: ['🌲', '🎄',],


  TOGGLE: [
    '⊶',
    '⊷',
  ],
  TOGGLE_VARIANT_1: [
    '■',
    '□',
    '▪',
    '▫',
  ],
  BOUNCING_BAR: [
    '[    ]',
    '[=   ]',
    '[==  ]',
    '[=== ]',
    '[ ===]',
    '[  ==]',
    '[   =]',
    '[    ]',
    '[   =]',
    '[  ==]',
    '[ ===]',
    '[====]',
    '[=== ]',
    '[==  ]',
    '[=   ]',
  ],

  BOUNCING_BAR_VARIANT_2: [
    '|    |',
    '|∙   |',
    '|∙∙  |',
    '|∙∙∙ |',
    '|∙∙∙∙|',
    '| ∙∙∙|',
    '|  ∙∙|',
    '|   ∙|',
    '|    |',
    '|   ∙|',
    '|  ∙∙|',
    '| ∙∙∙|',
    '|∙∙∙∙|',
    '|∙∙∙ |',
    '|∙∙  |',
    '|∙   |',
  ],

  BOUNCING_BAR_VARIANT_3: [
    '|   ',
    ' |  ',
    '  | ',
    '   |',
    '   |',
    '  | ',
    ' |  ',
    '|   ',
  ],
  
  FEATHERED_ARROWS:
    [
      '➵', // BLACK-FEATHERED RIGHTWARDS ARROW
      '➴', // BLACK-FEATHERED SOUTH EAST ARROW
      '➵', // BLACK-FEATHERED RIGHTWARDS ARROW
      '➶', // BLACK-FEATHERED NORTH EAST ARROW
      '➸', // HEAVY BLACK-FEATHERED RIGHTWARDS ARROW
      '➷', // HEAVY BLACK-FEATHERED SOUTH EAST ARROW
      '➸', // HEAVY BLACK-FEATHERED RIGHTWARDS ARROW
      '➹', // HEAVY BLACK-FEATHERED NORTH EAST ARROW
    ]
}

const fps = {
  DOTDOTDOT: 2
};

module.exports = class SpinnerFrames extends SpinnerFrameJuggler {
  static get BASE() { return BASE ;}
  static get DIAMOND() { return DIAMOND ;}
  static get SIMPLE() { return SIMPLE ;}
  static get CIRCLES() { return CIRCLES ;}
  static get RUNNER() { return RUNNER ;}
  static get MONKEY() { return MONKEY ;}
  static get SECTORS() { return SECTORS ;}
  static get CLOCK() { return CLOCK ;}
  static get CLOCK_VARIANT() { return CLOCK_VARIANT ;}
  static get CLOCK_VARIANT_1() { return CLOCK_VARIANT_1 ;}
  static get EARTH() { return EARTH ;}
  static get MOON() { return MOON ;}
  static get MOON_REVERSED() { return MOON_REVERSED ;}
  static get DOTDOTDOT() { return DOTDOTDOT;}
  static get DOT() { return DOT ;}
  static get DOT_REVERSED() { return DOT_REVERSED ;}
  static get ARROW_VARIANT_0() { return ARROW_VARIANT_0 ;}
  static get ARROW_VARIANT_1() { return ARROW_VARIANT_1 ;}
  static get ARROW_VARIANT_3() { return ARROW_VARIANT_3 ;}
  static get ARROW_VARIANT_2() { return ARROW_VARIANT_2 ;}
  static get WEATHER_VARIANT_1() { return WEATHER_VARIANT_1 ;}
  static get WEATHER() { return WEATHER ;}
  static get BALL_VARIANT_0() { return BALL_VARIANT_0 ;}
  static get SNAKE_VARIANT_0() { return SNAKE_VARIANT_0 ;}
  static get SNAKE_VARIANT_1() { return SNAKE_VARIANT_1 ;}
  static get SNAKE_VARIANT_2() { return SNAKE_VARIANT_2 ;}
  static get SNAKE_VARIANT_3() { return SNAKE_VARIANT_3 ;}
  static get DOTS_VARIANT_2() { return DOTS_VARIANT_2 ;}
  static get DOTS_VARIANT_3() { return DOTS_VARIANT_3 ;}
  static get DOTS_VARIANT_4() { return DOTS_VARIANT_4 ;}
  static get DOTS_VARIANT_5() { return DOTS_VARIANT_5 ;}
  static get TRIGRAM() { return TRIGRAM ;}
  static get BOUNCE() { return BOUNCE ;}
  static get SQUARE() { return SQUARE ;}
  static get SQUARE_VARIANT_1() { return SQUARE_VARIANT_1 ;}
  static get BLOCK_VARIANT_0() { return BLOCK_VARIANT_0 ;}
  static get BLOCK_VARIANT_1() { return BLOCK_VARIANT_1 ;}
  static get BLOCK_VARIANT_2() { return BLOCK_VARIANT_2 ;}
  static get DICE() { return DICE ;}
  static get ARROWS() { return ARROWS ;}
  static get ARROWS_VARIANT_4() { return ARROWS_VARIANT_4 ;}
  static get ARROWS_VARIANT_5() { return ARROWS_VARIANT_5 ;}
  static get TREE() { return TREE ;}
  static get TOGGLE() { return TOGGLE ;}
  static get TOGGLE_VARIANT_1() { return TOGGLE_VARIANT_1 ;}
  static get BOUNCING_BAR() { return BOUNCING_BAR ;}
  static get BOUNCING_BAR_VARIANT_2() { return BOUNCING_BAR_VARIANT_2 ;}
  static get BOUNCING_BAR_VARIANT_3() { return BOUNCING_BAR_VARIANT_3 ;}
  static get FEATHERED_ARROWS() { return FEATHERED_ARROWS ;}
  
  static create(name){
    return new SpinnerFrames(sets[name], fps[name] || 10)
  }
}