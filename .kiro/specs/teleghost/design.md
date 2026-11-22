# Design

Static browser modules with one bundled MIT QR encoder hosted under `/teleghost/`. Keep all asset URLs relative. HTML and CSS preserve the numbered terminal, with accessible native controls outside and inside it.

## Data flow

Studio -> bounded draft recovery slot (including original saved version) -> validate plain-text packet -> saved bulletin slot -> page 150.
Preview -> packet URL; shared URLs reconstruct their own copy, while ordinary page 150 resolves device storage.
Use a native HTML dialog for deliberate replacements. A storage event invalidates the editor backup indicator when another tab changes the draft slot.
Page 150 -> UTF-8 / base64url fragment -> receiver validates -> explicit save.
Open-Meteo -> strict response validation -> Kiro snapshot module -> labelled fallback on failure.
Service worker -> scoped exact shell assets only -> offline navigation.

The packet schema is v1 plus station/title/body/created. Bound input before decoding. Never use innerHTML for bulletin content. The share URL has no query payload, keeping it out of normal HTTP requests. It is still readable by anyone holding the link; no privacy/authenticity promise is made.

The shell waits to activate until previous tabs close, preventing mixed-release modules. Add every module to the shell and bump the worker version when changing it. Cache scope includes the deployment path. Do not cache the weather API or other applications.

One saved bulletin is an intentional compact scope. No server synchronization, accounts, analytics or background notifications. A text export is independent of browser storage. The no-storage view still supports sharing and export.

Draft cleanup compares the stored backup with the editor's last successful backup and leaves a different backup untouched. Replacement saves capture the selected candidate before awaiting confirmation and recheck the saved fingerprint after each dialog. Storage events refresh ordinary saved-page viewers without replacing shared-copy views or dirty editor text.

Share-card flow: validate and detach the current bulletin -> same v1 share URL -> bounded QR -> modal with inert text nodes. Keep that snapshot separate from live saved-page updates. A temporary SVG Blob URL is released on close; downloads own a separate Blob URL. Print waits for image decoding and confirms that the selected card is still open. Offline caching includes the card module and vendor encoder.
