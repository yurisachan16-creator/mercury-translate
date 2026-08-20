# Product Spec: Mercury Translate（水星翻译）

> **Status**: Active

Mercury Translate is a GPL-3.0 independent Chrome extension for readers who want bilingual web, subtitle, image and PDF translation without a Mercury-operated backend, telemetry, account, subscription or payment flow.

## Product contract

- Target Chrome desktop 151+ with WXT, Vue 3, TypeScript and Manifest V3.
- Preserve dynamic-DOM, Shadow DOM, selection, image and YouTube subtitle translation behavior.
- Provide a bundled PDF.js side-by-side reader with page-aligned translation, visible-page scheduling, cancellation, retries and native-viewer fallback.
- Use Chrome Translator API by default. Network providers require explicit user choice and never receive text through a silent fallback.
- Keep API keys and configuration in local extension storage; Mercury operates no relay, account, telemetry or subscription service.
- Support BYOK providers, including the existing `newapi` storage identity presented as OpenAI-compatible / Sub2API. Endpoint forms may be root, `/v1`, or `/v1/chat/completions`; model discovery is an explicit user action against `/v1/models` and never sends translation text.
- Force OpenAI-compatible / Sub2API translation requests through non-streaming Chat Completions. v0.1.2 does not support Responses API, real SSE streaming, Sub2API admin APIs or automatic protocol switching.
- Download version-pinned OCR packs for `eng`, `chi_sim`, `chi_tra`, `jpn` and `kor`, verify SHA-256 and store them locally. The pinned pack sizes are `eng` 4,113,088 bytes, `chi_sim` 2,469,156 bytes, `chi_tra` 2,366,642 bytes, `jpn` 2,471,260 bytes and `kor` 1,677,415 bytes.
- Produce free GitHub side-load and Chrome Web Store ZIP variants from `package.json`. v0.1.2 does not create a GitHub Release, tag, Chrome Web Store upload/submission, payment, translated-PDF export, or whole-document pretranslation.
- Keep daily product UI and ordinary help copy focused on Mercury identity. README and legal notice files retain the fixed upstream provenance and GPL/third-party license obligations.
- After v0.1.2 review, default-branch clean-history cutover requires a separate exact-SHA user confirmation. Future upstream syncs must be reviewed patches or squash commits, not merged upstream Git ancestry.

## Acceptance scenarios

- Local mode does not transmit webpage, subtitle or PDF text to third parties.
- Unsupported local language pairs ask before using any network provider.
- Text, scanned and mixed PDFs preserve the original page while translating only visible and adjacent pages.
- Dynamic pages, Shadow DOM, selection translation, restore-original and YouTube navigation do not regress.
- OCR packs are downloaded once, rejected on checksum failure and removable through cache controls.
- OpenAI-compatible / Sub2API model listing reads the locally stored endpoint and key in the background, returns only model descriptors, accepts manual model IDs when `/v1/models` is unsupported, and never logs or exports API keys by default.
- The clean-history candidate keeps old release tags recoverable and does not move `main` without a later explicit confirmation.
