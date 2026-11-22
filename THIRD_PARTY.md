# Third-party code

`vendor/qrcodegen.mjs` is Project Nayuki's QR Code generator v1.8.0 (ES6), under the MIT license retained at the start of that file.

Source: https://github.com/nayuki/QR-Code-generator/releases/tag/v1.8.0
Original asset: `qrcodegen-v1.8.0-es6.js`
Original SHA-256: `6a1116192ed1dd67fa1bf31e77f5817103d71c23bbac24c382e698b7668bdd01`

The only modification is an appended ES-module export. The encoder is bundled locally and precached; no QR service or CDN receives bulletin content. This pre-existing library is not attributed to Kiro or to this project's author. All TeleGhost integration is newly authored for this project.
