export const PAGES = Object.freeze([
  {
    number: 100,
    title: 'THE FRONT PAGE',
    section: 'WELCOME',
    color: 'cyan',
    eyebrow: 'THE INFORMATION AGE, REWOUND',
    intro: 'YOUR COMMUNITY. YOUR FREQUENCY.',
    lines: [
      ['150', 'ON AIR', 'Read a pocket-sized community bulletin'],
      ['500', 'CREATE', 'Write one. Share it. Keep it offline.'],
      ['200', 'WEATHER', 'Current conditions in three cities'],
      ['300', 'ARCHIVE', 'A brief history of Teletext'],
      ['400', 'HELP', 'How to use this terminal']
    ],
    note: 'TAP A ROW OR TYPE THREE DIGITS + ENTER.'
  },
  {
    number: 101,
    title: 'STATION BULLETIN',
    section: 'PROGRAMME GUIDE',
    color: 'yellow',
    eyebrow: 'FROM THE TELEGHOST DESK',
    intro: 'WHAT TO TUNE IN TO',
    lines: [
      ['150', 'ON AIR', 'Your saved bulletin, or an example'],
      ['500', 'STUDIO', 'Make a shareable community page'],
      ['200', 'WEATHER', 'Choose a city and check current conditions'],
      ['300', 'ARCHIVE', 'From Ceefax to a browser tab'],
      ['400', 'CONTROLS', 'Use your keyboard as a remote']
    ],
    note: 'TYPE ANY LISTED PAGE NUMBER AND PRESS ENTER.'
  },
  {
    number: 150, title: 'COMMUNITY SIGNAL', section: 'POCKET BULLETIN', color: 'magenta',
    eyebrow: 'SMALL ENOUGH TO PASS ON', intro: '', lines: [],
    note: 'A saved page, not a live feed. Edit your own in STUDIO / 500.'
  },
  {
    number: 120,
    title: 'TECH FILES',
    section: 'TECHNOLOGY',
    color: 'magenta',
    eyebrow: 'THEN / NOW',
    intro: 'SIMPLE TOOLS. ENDLESS POSSIBILITIES.',
    lines: [
      ['1970s', 'BROADCAST', 'Teletext sends pages in TV signals'],
      ['1980s', 'LIVING RM', 'Remote controls browse numbered pages'],
      ['1990s', 'INTERNET', 'Web pages become the new gateway'],
      ['2026', 'TELEGHOST', 'Classic pages meet the modern browser']
    ],
    note: 'HISTORICAL OVERVIEW · Dates are approximate.'
  },
  {
    number: 200,
    title: 'WEATHER SERVICE',
    section: 'WEATHER',
    color: 'green',
    eyebrow: 'CURRENT MODEL CONDITIONS',
    intro: 'CHOOSE A CITY',
    lines: [],
    note: 'Model conditions, not a station observation. Saved snapshots expire after 24 hours. The timestamp is local to the selected city.'
  },
  {
    number: 300,
    title: 'THE ARCHIVE',
    section: 'HISTORY',
    color: 'cyan',
    eyebrow: 'THE GHOST IN THE TELEVISION',
    intro: 'BEFORE THE WEB, THERE WERE PAGES.',
    lines: [
      ['1974', 'CEEFAX', 'The BBC starts its teletext service'],
      ['SIGNAL', 'PAGES', 'Data rides in the television broadcast'],
      ['REMOTE', 'INDEX', 'Three digits select a numbered page'],
      ['TODAY', 'BROWSER', 'TeleGhost gives those numbers shareable links']
    ],
    note: 'INSPIRED BY TELETEXT · No original broadcaster assets used.'
  },
  {
    number: 400,
    title: 'HELP & CONTROLS',
    section: 'INSTRUCTIONS',
    color: 'yellow',
    eyebrow: 'GETTING AROUND',
    intro: 'YOUR REMOTE IS YOUR KEYBOARD.',
    lines: [
      ['000–999', 'TYPE', 'Enter a three-digit page number'],
      ['ENTER', 'OPEN', 'Open the number you have typed'],
      ['← / →', 'BROWSE', 'Go to the previous or next page'],
      ['ESC', 'CANCEL', 'Clear a partly entered number'],
      ['BUTTONS', 'TAP', 'Touch-friendly navigation is supported']
    ],
    note: 'Reading mode removes screen effects and increases text size. Saved pages require an initial online visit; browser storage can be cleared by your browser.'
  },
  {
    number: 500, title: 'BROADCAST STUDIO', section: 'MAKE YOUR OWN SIGNAL', color: 'magenta',
    eyebrow: 'FROM VIEWER TO BROADCASTER', intro: 'ONE PAGE. SOMETHING WORTH SHARING.', lines: [],
    note: 'A small format with a long memory.'
  }
]);

export const PAGE_NUMBERS = Object.freeze(PAGES.map((page) => page.number).sort((a, b) => a - b));

export function lookupPage(input) {
  const number = Number(input);
  return Number.isInteger(number) ? (PAGES.find((page) => page.number === number) ?? null) : null;
}

export function adjacentPage(input, direction) {
  const current = PAGE_NUMBERS.indexOf(Number(input));
  if (current === -1) return PAGE_NUMBERS[0];
  const shift = direction >= 0 ? 1 : -1;
  return PAGE_NUMBERS[(current + shift + PAGE_NUMBERS.length) % PAGE_NUMBERS.length];
}

export function appendDigit(buffer, digit) {
  if (!/^\d$/.test(String(digit))) return buffer;
  return `${buffer}${digit}`.slice(-3);
}
