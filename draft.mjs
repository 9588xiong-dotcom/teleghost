export const DRAFT_KEY = 'teleghost.draft.v1';

function cleanDraft(value) {
  if (!value || value.v !== 1) throw new Error('Invalid draft');
  const clean = { v: 1 };
  for (const [key, limit] of [['station', 24], ['title', 40], ['body', 480]]) {
    if (typeof value[key] !== 'string' || [...value[key]].length > limit) throw new Error('Invalid draft');
    clean[key] = value[key];
  }
  if (typeof value.base === 'string' && value.base.length <= 10000) clean.base = value.base;
  return clean;
}

export function readDraft(storage) {
  try { return cleanDraft(JSON.parse(storage.getItem(DRAFT_KEY))); }
  catch { return null; }
}

export function saveDraft(storage, value) {
  try { storage.setItem(DRAFT_KEY, JSON.stringify(cleanDraft(value))); return true; }
  catch { return false; }
}

export function clearDraft(storage, expected) {
  try {
    if (!expected || storage.getItem(DRAFT_KEY) !== JSON.stringify(cleanDraft(expected))) return true;
    storage.setItem(DRAFT_KEY, 'null');
    return true;
  }
  catch { return false; }
}
