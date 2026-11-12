# Design

## Static application

- `server.mjs`: minimal dependency-free HTTP static file server.
- `pages.mjs`: channel content and page-navigation helpers.
- `app.mjs`: keyboard navigation, weather view and rendering.
- `index.html` + `styles.css`: semantic responsive Teletext interface.
- `weather.mjs`: requests model conditions for a fixed set of cities from Open-Meteo and checks units and timestamps.

## Offline design from Kiro Web

- `sw.js` precaches the same-origin shell. The cache name includes the service worker scope and release version. Old caches are removed only within that scope.
- `offline.mjs` registers the worker using relative paths and updates a polite status message when its own worker takes control. Numbered links use URL fragments, so the same cached document can render any channel.
- Weather remains a network request and reports failures instead of displaying stale values as current. The project uses no build step or API keys.

The implementation came from a Kiro Web session that used the offline user story as input. To verify it, load the app from its project subpath, wait for the ready message, take the app server offline, and reopen page 300. Check that the page is still usable and that a failed weather request shows an unavailable state.
