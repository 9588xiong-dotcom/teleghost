# Requirements

## User story 1 — Find information by page number

As a visitor, I can navigate TeleGhost using a three-digit page number, clickable channels, and keyboard controls so the interface feels like classic Teletext.

Acceptance criteria:
- A valid page number displays the correct content and a clear heading.
- Unknown page numbers show an explanatory error and available page options.
- Mobile users can navigate without a keyboard.
- Focus indicators and screen-reader status messages are available.

## User story 2 — Learn how Teletext worked

As a visitor, I can find a station index and open a short archive about television Teletext.

Acceptance criteria:
- The station bulletin explains what is available by page number.
- The archive explains how page numbers and broadcast data worked and credits the historical source.
- Archive and help use the same keyboard and touch controls as the rest of the terminal.

## User story 3 — Find local weather

As a visitor, I can select a city and see current weather with explicit source and timestamp.

Acceptance criteria:
- The user chooses a location; no precise location permission is required by default.
- Forecast data uses a legally permitted public API and clearly labeled units.
- Missing data is reported as unavailable instead of fabricated.

## User story 4 — Remain useful offline

As a visitor, I can reopen cached channels offline and tell when content was last updated.

Acceptance criteria:
- After the app announces its offline copy is ready, a direct reload of page 300 works under `/teleghost/` even if the app server is unreachable.
- The cache is scoped to the static application shell. Weather requests bypass it.
- The footer announces when the offline copy is ready or the browser is offline. Weather failures show an unavailable state.
