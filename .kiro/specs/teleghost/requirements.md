# Requirements

## User story 1 — Find information by page number

As a visitor, I can navigate TeleGhost using a three-digit page number, clickable channels, and keyboard controls so the interface feels like classic Teletext.

Acceptance criteria:
- A valid page number displays the correct content and a clear heading.
- Unknown page numbers show an explanatory error and available page options.
- Mobile users can navigate without a keyboard.
- Focus indicators and screen-reader status messages are available.

## User story 2 — Read useful current news

As a visitor, I can read the latest headlines from clearly credited RSS sources.

Acceptance criteria:
- A server-side endpoint fetches configured approved RSS feeds with timeouts and caching.
- Headlines link to the original publisher and include published/updated timestamps.
- User content is escaped or rendered safely; external links use safe target attributes.
- Network failures show an honest stale-data or offline status.

## User story 3 — Find local weather

As a visitor, I can select a city and see current weather with explicit source and timestamp.

Acceptance criteria:
- The user chooses a location; no precise location permission is required by default.
- Forecast data uses a legally permitted public API and clearly labeled units.
- Missing data is reported as unavailable instead of fabricated.

## User story 4 — Remain useful offline

As a visitor, I can reopen cached channels offline and tell when content was last updated.

Acceptance criteria:
- The app shell works after a prior successful visit.
- Offline content is clearly marked as cached or sample data.
- Tests cover navigation, failure states and accessibility-critical controls.
