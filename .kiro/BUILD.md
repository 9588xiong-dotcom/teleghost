# Verified Kiro build

## Contribution boundary

Kiro Web supplied the original `sw.js` / `offline.mjs`, then supplied `weather-cache.mjs` and `test/weather-cache.test.mjs` for the pocket-station edition. The snapshot files were imported unchanged from complete code blocks. Codex reviewed and integrated them, added the bulletin feature and tests, and changed the shell manifest/status wording. The original worker was also adjusted for sequential precaching before this edition.

## Snapshot specification sent to Kiro

Implement dependency-free `saveSnapshot(storage, city, conditions, now=Date.now()) -> boolean` and `readSnapshot(storage, city, now=Date.now()) -> snapshot | null`. Use separate `teleghost.weather.v1.<city>` keys for exact `oslo`, `london`, and `tokyo`. Validate finite temperature/feelsLike/wind and nonempty summary/localTime/timezone on write and read. Reject corruption, unsupported cities, future times and records older than 24 hours. Catch storage denial and quota errors. Inject storage; do not touch DOM or global localStorage. Return complete production code plus Node tests. Leave weather API requests outside the service worker. Do not publish.

Kiro delivered ten tests and reported running them successfully. Local `node --test` independently passes the imported tests alongside the rest of the suite.

## Why this boundary mattered

The service worker can retain the interface, but that does not make weather fresh. A separate snapshot layer makes the age policy testable without a browser or network. The UI labels saved data, shows the original provider time, and rechecks age while the page stays open. Corrupt storage is treated as missing data rather than repaired with invented defaults.

The v0.3 draft recovery, editing/navigation refinements and replacement dialogs were implemented by Codex. They are not attributed to a new Kiro interaction.

This was a real Kiro Web interaction, continuing the same TeleGhost offline-development session. Specs were prepared and revised with Codex; do not describe every repository file as Kiro-generated or claim unperformed hook, MCP, Crew or property-based-testing workflows.

The v0.3.1 maintenance pass was implemented by Codex: ownership-aware draft cleanup, rechecking saved content after asynchronous confirmations, and refreshing saved-page viewers across tabs. Six additional regression tests bring the suite to 34. No additional Kiro interaction is claimed.

## Share-card edition

Codex implemented the v0.4 card integration, mobile notice-first layout and six additional tests. QR encoding uses Project Nayuki's pre-existing MIT library, disclosed in `THIRD_PARTY.md`. No new Kiro interaction occurred in this pass. Repository specs describe the design; they do not imply Kiro executed the new work.
