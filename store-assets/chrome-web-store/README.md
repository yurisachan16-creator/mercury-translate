# Chrome Web Store assets

This directory contains the free, manual Chrome Web Store listing package for Mercury Translate v0.1.2. It follows the proven asset/checklist structure reviewed from OnlyTranslate commit `3f5f16e8d94bc7f8f04add9264b804032c70d1b3`, but all Mercury text, visuals, privacy claims, identifiers, and upload instructions are original to this project.

No Chrome Web Store API key, service account, automated upload, payment step, telemetry, or paid service is used by this directory. The only possible cost remains the Chrome Web Store developer registration fee, paid manually by the repository owner outside automation.

## Required listing files

| Asset | Path | Required size |
| --- | --- | --- |
| Store icon | `icon-128.png` | 128 x 128 |
| Small promo tile | `small-promo-tile.png` | 440 x 280 |
| Screenshot 1 | `screenshots/01-webpage-bilingual.png` | 1280 x 800 |
| Screenshot 2 | `screenshots/02-youtube-subtitles.png` | 1280 x 800 |
| Screenshot 3 | `screenshots/03-pdf-reader.png` | 1280 x 800 |
| Screenshot 4 | `screenshots/04-image-ocr.png` | 1280 x 800 |
| Screenshot 5 | `screenshots/05-services-privacy.png` | 1280 x 800 |

Tracked sources live in `source/`:

- `source/icon-128.svg` renders `icon-128.png`.
- `source/render.html` and `source/listing.css` render `small-promo-tile.png` and the five screenshots.
- `source/asset-notes.md` documents the generated Mercury visual source.
- `store-assets/scripts/generate-chrome-web-store-assets.mjs` contains the output map, local renderer, and dimension checker.

Regenerate and check locally:

```bash
node store-assets/scripts/generate-chrome-web-store-assets.mjs
node store-assets/scripts/generate-chrome-web-store-assets.mjs --check
```

## Localized listing copy

- English: `listing.en.md`
- Simplified Chinese: `listing.zh-CN.md`
- Traditional Chinese: `listing.zh-TW.md`
- Dashboard privacy and permission answers: `privacy-declarations.md`

Use visibility `Unlisted`, category `Productivity`, all available regions, no in-app purchases, no ads, and no telemetry. Homepage URL should point to the public GitHub repository. Support URL should point to GitHub Issues. Privacy Policy URL should point to the published GitHub Pages privacy page.

## Manual upload checklist

- [ ] Build the store package with the release workflow. It must be the keyless `mercury-translate-v0.1.2-chrome-web-store.zip`.
- [ ] Confirm the GitHub sideload ZIP still keeps the fixed public key and old extension ID.
- [ ] Upload only the keyless Chrome Web Store ZIP in Chrome Developer Dashboard.
- [ ] Upload `icon-128.png`, `small-promo-tile.png`, and the five screenshots in the order listed above.
- [ ] Paste the localized listing text for `en`, `zh-CN`, and `zh-TW`.
- [ ] Review and paste the permission, remote-code, and data-use answers from `privacy-declarations.md`.
- [ ] Set visibility to Unlisted and do not enable paid features, subscriptions, ads, or telemetry.
- [ ] Confirm data-use declarations match `docs/privacy/`.
- [ ] Stop before final review submission unless the repository owner explicitly confirms that dashboard step.

## Provenance

OnlyTranslate's store directory shape and release checklist were reviewed as a GPL-3.0 template. Mercury does not copy OnlyTranslate artwork, publisher identity, store item IDs, screenshots, review history, privacy claims, telemetry hooks, Discord links, payment logic, or deprecated Chrome API v1 upload scripts.
