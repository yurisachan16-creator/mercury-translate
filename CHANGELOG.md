# Changelog

## [0.1.2] - 2026-08-20

- Prepared the Mercury-only history candidate while keeping the existing repository URL, side-load extension key, archived pre-clean main ref, and existing release tags unchanged.
- Upgraded the existing `newapi` provider surface to "OpenAI-compatible / Sub2API" in documentation, with explicit endpoint normalization, model discovery, manual model fallback, non-streaming Chat Completions, and no automatic privacy-class switching.
- Refined product attribution boundaries: daily product/help/store copy presents Mercury identity, while README, NOTICE, GPL, and third-party notices retain required FluentRead provenance and license disclosures.
- Updated v0.1.2 release metadata, Sub2API privacy behavior, no-payment/no-store-submission boundaries, and measured OCR language pack sizes.

## [0.1.1] - 2026-08-20

- Added separate GitHub and Chrome Web Store release targets: the GitHub package preserves the existing extension ID, while the store package omits the fixed key for Chrome-managed updates.
- Added schema-versioned settings export, preview, backup, and import for one-time migration to the new store extension ID; credentials are excluded by default and require an explicit plaintext warning to include.
- Prepared the unlisted Chrome Web Store listing package with original Mercury icon, promo tile, five feature screenshots, and English/Simplified Chinese/Traditional Chinese listing copy.
- Added public three-language privacy pages for GitHub Pages hosting, covering local translation, network-service consent, OCR model downloads, PDF memory/cache behavior, and local API-key storage.
- Registered the `store-assets/` repo-harness capability and documented the manual CWS upload boundary: no payment, upload, declarations, telemetry, subscriptions, or store API automation are performed by the repository.
- Hardened release readback and settings transfer by validating exact fresh ZIP artifacts, reading manifests without archive extraction, expanding remote-code checks, and immediately hiding plaintext exports when the secret-inclusion choice changes.
- Recorded GPL provenance for the OnlyTranslate store-readiness structure reviewed at commit `3f5f16e8d94bc7f8f04add9264b804032c70d1b3`.

## [0.1.0] - 2026-08-19

- Renamed the project to Mercury Translate（水星翻译） with a new Mercury-and-bilingual-orbit identity.
- Added English, Simplified Chinese, and Traditional Chinese interface locale support.
- Made Chrome's on-device Translator API the default and removed silent network-provider fallback.
- Classified Microsoft/Bing and Google as consent-gated, best-effort network services; retained BYOK and local custom/Ollama providers.
- Added the Chrome 151+ side-by-side PDF reader with visible-page scheduling, local OCR, cancellation, cache controls, and native-viewer fallback.
- Added version-pinned, SHA-256-verified OCR models for English, Simplified/Traditional Chinese, Japanese, and Korean.

Named upstream provenance and third-party notices are maintained in README,
NOTICE, LICENSE, and THIRD_PARTY_NOTICES. The combined project remains GPL-3.0.

[0.1.0]: https://github.com/yurisachan16-creator/mercury-translate/releases/tag/v0.1.0
[0.1.1]: https://github.com/yurisachan16-creator/mercury-translate/releases/tag/v0.1.1
[0.1.2]: https://github.com/yurisachan16-creator/mercury-translate/releases/tag/v0.1.2
