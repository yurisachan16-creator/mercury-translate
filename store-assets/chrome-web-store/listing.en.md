# Chrome Web Store listing (English)

Updated: 2026-08-20

## Name

```text
Mercury Translate
```

## Short description

```text
Local-first bilingual translation for webpages, YouTube captions, images, and PDFs.
```

## Long description

```text
Mercury Translate is an open-source bilingual reading extension for Chrome desktop.

It keeps the original page in front of you and places translations where they are useful: next to article paragraphs, under video captions, beside PDF pages, or over text found in images.

Core features:

1. Bilingual webpage reading
- Translate article pages and dynamic webpages in place
- Keep original text visible for side-by-side reading
- Restore the original page when you no longer need translation
- Works with normal pages, rich text, and open Shadow DOM content where Chrome allows extension access

2. YouTube bilingual captions
- Display original captions and translated captions together
- Reuse the same provider and privacy rules as webpage translation
- Keep navigation and playback independent from translation retries

3. PDF bilingual reader for Chrome 151+
- Open supported PDF files in a two-column reader
- Keep the original PDF page on the left and translated text blocks on the right
- Process visible pages and nearby pages instead of pre-translating a whole document
- Fall back to Chrome's native PDF viewer for damaged, password-protected, or unsupported files

4. Image OCR and translation
- Recognize text in selected images or scanned PDF pages
- OCR runs locally with packaged workers and checked language models
- Supported first-wave OCR languages: English, Simplified Chinese, Traditional Chinese, Japanese, and Korean

5. Translation services under your control
- Default: Chrome's on-device Translator API when the language pair is available
- Local option: your own Ollama endpoint
- Network options: Google, Microsoft/Bing, DeepSeek, Gemini, OpenAI/GPT, OpenAI-compatible endpoints, and experimental DeepLX

Privacy and costs:

- Mercury Translate has no account system, no Mercury backend, no telemetry, no ads, and no subscription.
- Local translation means Chrome Translator or your own Ollama. Google, Microsoft/Bing, and BYOK cloud providers are network services.
- When local translation is unavailable, Mercury asks before sending text to a network service.
- API keys are stored only in chrome.storage.local and are not synced, logged, or sent to Mercury.
- PDF bytes stay in memory. The optional PDF translation cache stores translated text and hashes, not the original PDF.
- OCR language models may be downloaded from fixed GitHub Release assets and verified before local use.

Mercury Translate is an independent GPL-3.0 project based on FluentRead. It is not affiliated with or endorsed by FluentRead, Google, Microsoft, OpenAI, Gemini, DeepSeek, Ollama, PDF.js, or Tesseract.js.
```

## Screenshot captions

```text
01 Bilingual webpages without leaving the page
02 YouTube captions with original and translated text
03 PDF pages on the left, translated blocks on the right
04 Local OCR for image text and scanned pages
05 Clear local, network, and bring-your-own-key boundaries
```
