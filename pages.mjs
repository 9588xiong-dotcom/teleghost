export const PAGES = Object.freeze([
  {
    number: 100,
    title: 'THE FRONT PAGE',
    section: 'WELCOME',
    color: 'cyan',
    eyebrow: 'THE INFORMATION AGE, REWOUND',
    intro: 'THE PAST IS ONLINE AGAIN.',
    lines: [
      ['101', 'NEWS', 'Headlines, with a retro twist'],
      ['120', 'TECH', 'Technology through the decades'],
      ['200', 'WEATHER', 'Forecast channel preview'],
      ['300', 'ARCHIVE', 'A brief history of Teletext'],
      ['400', 'HELP', 'How to use this terminal']
    ],
    note: 'DEMO EDITION · Select a channel to continue.'
  },
  {
    number: 101,
    title: 'NEWS DESK',
    section: 'HEADLINES',
    color: 'yellow',
    eyebrow: 'SAMPLE BULLETIN',
    intro: 'YOUR WINDOW ON THE WORLD',
    lines: [
      ['01', 'RETRO', 'Teletext-style navigation returns'],
      ['02', 'DESIGN', 'Small interfaces, big personality'],
      ['03', 'WEB', 'Keyboard-first browsing matters'],
      ['04', 'NEXT', 'Real RSS feeds are on the roadmap']
    ],
    note: 'SAMPLE CONTENT · These are not live news headlines.'
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
    eyebrow: 'PREVIEW MODE',
    intro: 'FORECAST CONNECTION PENDING',
    lines: [
      ['OSLO', '—', 'Live weather not connected'],
      ['LONDON', '—', 'Live weather not connected'],
      ['TOKYO', '—', 'Live weather not connected'],
      ['SOURCE', '—', 'Real API integration planned']
    ],
    note: 'NO LIVE WEATHER DATA · This is a UI preview.'
  },
  {
    number: 300,
    title: 'THE ARCHIVE',
    section: 'HISTORY',
    color: 'cyan',
    eyebrow: 'THE GHOST IN THE TELEVISION',
    intro: 'BEFORE THE WEB, THERE WERE PAGES.',
    lines: [
      ['WHAT', 'TELETEXT', 'Text and graphics broadcast with TV'],
      ['HOW', 'PAGES', 'Three-digit numbers for quick access'],
      ['WHY', 'SPEED', 'A lightweight, direct information format'],
      ['NOW', 'REVIVAL', 'Reimagined for today\'s devices']
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
    note: 'PRESS 100 TO RETURN HOME.'
  }
]);

export const PAGE_NUMBERS = Object.freeze(PAGES.map((page) => page.number));

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
