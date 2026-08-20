# Third-party notices

Mercury Translate is an independent GPL-3.0 fork of
[FluentRead](https://github.com/FluentRead/FluentRead), initially based on
commit `f91543c6b6b76f3c5d6343b47a82e431acfa648a`. Upstream copyright and
license notices are retained in the source history and `LICENSE` file.

The distributable extension also includes or downloads the following major
components. Their inclusion does not change Mercury Translate's GPL-3.0 terms.

| Component | License | Use |
| --- | --- | --- |
| `@element-plus/icons-vue` 2.3.1 | MIT | User-interface icons |
| `@wxt-dev/storage` 1.0.1 | MIT | Typed extension-local storage |
| `@wxt-dev/webextension-polyfill` 1.0.0 | MIT | WXT browser API adapter bundled at build time |
| CryptoJS 4.2.0 | MIT | Provider request signing and hashes |
| Defuddle 0.19.2 | MIT | Local readable-page extraction |
| Dexie 4.4.5 | Apache-2.0 | IndexedDB cache and OCR asset storage |
| Element Plus 2.9.3 | MIT | User-interface components |
| `franc-min` 6.2.0 | MIT | Local language detection |
| PDF.js / `pdfjs-dist` 6.2.108 | Apache-2.0 | Local PDF parsing and rendering |
| Tesseract.js 6.0.1 | Apache-2.0 | Local OCR orchestration |
| tesseract.js-core 6.1.2 | Apache-2.0 | Packaged OCR WebAssembly runtime |
| tessdata_fast language models | Apache-2.0 | English, Simplified/Traditional Chinese, Japanese, Korean OCR |
| Vue 3.5.13 | MIT | User interface |
| Vue I18n 11.4.8 | MIT | User-interface localization |
| `webextension-polyfill` 0.12.0 | MPL-2.0 | Promise-based browser API compatibility; Mercury does not modify its source files |
| WXT 0.20.18 | MIT | Browser-extension build framework |

OCR language models are pinned to `tesseract-ocr/tessdata_fast` commit
`87416418657359cb625c412a48b6e1d6d41c29bd`. Release builds publish those
exact files as version assets; the extension verifies their SHA-256 digest
before storing or executing OCR with them.

Complete transitive dependency versions and license texts are available from
`pnpm-lock.yaml` and the linked upstream packages.

`webextension-polyfill` remains available in source form from Mozilla at
<https://github.com/mozilla/webextension-polyfill> under MPL-2.0. Mercury
bundles it as part of a Larger Work and does not modify its covered source
files.

## Store-readiness template provenance

Mercury Translate v0.1.1 reviewed the Chrome Web Store asset/checklist layout
from [OnlyTranslate](https://github.com/airhunter/OnlyTranslate) commit
`3f5f16e8d94bc7f8f04add9264b804032c70d1b3` as a GPL-3.0 reference. Mercury
adapts the structure only. It does not copy OnlyTranslate artwork, publisher
identity, store IDs, screenshots, reviews, privacy claims, telemetry hooks,
Discord links, payment logic, or deprecated Chrome API v1 upload scripts.
