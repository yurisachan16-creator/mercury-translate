<div align="center">

<img src="./public/icon/128.png" alt="Mercury Translate logo" width="96" />

# Mercury Translate

### 水星翻译 · Local-first bilingual reading for the open web

[![Version](https://img.shields.io/badge/version-0.1.0-f59e0b?style=flat-square)](../../releases)
[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0-22a06b?style=flat-square)](./LICENSE)
[![Chrome](https://img.shields.io/badge/Chrome-151%2B-4285F4?style=flat-square)](https://www.google.com/chrome/)

</div>

Mercury Translate is an open-source browser extension for bilingual webpages,
selection translation, YouTube subtitles, image OCR, and side-by-side PDF
reading. It has no Mercury backend, account, subscription, or telemetry.

Mercury Translate（水星翻译）是一款本地优先的开源双语阅读扩展，支持网页、划词、
YouTube 字幕、图片 OCR 和 PDF 原页/译文对照。项目不运营中转服务器，也不需要账号或订阅。

## Highlights / 主要能力

- **Webpages** — incremental bilingual translation for dynamic pages and open Shadow DOM.
- **Selection and images** — translate selected text, screenshots, and image text.
- **YouTube** — bilingual captions with independent provider selection.
- **PDF** — Chrome 151+ PDF handler with the original page on the left and translated blocks on the right.
- **Local first** — Chrome Translator is the default. Network providers are never selected as an implicit fallback.
- **Bring your own key** — OpenAI/GPT, DeepSeek, Gemini, OpenAI-compatible endpoints, and local Ollama remain available.
- **International UI** — English, Simplified Chinese, and Traditional Chinese; OCR packs cover English, Simplified/Traditional Chinese, Japanese, and Korean.

Google and Microsoft/Bing are network services. If the local Chrome model cannot
handle a language pair, Mercury Translate asks before sending text to one of
them. See the [privacy policy](./docs/guide/privacy-policy.md) for the exact data
boundaries.

## Install from GitHub / 从 GitHub 安装

1. Download the Chrome ZIP from [GitHub Releases](../../releases).
2. Extract it to a stable directory.
3. Open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**,
   and select the extracted directory.
4. Future release ZIPs use the same public extension key so replacing the files
   and reloading preserves the extension ID and local settings.

The first use of an OCR language may download a version-pinned, checksummed
language model. Recognition happens locally after that download. Chrome may also
download its own Translator model for a new language pair.

## Development

```bash
pnpm install --frozen-lockfile
pnpm compile
pnpm test
pnpm build
pnpm zip
```

The unpacked Chrome build is written to `.output/chrome-mv3`. The project uses
WXT 0.20, Vue 3, TypeScript, PDF.js, Tesseract.js, and Manifest V3.

## Upstream and license

Mercury Translate is an independent, unofficial fork of
[FluentRead](https://github.com/FluentRead/FluentRead), initially based on commit
[`f91543c`](https://github.com/FluentRead/FluentRead/commit/f91543c6b6b76f3c5d6343b47a82e431acfa648a).
It is not endorsed by or affiliated with the FluentRead maintainers.

The combined work is distributed under [GPL-3.0](./LICENSE). PDF.js is
Apache-2.0, and the packaged Tesseract.js components retain their respective
Apache-2.0/MIT notices. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
