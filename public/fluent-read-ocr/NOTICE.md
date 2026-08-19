Mercury Translate uses the following open-source OCR assets for local image text recognition:

- Tesseract.js 6.0.1, Apache-2.0
- tesseract.js-core 6.1.2, Apache-2.0
- tessdata_fast language data packages for eng, chi_sim, chi_tra, jpn, and kor, Apache-2.0

The worker and WebAssembly code are loaded from this extension's own resources.
Language data is pinned to tessdata_fast commit
87416418657359cb625c412a48b6e1d6d41c29bd, downloaded on demand from the
Mercury Translate GitHub Release (or the pinned upstream GitHub source for
local developer builds), verified with SHA-256, and cached in IndexedDB. No
page, image, or recognized text is sent with that asset download.
