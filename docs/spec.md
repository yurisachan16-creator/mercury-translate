# Product Spec: Mercury Translate（水星翻译）

> **Status**: Active

Mercury Translate is a GPL-3.0, independent and unofficial FluentRead-based Chrome extension for readers who want bilingual web, subtitle, image and PDF translation without a Mercury-operated backend or subscription.

## Product contract

- Target Chrome desktop 151+ with WXT, Vue 3, TypeScript and Manifest V3.
- Preserve dynamic-DOM, Shadow DOM, selection, image and YouTube subtitle translation behavior.
- Provide a bundled PDF.js side-by-side reader with page-aligned translation, visible-page scheduling, cancellation, retries and native-viewer fallback.
- Use Chrome Translator API by default. Network providers require explicit user choice and never receive text through a silent fallback.
- Keep API keys and configuration in local extension storage; Mercury operates no relay, account, telemetry or subscription service.
- Download version-pinned OCR packs for `eng`, `chi_sim`, `chi_tra`, `jpn` and `kor`, verify SHA-256 and store them locally.
- Publish GitHub Release ZIPs only. v0.1 excludes translated-PDF export, whole-document pretranslation and browser stores.

## Acceptance scenarios

- Local mode does not transmit webpage, subtitle or PDF text to third parties.
- Unsupported local language pairs ask before using any network provider.
- Text, scanned and mixed PDFs preserve the original page while translating only visible and adjacent pages.
- Dynamic pages, Shadow DOM, selection translation, restore-original and YouTube navigation do not regress.
- OCR packs are downloaded once, rejected on checksum failure and removable through cache controls.
