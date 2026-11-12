## Gotchas

- Devpost asks how Kiro was used -> Refer to the project spec and the offline implementation when completing the entry.
- Weather unavailable -> The browser may be offline or the provider may be down -> Use Try again on page 200.
- An old page persists after an update -> The service worker caches the release -> Bump VERSION in sw.js when changing a shell file.

## State

- Goal: Build TeleGhost for Kiroween 2026, Resurrection category.
- The local version has numbered channels, a Teletext archive, and model conditions for Oslo, London and Tokyo. Weather comes from Open-Meteo.
- Kiro Web implemented the service worker and offline status. The browser checks confirmed a cached archive under /teleghost/ and unavailable weather offline.
- The app and video are public. Devpost contains a saved Resurrection draft for the user to review before submitting.
