# Requirements

## 1. Tune in
- Visitors navigate by three digits + Enter, channel links, keyboard arrows and Fasttext shortcuts.
- Invalid links recover safely; typing inside form fields never triggers global navigation.
- Touch targets, labelled fields, visible focus and polite page announcements are available.

## 2. Make a pocket bulletin
- A club organiser can write a station name, headline and plain-text notice on page 500.
- Show Unicode character and wrapped-line budgets and a preview before saving.
- Recover incomplete editor drafts from a separate device-storage slot; report backup failures or changes from other tabs.
- Provide explicit editing and reset actions; confirm replacement of drafts or a concurrently changed saved bulletin.
- Preview URLs survive reloading; plain page 150 opens the saved bulletin while browser Back restores the shared copy.
- Saving opens page 150; storage failure is reported without claiming success.
- A visitor can view/share/download without local storage being available.
- Example content is clearly identified as fictional until the visitor chooses to edit/save it.

## 3. Pass it on
- A versioned packet in the URL fragment reconstructs the exact bulletin without a publishing backend.
- Bound and validate untrusted inputs; render user text as text, not executable markup.
- Received bulletins are not persisted automatically. Replacing an existing saved page requires a deliberate action.
- Explain that anyone holding the link can read it, and edits require sharing a new link.
- Prepare a printable noticeboard card and locally generated QR for a fixed copy; cap QR density and preserve link sharing for larger notices.
- Label loopback cards as local previews. Wait for the QR image before opening print. Copying/printing an open card must retain its selected snapshot.
- Export a readable text copy; clipboard denial provides a selectable manual-copy field.

## 4. Keep the signal
- Cache the shell under its deployment scope, including every imported browser module.
- A saved bulletin and static pages reopen when the app server is unreachable after initial caching.
- Weather stays outside the service-worker cache. Separately save validated city snapshots for at most 24 hours.
- Failed fetches show a dated SAVED SNAPSHOT or unavailable; never fabricate live conditions.
- Kiro's snapshot module rejects corrupted data, unsupported cities, future timestamps and denied storage.

## 5. Read comfortably
- Reading mode enlarges content and removes screen effects; respect reduced motion.
- On narrow screens, open numbered pages directly at their content, keeping the introductory hero on page 100.
- Keep offline readiness beside the terminal controls.
- Support narrow screens without horizontal overflow, and support ordinary browser back/forward.
- Explain first-visit connectivity, immutable copies, one saved slot and browser-storage limitations.

Finishing or resetting an editor must preserve a different draft backed up by another tab. Saving after confirmation must recheck whether the saved copy changed during the dialog and ask again if necessary. Saved-page viewers follow other-tab saves; shared copies remain fixed.
