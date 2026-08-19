# Third-party notices

Mercury Translate is an independent GPL-3.0 fork of
[FluentRead](https://github.com/FluentRead/FluentRead), initially based on
commit `f91543c6b6b76f3c5d6343b47a82e431acfa648a`. Upstream copyright and
license notices are retained in the source history and `LICENSE` file.

The distributable extension also includes or downloads the following major
components. Their inclusion does not change Mercury Translate's GPL-3.0 terms.

| Component | License | Use |
| --- | --- | --- |
| PDF.js / `pdfjs-dist` 6.2.108 | Apache-2.0 | Local PDF parsing and rendering |
| Tesseract.js 6.0.1 | Apache-2.0 | Local OCR orchestration |
| tesseract.js-core 6.1.2 | Apache-2.0 | Packaged OCR WebAssembly runtime |
| tessdata_fast language models | Apache-2.0 | English, Simplified/Traditional Chinese, Japanese, Korean OCR |
| Vue 3 | MIT | User interface |
| Vue I18n 11.4.8 | MIT | User-interface localization |
| WXT 0.20.18 | MIT | Browser-extension build framework |

OCR language models are pinned to `tesseract-ocr/tessdata_fast` commit
`87416418657359cb625c412a48b6e1d6d41c29bd`. Release builds publish those
exact files as version assets; the extension verifies their SHA-256 digest
before storing or executing OCR with them.

Complete transitive dependency versions and license texts are available from
`pnpm-lock.yaml` and the linked upstream packages.
