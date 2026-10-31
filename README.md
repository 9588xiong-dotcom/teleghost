# TeleGhost — Teletext Reborn

An accessible, keyboard-first revival of the 1980s Teletext experience, designed as a new entry for the **Resurrection** category at **Kiroween 2026**.

## Run locally

Requires Node.js 20+; no dependencies, API keys, or build step.

```sh
npm start
```

Alternatively, run `node server.mjs` directly when `npm` is not installed. Open **http://localhost:4173** in your browser. Run `node --test` for the core navigation tests.

## Starter features

- Navigate by entering a three-digit page number, clicking a channel, or using previous/next controls.
- Keyboard controls: `0`–`9` to enter a page, `Enter` to open it, `Escape` to cancel, and `ArrowLeft`/`ArrowRight` to move between pages.
- Responsive Teletext-inspired interface, live local clock, accessible status announcements, reduced-motion support.
- Home, news, technology, weather, archive and help pages with **clearly labeled demo content**.

**Current status:** This is a working, locally runnable starter. News and weather are sample data, and hosting is not configured. The project is **not yet ready for Devpost submission**.

## What to build with Kiro

Open the project in Kiro and use the specs under `.kiro/specs/teleghost/`. Implement the next tasks with Kiro and capture a truthful account of the Kiro features you actually use. Suggested features:

1. Secure server-side RSS ingestion with attribution, caching and graceful fallback.
2. Real weather for a user-selected city, with source, timestamp and units.
3. Offline-first support, settings persistence, automated tests and accessible interaction.
4. Public deployment, screenshots, sub-3-minute demo video and documented Kiro workflow.

## Submission checklist

The competition requires a newly developed working app using Kiro, a public GitHub repository with an open source license and `.kiro/` at its root, a hosted working app URL, a short public YouTube demo video, and a write-up of how Kiro was used. Verify all current rules at [Kiroween on Devpost](https://kiroween.devpost.com/rules).

The `.kiro/` directory in this starter contains **planned** specs. Its presence alone is not evidence that Kiro was used to build the application. Continue meaningful development inside Kiro before entering.

## Publish to GitHub

1. Sign in to GitHub and create a new **public** repository named `teleghost` at <https://github.com/new>. Leave the auto-generated README, license and `.gitignore` options unchecked.
2. From this project folder, run:

```sh
git remote add origin https://github.com/YOUR_USERNAME/teleghost.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username. Git may ask you to authenticate with GitHub. The repository is already initialized locally with an initial commit, and `.kiro/` is tracked.

## License

MIT — see [LICENSE](LICENSE).
