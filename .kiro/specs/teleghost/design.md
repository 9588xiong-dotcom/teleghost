# Design

## Existing starter

- `server.mjs`: minimal dependency-free HTTP static file server.
- `pages.mjs`: static demonstration page data and pure page-navigation helpers.
- `app.mjs`: event handling, keyboard buffer, clock and rendering into safe DOM nodes.
- `index.html` + `styles.css`: semantic responsive Teletext interface.

## Proposed Kiro implementation

- Introduce server-side `/api/news` and `/api/weather` endpoints with validation, caching and bounded network calls.
- Define a normalized information-channel schema: `{number, title, source, updatedAt, status, items}`.
- Preserve static demo pages only as an explicit preview or connection-failure fallback.
- Add a service worker for offline assets; cache response metadata to distinguish current from stale content.
- Keep a zero-dependency starting point. Add dependencies only with a clear justification.

## Design constraints

- Do not expose third-party API keys to the browser.
- Never display untrusted HTML from feed entries. Insert text using `textContent`.
- Avoid claiming data is live unless sourced and timestamped.
- Include tests for HTTP failures, malformed feed data and accessibility navigation.
