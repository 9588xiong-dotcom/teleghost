# TeleGhost — Small pages. Lasting signal.

**A pocket bulletin station for clubs and community events.** Write a short notice, send its link, and keep reading after the connection disappears. TeleGhost resurrects Teletext's numbered pages and compact text format, then gives the viewer the ability to broadcast.

[Open TeleGhost](https://9588xiong-dotcom.github.io/teleghost/) · [Original demo (v0.1)](https://youtu.be/DPKETdNzXDU)

This is **v0.4.0**. The linked original demo shows the earlier v0.1 edition; the bulletin and QR-card features were added later.

## Try the complete journey

1. Open **500 / Studio**, load the clearly labelled example, then edit the station, headline and notice.
2. Choose **Save & tune in**. Your bulletin appears on **150** and stays on this device.
3. Choose **Copy share link**. Open it in another browser: the same bulletin appears as an unsaved shared copy. Select **Keep on this device** to retain it. A received copy never overwrites your saved page automatically.
4. Choose **QR & print card** to prepare a noticeboard card. Copy its exact link, save the QR image, or use **Print / Save PDF**. Loopback previews are labelled as local; use the published site to create cards for other devices. Very long notices retain link sharing when a readable QR cannot fit.
5. Wait for **Offline copy ready**, then disconnect and reopen the app. Read the saved bulletin, browse the archive, or write another notice.
6. Open **200 / Weather**. A successful Open-Meteo request saves a city-specific snapshot. On failure, a snapshot from the last 24 hours is explicitly labelled with its provider time and download age. Otherwise the page says unavailable.

**Edit this bulletin** starts an editable copy. Incomplete drafts recover after reopening when device storage is available; resetting the editor leaves the saved bulletin intact. The app warns before overwriting a bulletin changed in another tab, and checks again if it changes while confirmation is open. Finishing or resetting one editor preserves a different draft backed up by another tab. Saved-page viewers refresh when another tab saves; shared links retain their fixed copy. Plain page 150 opens the saved bulletin; a shared URL opens its own fixed copy, including after reload or browser Back.

Number keys + Enter, the channel index and four coloured Fasttext links all work. **Reading mode** enlarges information text and removes screen effects. Bulletins can be downloaded as plain text. No account, analytics, third-party fonts, API key, build step or package installation is required. The MIT-licensed QR encoder is bundled locally; see [THIRD_PARTY.md](THIRD_PARTY.md).

## Run and test

Requires Node.js 20+.

```sh
node server.mjs
node --test
```

Open http://127.0.0.1:4173/. `npm start`, `npm test` and `npm run check` are equivalent conveniences when npm is installed. To test the deployment path, set `BASE_PATH=/teleghost/` before starting the server (PowerShell: `$env:BASE_PATH='/teleghost/'`).

The 40 automated tests cover draft recovery, packet validation, storage failure, navigation, weather expiry, offline asset coverage, scope isolation, immutable share cards, loopback warnings and QR-size fallback. Independent ZXing decoding recovered exact links from normal, Unicode and maximum-ASCII fixtures, and from an actual browser screenshot. This pass also verified editing, saving, card rendering and copying its exact link.

**Verification still pending for v0.4:** the final card-toolbar adjustment, 320px/mobile checks, native print/PDF layout, QR download, cross-tab card stability and reopening the new QR feature with the server stopped. Earlier v0.3.1 offline and cross-tab checks do not verify this edition. The linked original video does not show these new features.

## Why resurrect this interface?

A club notice should not need an account, an algorithmic feed or an image-heavy page. The old three-digit directory is understandable; a small text page is easy to pass on and keep. TeleGhost combines that constraint with shareable browser links and local persistence. The current target audience and usefulness are a product hypothesis, not a claim of measured adoption.

## How it works

- `bulletin.mjs`: validates a versioned packet, wraps plain text at 40 characters, and serializes it into the URL fragment. The fragment is not sent in the HTTP request. Content is rendered as text, never HTML.
- `app.mjs`: navigation, editing, share/copy fallback, download, reading preference and weather UI.
- `share-card.mjs`: prepares a detached bulletin snapshot and a bounded, four-border-module QR image; `vendor/qrcodegen.mjs` is the attributed encoder. Card content is rendered with DOM text APIs.
- `draft.mjs`: a separate, bounded recovery slot for incomplete editor text, including the saved version on which editing began.
- `weather.mjs` + `weather-cache.mjs`: validated API conditions, then a separately validated local snapshot. Provider calls bypass the service worker.
- `sw.js` + `offline.mjs`: a versioned, deployment-scoped shell cache and truthful readiness status. Existing open tabs keep a coherent release; close all TeleGhost tabs and reopen to activate a new release.

A bulletin has a station name (24 characters), headline (40), body (480 / up to 16 wrapped lines) and creation time. Shared links hold **immutable copies**, not a synchronized feed. The current app keeps **one bulletin per browser origin**; saving another replaces that slot. A separate draft slot holds the latest backed-up editor contents. Multiple tabs share that slot; changes in another tab warn the current editor that its backup is no longer current. Browser storage may be unavailable or evicted. Text export is a portable backup. A QR/print card contains a fixed copy, even if another tab later changes the saved bulletin. QR generation stops at version 25 with at least medium error correction to bound density; longer valid notices still have complete share links. The first visit still needs a connection.

Anyone with a link can read or forward it; it is not encrypted or authenticated. Sender names and dates are self-declared. Do not use it for private information or as an emergency alerting system. No usage or performance improvements have been measured with real community users yet.

## Kiro's verified contribution

Kiro Web authored the initial service worker and offline status from story 4 of the project spec. For this edition, Kiro Web authored `weather-cache.mjs` and its ten tests from a bounded specification: exact city isolation, a 24-hour cutoff, future-time rejection, corruption handling and injected storage. Those two files were imported from Kiro's actual output and independently tested locally. Codex implemented the bulletin studio, sharing, UI integration and the other tests, and revised the worker's shell list.

See [.kiro/BUILD.md](.kiro/BUILD.md) for the concrete prompt, design decisions and attribution boundaries. The repository includes actual specs and steering; their presence alone is not presented as evidence of Kiro authorship. No claims are made about using Kiro hooks, MCP or Crew.

## Hosting and sources

GitHub Pages: **Deploy from a branch → main → / (root)**. HTTPS or localhost is required for service workers. Increment `VERSION` in `sw.js` whenever a shell asset changes. The shell coverage test prevents missing imported modules; it does not replace browser checks.

Weather data: [Open-Meteo](https://open-meteo.com/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Historical reference: [BBC history of Ceefax](https://www.bbc.com/historyofthebbc/anniversaries/september/ceefax/). No broadcaster assets are included. The example Night Owl Club event is fictional.

MIT — see [LICENSE](LICENSE). Built during Kiroween 2026 for **Resurrection**. 
