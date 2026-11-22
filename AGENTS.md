## Gotchas

- Old pages after deployment -> Service worker waits for existing tabs -> Close all TeleGhost tabs and reopen.

## State

- TeleGhost is a Kiroween 2026 Resurrection entry for community bulletins. Real-user usefulness remains unvalidated.
- Kiro Web supplied the initial offline worker/status and weather-cache module/tests; Codex implemented the bulletin and card features. Details: .kiro/BUILD.md.
- v0.4 has 40 passing Node tests; native printing, QR download, cross-tab card stability and server-stopped reopening of card assets remain to be checked. The original public demo shows v0.1.
