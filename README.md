# TeleGhost — Teletext Reborn

TeleGhost brings the numbered pages of television Teletext to the web. It is an entry in the **Resurrection** category at **Kiroween 2026**.

## Run locally

Requires Node.js 20+; no dependencies, API keys, or build step.

```sh
npm start
```

Alternatively, run `node server.mjs` directly. Open **http://localhost:4173** in your browser. Run `node --test` to check navigation and weather response handling.

## Try it

- Type a three-digit page number and press Enter, pick a channel from the index, or use the arrow controls. Each channel has a shareable link.
- Open page **200** and select Oslo, London, or Tokyo. The weather display includes the model timestamp and units.
- Open page **300** for a short Teletext history. Once the footer shows **Offline copy ready**, the numbered pages can be reopened without a connection.
- Open page **400** for keyboard and touch controls.

## How Kiro was used

Kiro Web implemented the service worker and status display using the offline requirements in [the project spec](.kiro/specs/teleghost/requirements.md). The implementation precaches the app shell and scopes it to the TeleGhost deployment path. The weather request stays outside the offline cache.

The worker and status code live in [sw.js](sw.js) and [offline.mjs](offline.mjs). When you change any file listed in the app shell, increment `VERSION` in `sw.js` so existing browsers can pick up the update.

## Host the static app

The site can be hosted on GitHub Pages with **Deploy from a branch → main → / (root)**. Use HTTPS or localhost so the browser can register the service worker.

Weather model data is supplied by [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The archive references the [BBC history of Ceefax](https://www.bbc.com/historyofthebbc/anniversaries/september/ceefax/).

## License

MIT — see [LICENSE](LICENSE).
