import { adjacentPage, appendDigit, lookupPage } from './pages.mjs';
import { loadCurrentConditions } from './weather.mjs';
import { readSnapshot, saveSnapshot } from './weather-cache.mjs';
import { BULLETIN_KEY, EXAMPLE, loadBulletin, saveBulletinWithConfirmation, validateBulletin, decodeBulletin, wrapBulletin, shareURL } from './bulletin.mjs';
import { DRAFT_KEY, readDraft, saveDraft, clearDraft } from './draft.mjs';
import { prepareSignalCard } from './share-card.mjs';

const $ = (id) => document.getElementById(id);
function confirmReplacement(message, action = 'Replace') {
  const dialog = $('confirm-dialog');
  $('confirm-message').textContent = message;
  $('confirm-action').textContent = action;
  dialog.returnValue = 'cancel';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true });
    dialog.showModal();
  });
}
const storage = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
let currentPage = 100;
let pageBuffer = '';
let weatherRequest;
let received = null;
let receivedLabel = '';
let draftDirty = false;
let draftBackedUp = false;
let backedUpDraft = null;
let studioBase = JSON.stringify(loadBulletin(storage));
let currentBulletin = loadBulletin(storage) || EXAMPLE;
let weatherExpiry;
let signalCard = null;
let signalImageURL = null;

function drawWeather(conditions, label) {
  $('weather-temperature').textContent = `${conditions.temperature} °C`;
  $('weather-feels-like').textContent = `${conditions.feelsLike} °C`;
  $('weather-wind').textContent = `${conditions.wind} km/h`;
  $('weather-status').textContent = `${label} · ${conditions.summary} · ${conditions.localTime} (${conditions.timezone})`;
  $('weather-values').hidden = false;
}

async function refreshWeather() {
  weatherRequest?.abort();
  clearTimeout(weatherExpiry);
  const controller = new AbortController();
  weatherRequest = controller;
  const city = $('weather-city').value;
  const cityName = $('weather-city').selectedOptions[0].textContent;
  $('weather-values').hidden = true;
  $('weather-retry').hidden = true;
  $('weather-status').textContent = `Tuning in to ${cityName}…`;
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    if (!navigator.onLine) throw new Error('Offline');
    const conditions = await loadCurrentConditions(city, { signal: controller.signal });
    if (weatherRequest !== controller) return;
    const saved = saveSnapshot(storage, city, conditions);
    drawWeather(conditions, saved ? 'JUST FETCHED · snapshot saved' : 'JUST FETCHED · device storage unavailable');
    weatherExpiry = setTimeout(refreshWeather, 15 * 60 * 1000);
  } catch {
    if (weatherRequest !== controller) return;
    const snapshot = readSnapshot(storage, city);
    if (snapshot) {
      const age = Math.floor((Date.now() - snapshot.savedAt) / 60000);
      drawWeather(snapshot.conditions, `SAVED SNAPSHOT · downloaded ${age} min ago · cannot refresh`);
      weatherExpiry = setTimeout(refreshWeather, 60000);
    } else {
      $('weather-status').textContent = `Conditions for ${cityName} are unavailable. No saved snapshot from the last 24 hours.`;
    }
    $('weather-retry').hidden = false;
  } finally {
    clearTimeout(timeout);
    if (weatherRequest === controller) weatherRequest = undefined;
  }
}

function setWeatherVisible(visible) {
  const wasVisible = !$('weather-panel').hidden;
  $('weather-panel').hidden = !visible;
  if (visible && !wasVisible) refreshWeather();
  if (!visible) {
    const old = weatherRequest;
    weatherRequest = undefined;
    old?.abort();
    clearTimeout(weatherExpiry);
  }
}

function renderBulletin() {
  const saved = loadBulletin(storage);
  currentBulletin = received || saved || EXAMPLE;
  $('bulletin-origin').textContent = received ? receivedLabel : saved ? 'SAVED ON THIS DEVICE' : 'EXAMPLE / NOT A REAL EVENT';
  $('bulletin-size').textContent = `${new TextEncoder().encode(JSON.stringify(currentBulletin)).length} BYTES / TEXT`;
  $('bulletin-title').textContent = currentBulletin.title;
  $('bulletin-body').textContent = wrapBulletin(currentBulletin.body).join('\n');
  $('bulletin-date').textContent = `${currentBulletin.station} · Created ${new Date(currentBulletin.created).toLocaleString('en-GB')}`;
  $('save-received').textContent = saved ? 'Replace saved bulletin' : 'Keep on this device';
  $('save-received').hidden = !received && Boolean(saved);
  $('saved-bulletin-link').hidden = !received || !saved;
  $('hero-bulletin-link').textContent = saved ? 'Open your saved bulletin →' : 'Tune in to an example →';
  $('bulletin-status').textContent = '';
  $('share-fallback').hidden = true;
}

function showPage(number, updateHash = true, moveFocus = false) {
  const page = lookupPage(number);
  if (!page) {
    $('page-hint').textContent = `PAGE ${number} NOT FOUND · OPEN INDEX / 100 FOR AVAILABLE PAGES`;
    $('page-input').focus();
    return false;
  }
  currentPage = page.number;
  document.body.dataset.page = String(page.number);
  if (updateHash) received = null;
  pageBuffer = '';
  $('page-input').value = '';
  for (const id of ['page-number', 'page-footer']) $(id).textContent = page.number;
  $('page-title').textContent = page.title;
  $('page-eyebrow').textContent = page.eyebrow;
  $('section-label').textContent = page.section;
  $('page-intro').textContent = page.intro;
  $('page-note').textContent = page.note;
  $('page-list').replaceChildren();
  $('page-list').hidden = [150, 200, 500].includes(page.number);
  $('bulletin-panel').hidden = page.number !== 150;
  $('studio-panel').hidden = page.number !== 500;
  setWeatherVisible(page.number === 200);
  if (page.number === 150) renderBulletin();
  for (const [number, category, title] of page.lines) {
    const link = /^\d{3}$/.test(number) && lookupPage(number);
    const row = document.createElement(link ? 'a' : 'div');
    row.className = 'teletext-row';
    if (link) row.href = `#${number}`;
    for (const [value, name] of [[number, 'row-number'], [category, 'row-category'], [title, 'row-title']]) {
      const cell = document.createElement('span');
      cell.className = name;
      cell.textContent = value;
      row.append(cell);
    }
    $('page-list').append(row);
  }
  document.querySelector('.screen').dataset.pageColor = page.color;
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === String(page.number)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('page-hint').textContent = `YOU ARE VIEWING PAGE ${page.number} · ${page.title}`;
  if (updateHash && location.hash !== `#${page.number}`) history.pushState(null, '', `#${page.number}`);
  if (moveFocus) $('terminal').focus({ preventScroll: true });
  return true;
}

function goToHash() {
  const target = location.hash.slice(1);
  if (target === 'terminal') { $('terminal').focus(); return; }
  received = null;
  if (target.startsWith('150~')) {
    try {
      received = decodeBulletin(target.slice(4));
      receivedLabel = 'SHARED COPY / NOT SAVED';
      showPage(150, false);
    } catch (error) {
      received = null;
      showPage(100, false);
      $('page-hint').textContent = error.message;
    }
    return;
  }
  if (!target || (/^\d{3}$/.test(target) && lookupPage(target))) {
    showPage(target || 100, false);
  } else {
    showPage(100, false);
    history.replaceState(null, '', '#100');
    $('page-hint').textContent = 'PAGE LINK NOT FOUND · SHOWING PAGE 100';
  }
}

function draft() {
  return validateBulletin({ v: 1, station: $('station-name').value.trim(), title: $('bulletin-heading').value.trim(),
    body: $('bulletin-text').value.trim(), created: new Date().toISOString() });
}
function updatePreview() {
  const text = $('bulletin-text').value;
  const lines = wrapBulletin(text);
  $('studio-meter').textContent = `${[...text].length} / 480 characters · ${text ? lines.length : 0} / 16 lines`;
  $('studio-preview').textContent = `${$('station-name').value || 'YOUR STATION'}\n\n${$('bulletin-heading').value || 'YOUR HEADLINE'}\n\n${lines.join('\n')}`;
  $('bulletin-text').setCustomValidity(lines.length > 16 ? 'Please use no more than 16 wrapped lines.' : '');
  for (const [id, limit] of [['station-name', 24], ['bulletin-heading', 40], ['bulletin-text', 480]]) {
    const field = $(id);
    if (id !== 'bulletin-text') field.setCustomValidity('');
    if ([...field.value].length > limit) field.setCustomValidity(`Please use no more than ${limit} characters.`);
  }
}
function fillStudio(value) {
  $('station-name').value = value?.station || '';
  $('bulletin-heading').value = value?.title || '';
  $('bulletin-text').value = value?.body || '';
  updatePreview();
}
function keepDraft() {
  draftDirty = true;
  const value = { v: 1, station: $('station-name').value,
    title: $('bulletin-heading').value, body: $('bulletin-text').value, base: studioBase };
  draftBackedUp = saveDraft(storage, value);
  if (draftBackedUp) backedUpDraft = value;
  $('draft-status').textContent = draftBackedUp ? 'Draft backed up on this device. Your saved bulletin is unchanged.'
    : 'Draft not backed up. Keep this tab open; check character limits or browser storage.';
}
function finishDraft() {
  const cleared = clearDraft(storage, backedUpDraft);
  draftDirty = false; draftBackedUp = false;
  backedUpDraft = null;
  studioBase = JSON.stringify(loadBulletin(storage));
  $('draft-status').textContent = cleared ? '' : 'An older draft could not be cleared from browser storage.';
}
const recoveredDraft = readDraft(storage);
fillStudio(recoveredDraft || loadBulletin(storage));
if (recoveredDraft) {
  backedUpDraft = recoveredDraft;
  studioBase = recoveredDraft.base ?? studioBase;
  draftDirty = true; draftBackedUp = true;
  $('draft-status').textContent = 'Draft restored. Continue editing, or reset to your saved bulletin.';
}
$('hero-bulletin-link').textContent = loadBulletin(storage) ? 'Open your saved bulletin →' : 'Tune in to an example →';
$('studio-form').addEventListener('input', () => { $('studio-status').textContent = ''; updatePreview(); keepDraft(); });
$('load-example').addEventListener('click', async () => {
  if (draftDirty && !await confirmReplacement('Replace the text in the editor with the example? Your saved bulletin will stay unchanged.', 'Load example')) return;
  studioBase = JSON.stringify(loadBulletin(storage));
  fillStudio(EXAMPLE); keepDraft();
  $('studio-status').textContent = 'Example loaded. Edit it for your community before sharing.';
});
$('reset-studio').addEventListener('click', async () => {
  if (draftDirty && !await confirmReplacement('Discard your editor draft and return to the saved bulletin?', 'Reset editor')) return;
  if (!clearDraft(storage, backedUpDraft)) { $('studio-status').textContent = 'Could not clear the draft. Your editor text has been kept.'; return; }
  fillStudio(loadBulletin(storage)); finishDraft();
  $('studio-status').textContent = 'Editor reset. Your saved bulletin is unchanged.';
});
$('edit-bulletin').addEventListener('click', async () => {
  const value = currentBulletin;
  if (draftDirty && !await confirmReplacement('Replace your editor draft with this bulletin? Your saved bulletin will stay unchanged.', 'Edit this copy')) return;
  studioBase = JSON.stringify(loadBulletin(storage));
  fillStudio(value); keepDraft();
  showPage(500, true, true);
  $('station-name').focus();
  $('studio-status').textContent = 'Editing a copy. Save when ready, then share a new link.';
});
$('studio-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const value = draft();
    const saved = await saveBulletinWithConfirmation(storage, value, studioBase,
      () => confirmReplacement('Your saved bulletin changed since editing began or since the last confirmation. Replace the current saved copy with this draft?', 'Replace saved bulletin'));
    if (!saved) return;
    received = null; finishDraft();
    showPage(150, true, true);
    $('bulletin-status').textContent = 'Saved on this device. Copy the link to pass it on.';
  } catch (error) { $('studio-status').textContent = error.message; }
});
$('preview-unsaved').addEventListener('click', () => {
  try {
    const url = shareURL(location.href, draft());
    history.pushState(null, '', url);
    goToHash();
    $('terminal').focus({ preventScroll: true });
    $('bulletin-status').textContent = 'Preview ready. This link keeps the exact text when you reload.';
  } catch (error) { $('studio-status').textContent = error.message; }
});
$('save-received').addEventListener('click', async () => {
  const value = currentBulletin;
  try {
    const saved = await saveBulletinWithConfirmation(storage, value, null,
      () => confirmReplacement('Replace the current bulletin saved on this device with this copy? If it changes while this dialog is open, you will be asked again.', 'Replace saved bulletin'));
    if (!saved) return;
    received = null;
    if (!draftDirty) { fillStudio(saved); studioBase = JSON.stringify(saved); }
    history.replaceState(null, '', '#150');
    renderBulletin();
    $('bulletin-status').textContent = 'Saved. Reopen page 150 on this device to read it again.';
  } catch (error) { $('bulletin-status').textContent = error.message; }
});
$('share-bulletin').addEventListener('click', async () => {
  const url = shareURL(location.href, currentBulletin);
  try {
    await navigator.clipboard.writeText(url);
    $('bulletin-status').textContent = 'Link copied. Send it to someone to open this exact bulletin.';
  } catch {
    $('share-fallback').hidden = false;
    $('share-link').value = url; $('share-link').focus(); $('share-link').select();
    $('bulletin-status').textContent = 'Copy the selected link manually.';
  }
});
$('download-bulletin').addEventListener('click', () => {
  const value = currentBulletin;
  const content = `TELEGHOST / ${value.station}\n${value.title}\n\n${wrapBulletin(value.body).join('\n')}\n\nCreated: ${value.created}\nA fixed copy. Sender name is self-declared.\n`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'teleghost-bulletin.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('bulletin-status').textContent = 'Text download requested.';
});

function releaseSignalImage() {
  if (signalImageURL) URL.revokeObjectURL(signalImageURL);
  signalImageURL = null;
}
$('open-signal-card').addEventListener('click', () => {
  try {
    signalCard = prepareSignalCard(location.href, currentBulletin);
    releaseSignalImage();
    $('card-station').textContent = signalCard.value.station;
    $('card-title').textContent = signalCard.value.title;
    $('card-body').textContent = wrapBulletin(signalCard.value.body).join('\n');
    $('card-created').textContent = `Created ${new Date(signalCard.value.created).toLocaleString('en-GB')}`;
    $('card-site').textContent = signalCard.site;
    $('card-instructions').textContent = signalCard.notice;
    $('card-instructions').classList.toggle('local-warning', signalCard.local);
    $('card-example').hidden = JSON.stringify(signalCard.value) !== JSON.stringify(EXAMPLE);
    $('card-scan-label').textContent = signalCard.local ? 'LOCAL PREVIEW' : 'SCAN TO KEEP A COPY';
    $('card-qr').hidden = !signalCard.svg;
    $('card-qr-unavailable').hidden = Boolean(signalCard.svg);
    $('card-qr-unavailable').textContent = signalCard.reason;
    if (!signalCard.svg) {
      $('card-scan-label').textContent = 'READ & PASS IT ON';
      $('card-instructions').textContent = 'This card contains the full notice. For a digital copy, ask the sender for the share link.';
    }
    $('download-qr').disabled = !signalCard.svg;
    $('card-link-details').open = false;
    $('card-link').value = signalCard.url;
    $('card-status').textContent = '';
    if (signalCard.svg) {
      signalImageURL = URL.createObjectURL(new Blob([signalCard.svg], { type: 'image/svg+xml' }));
      $('card-qr').src = signalImageURL;
    } else $('card-qr').removeAttribute('src');
    $('signal-dialog').showModal();
  } catch (error) { $('bulletin-status').textContent = error.message; }
});
$('signal-dialog').addEventListener('close', () => {
  releaseSignalImage();
  signalCard = null;
});
$('close-signal-card').addEventListener('click', () => $('signal-dialog').close());
$('copy-card-link').addEventListener('click', async () => {
  if (!signalCard) return;
  const url = signalCard.url;
  try {
    await navigator.clipboard.writeText(url);
    if (signalCard?.url === url) $('card-status').textContent = 'Link copied. It opens the exact notice on this card.';
  } catch {
    if (signalCard?.url !== url) return;
    $('card-link-details').open = true;
    $('card-link').focus(); $('card-link').select();
    $('card-status').textContent = 'Copy the selected link manually.';
  }
});
$('download-qr').addEventListener('click', () => {
  if (!signalCard?.svg) return;
  const url = URL.createObjectURL(new Blob([signalCard.svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'teleghost-qr.svg'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('card-status').textContent = 'QR image download requested. Keep its white border when printing.';
});
$('print-signal-card').addEventListener('click', async () => {
  const selected = signalCard;
  if (selected?.svg) {
    try { await $('card-qr').decode(); }
    catch { $('card-status').textContent = 'The QR image could not be prepared. Close this card and try again.'; return; }
  }
  if ($('signal-dialog').open && signalCard === selected) window.print();
});

$('page-form').addEventListener('submit', event => {
  event.preventDefault();
  const entered = $('page-input').value.trim();
  if (!/^\d{3}$/.test(entered)) { $('page-hint').textContent = 'ENTER EXACTLY THREE DIGITS (E.G. 100)'; return; }
  showPage(entered, true, true);
});
$('page-input').addEventListener('input', () => { $('page-input').value = $('page-input').value.replace(/\D/g, '').slice(0, 3); });
$('prev-button').addEventListener('click', () => showPage(adjacentPage(currentPage, -1), true, true));
$('next-button').addEventListener('click', () => showPage(adjacentPage(currentPage, 1), true, true));
$('weather-city').addEventListener('change', refreshWeather);
$('weather-retry').addEventListener('click', refreshWeather);
window.addEventListener('hashchange', goToHash);
window.addEventListener('online', () => { if (currentPage === 200) refreshWeather(); });
window.addEventListener('offline', () => { if (currentPage === 200) refreshWeather(); });
window.addEventListener('beforeunload', event => { if (draftDirty && !draftBackedUp) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('storage', event => {
  if (event.key === BULLETIN_KEY || event.key === null) {
    const saved = loadBulletin(storage);
    $('hero-bulletin-link').textContent = saved ? 'Open your saved bulletin →' : 'Tune in to an example →';
    if (!draftDirty) { fillStudio(saved); studioBase = JSON.stringify(saved); }
    if (currentPage === 150 && !received) {
      renderBulletin();
      $('bulletin-status').textContent = saved ? 'Saved bulletin updated in another tab.' : 'The saved bulletin was removed in another tab. Showing the example.';
    }
  }
  if ((event.key !== DRAFT_KEY && event.key !== null) || !draftDirty) return;
  draftBackedUp = false;
  $('draft-status').textContent = 'The draft backup changed in another tab. Keep this tab open, or edit to back up this version again.';
});

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !/^#\d{3}$/.test(link.getAttribute('href')) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  showPage(link.getAttribute('href').slice(1), true, true);
  $('terminal').scrollIntoView({ block: 'start', behavior: 'auto' });
});
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,button,[contenteditable="true"],summary')) return;
  if (/^\d$/.test(event.key)) {
    pageBuffer = appendDigit(pageBuffer, event.key); $('page-input').value = pageBuffer;
    $('page-hint').textContent = `PAGE INPUT: ${pageBuffer} · PRESS ENTER`; event.preventDefault();
  } else if (event.key === 'Enter' && pageBuffer.length === 3) {
    showPage(pageBuffer, true, true); event.preventDefault();
  } else if (event.key === 'Escape') {
    pageBuffer = ''; $('page-input').value = ''; $('page-hint').textContent = 'PAGE INPUT CLEARED';
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    showPage(adjacentPage(currentPage, event.key === 'ArrowLeft' ? -1 : 1), true, true); event.preventDefault();
  }
});
function setReadingMode(enabled) {
  document.body.classList.toggle('reading-mode', enabled);
  $('reading-mode').setAttribute('aria-pressed', String(enabled));
  $('reading-mode').textContent = enabled ? 'Reading mode: on' : 'Reading mode';
}
try { setReadingMode(storage.getItem('teleghost.reading') === 'true'); } catch { /* Storage is optional. */ }
$('reading-mode').addEventListener('click', () => {
  const enabled = $('reading-mode').getAttribute('aria-pressed') !== 'true';
  setReadingMode(enabled);
  try { storage.setItem('teleghost.reading', String(enabled)); } catch { /* Keep the session preference. */ }
});
function updateClock() {
  $('clock').textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
}
updateClock(); setInterval(updateClock, 1000); goToHash();
