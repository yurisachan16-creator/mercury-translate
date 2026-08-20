# Chrome Web Store privacy and permission declarations

Use this file as the reviewed source of truth when completing the Chrome Web Store dashboard. The dashboard remains a manual owner-confirmed step. Do not submit, accept declarations, or make a payment through automation.

## Single purpose

> Mercury Translate translates webpages, selected text, YouTube subtitles, images, and PDF documents in the browser, using either local translation or a translation provider explicitly chosen by the user.

## Permission justifications

### `storage`

> Stores extension settings, language choices, provider configuration, network-consent decisions, OCR model metadata, and optional translation cache data. API keys are stored only in `chrome.storage.local`, are never synchronized, and are excluded from settings exports by default.

### `alarms`

> Runs periodic local cleanup of expired translation cache entries. It does not schedule network requests, analytics, advertising, or background uploads.

### `contextMenus`

> Adds user-invoked commands for translating or restoring a webpage and translating selected text.

### `offscreen`

> Provides the extension-owned document context required by Chrome's local Translator API and the locally packaged OCR worker. It is not used for advertising, tracking, audio capture, or hidden browsing.

### Content scripts on `<all_urls>`

> Enables the core user-facing translation controls and bilingual rendering on ordinary webpages, including dynamically updated pages, Shadow DOM content, selections, and supported YouTube pages. Page content is processed only when a configured translation action or feature requires it. Local mode does not send text to a third party.

### Optional host access (`http://*/*`, `https://*/*`)

> Host access is optional and is requested only after a user selects a network translation provider, custom endpoint, OCR source, or image that requires that origin. The extension does not receive blanket host access at installation. Denying the request leaves local features available and prevents that network operation.

> For OpenAI-compatible / Sub2API endpoints, host access is requested for the configured endpoint origin only. Clicking the model-fetch action requests `/v1/models` without translation text. Translation text is sent only after the user starts translation, through non-streaming `/v1/chat/completions`.

### Web-accessible resources

> Makes only packaged interface icons and the packaged content-script stylesheet available to pages so the translation controls can render correctly. These resources contain no user data and execute no remote code.

### PDF MIME handler

> Opens `application/pdf` responses in Mercury's packaged PDF reader so the user can view the original pages beside translated text. Original PDF bytes remain in memory and are not uploaded to a Mercury backend.

### `wasm-unsafe-eval` content security policy

> Allows the locally packaged PDF.js and Tesseract OCR WebAssembly components to run. No executable JavaScript or WebAssembly is downloaded from the network.

## Remote code declaration

Select **No, I am not using remote code**.

> All executable JavaScript, WebAssembly, PDF.js, and Tesseract worker code is packaged inside the extension ZIP. The extension does not use remote script tags, remote dynamic imports, `eval` of downloaded code, or remotely hosted workers. OCR `traineddata` language models are non-executable data files downloaded on demand from pinned GitHub Release assets, verified against bundled SHA-256 values, and stored locally. Current pinned sizes are `eng` 4,113,088 bytes, `chi_sim` 2,469,156 bytes, `chi_tra` 2,366,642 bytes, `jpn` 2,471,260 bytes, and `kor` 1,677,415 bytes.

## Data-use answers

Use the dashboard's current wording, with these reviewed facts:

- Website content: **Yes, only to provide translation/OCR requested or configured by the user.** This can include webpage text, selected text, subtitles, image-derived text, and extracted PDF text.
- Authentication information: **Yes, only when the user enters a provider API key.** Keys remain in `chrome.storage.local`; Mercury has no account system or backend.
- Personal communications, location, web history, user activity, financial information, health information, and personally identifiable information: **Not intentionally collected by Mercury.** Text a user chooses to translate may incidentally contain such information, so it must be treated as website content and is sent only according to the selected provider boundary.
- Analytics, telemetry, advertising, profiling, and sale of data: **None.**
- Human access by Mercury: **None.** Mercury has no server that receives translation content, API keys, PDFs, or caches.
- Data transfer: local translation stays on-device. When the user explicitly chooses a network provider, the requested text is sent directly from the extension to that provider and is governed by that provider's terms.
- Limited use: data is used only to provide or improve the extension's user-facing translation operation, never for advertising, creditworthiness, lending, or sale to third parties.

## Store settings

- Visibility: **Unlisted**
- Category: **Productivity**
- Regions: **All available regions**
- In-app purchases: **No**
- Ads: **No**
- Telemetry: **No**
- Privacy policy URL: `https://yurisachan16-creator.github.io/mercury-translate/privacy/`
- Homepage: `https://github.com/yurisachan16-creator/mercury-translate`
- Support: `https://github.com/yurisachan16-creator/mercury-translate/issues`

## Owner-only final verification

Before accepting the dashboard declarations, compare the generated store ZIP manifest and current Chrome Web Store questions with this file. Stop if the dashboard asks for a materially different claim. The repository owner must personally confirm the privacy declarations and the final review submission.
