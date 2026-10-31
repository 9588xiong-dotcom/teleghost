import { adjacentPage, appendDigit, lookupPage } from './pages.mjs';

const elements = {
  form: document.querySelector('#page-form'),
  input: document.querySelector('#page-input'),
  number: document.querySelector('#page-number'),
  footer: document.querySelector('#page-footer'),
  title: document.querySelector('#page-title'),
  eyebrow: document.querySelector('#page-eyebrow'),
  section: document.querySelector('#section-label'),
  intro: document.querySelector('#page-intro'),
  list: document.querySelector('#page-list'),
  note: document.querySelector('#page-note'),
  status: document.querySelector('#page-hint'),
  clock: document.querySelector('#clock')
};

let currentPage = 100;
let pageBuffer = '';

function showPage(number, updateHash = true) {
  const page = lookupPage(number);
  if (!page) {
    elements.status.textContent = `PAGE ${number} NOT FOUND · TRY 100, 101, 120, 200, 300 OR 400`;
    elements.input.focus();
    return false;
  }

  currentPage = page.number;
  pageBuffer = '';
  elements.input.value = '';
  elements.number.textContent = String(page.number);
  elements.footer.textContent = String(page.number);
  elements.title.textContent = page.title;
  elements.eyebrow.textContent = page.eyebrow;
  elements.section.textContent = page.section;
  elements.intro.textContent = page.intro;
  elements.note.textContent = page.note;
  elements.list.replaceChildren();

  for (const [number, category, title] of page.lines) {
    const row = document.createElement('div');
    row.className = 'teletext-row';
    for (const [value, className] of [[number, 'row-number'], [category, 'row-category'], [title, 'row-title']]) {
      const cell = document.createElement('span');
      cell.className = className;
      cell.textContent = value;
      row.append(cell);
    }
    elements.list.append(row);
  }

  document.querySelector('.screen').dataset.pageColor = page.color;
  for (const link of document.querySelectorAll('[data-page]')) {
    if (link.dataset.page === String(page.number)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  elements.status.textContent = `YOU ARE VIEWING PAGE ${page.number} · ${page.title}`;
  if (updateHash && location.hash !== `#${page.number}`) location.hash = String(page.number);
  return true;
}

function goToHash() {
  const target = location.hash.replace('#', '').trim();
  if (target) showPage(target, false);
  else showPage(100, false);
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const entered = elements.input.value.trim();
  if (!/^\d{3}$/.test(entered)) {
    elements.status.textContent = 'ENTER EXACTLY THREE DIGITS (E.G. 100)';
    elements.input.focus();
    return;
  }
  showPage(entered);
});

elements.input.addEventListener('input', () => {
  elements.input.value = elements.input.value.replace(/\D/g, '').slice(0, 3);
});

document.querySelector('#prev-button').addEventListener('click', () => showPage(adjacentPage(currentPage, -1)));
document.querySelector('#next-button').addEventListener('click', () => showPage(adjacentPage(currentPage, 1)));
window.addEventListener('hashchange', goToHash);

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if (typing) return;

  if (/^\d$/.test(event.key)) {
    pageBuffer = appendDigit(pageBuffer, event.key);
    elements.input.value = pageBuffer;
    elements.status.textContent = `PAGE INPUT: ${pageBuffer} · PRESS ENTER`;
    event.preventDefault();
  } else if (event.key === 'Enter' && pageBuffer.length === 3) {
    showPage(pageBuffer);
    event.preventDefault();
  } else if (event.key === 'Escape') {
    pageBuffer = '';
    elements.input.value = '';
    elements.status.textContent = 'PAGE INPUT CLEARED';
  } else if (event.key === 'ArrowLeft') {
    showPage(adjacentPage(currentPage, -1));
    event.preventDefault();
  } else if (event.key === 'ArrowRight') {
    showPage(adjacentPage(currentPage, 1));
    event.preventDefault();
  }
});

function updateClock() {
  elements.clock.textContent = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
}

updateClock();
setInterval(updateClock, 1000);
goToHash();
