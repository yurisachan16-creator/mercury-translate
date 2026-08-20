# Chrome Web Store 上架文案（繁體中文）

更新日期：2026-08-20

## 名稱

```text
Mercury Translate
```

## 簡短說明

```text
本地優先的網頁、YouTube 字幕、圖片和 PDF 雙語翻譯擴充功能。
```

## 詳細說明

```text
Mercury Translate（水星翻譯）是一款面向 Chrome 桌面版的開源雙語閱讀擴充功能。

它不會把你帶離原網頁，而是在閱讀位置呈現譯文：文章段落旁、影片字幕下、PDF 頁面右側，或圖片文字上方。

核心功能：

1. 網頁雙語閱讀
- 在文章頁和動態網頁內直接翻譯
- 原文與譯文同時保留，適合對照閱讀
- 不需要時可以恢復原文
- 在 Chrome 允許擴充功能存取的範圍內支援一般頁面、富文字和開放 Shadow DOM 內容

2. YouTube 雙語字幕
- 同時顯示原字幕和譯文字幕
- 沿用網頁翻譯相同的服務商與隱私規則
- 頁面導覽、播放和重試互不串擾

3. Chrome 151+ PDF 雙欄閱讀器
- 支援的 PDF 會進入左原文、右譯文的閱讀器
- 左側保留原始 PDF 頁面，右側按頁顯示譯文區塊
- 只處理可視頁和相鄰頁，不在首版預先翻譯整本
- 密碼、損壞或不支援的 PDF 會回到 Chrome 原生閱讀器

4. 圖片 OCR 與翻譯
- 辨識圖片或掃描 PDF 頁面中的文字
- OCR 使用隨擴充功能打包的本地 Worker，並校驗語言模型後使用
- 首批 OCR 語言：英文、簡體中文、繁體中文、日文、韓文

5. 翻譯服務由你選擇
- 預設：Chrome 本地 Translator API（語言組合可用時）
- 本地選項：你自己的 Ollama
- 聯網選項：Google、Microsoft/Bing、DeepSeek、Gemini、OpenAI/GPT、OpenAI 相容 / Sub2API 自訂端點，以及預設關閉的實驗 DeepLX

隱私與費用：

- Mercury Translate 沒有帳號、沒有 Mercury 後端、沒有遙測、沒有廣告、沒有訂閱。
- 本地翻譯只指 Chrome Translator 或你自己的 Ollama。Google、Microsoft/Bing 和 BYOK 雲端服務都屬於聯網服務。
- 當本地翻譯不可用時，擴充功能會先詢問，不會靜默把文字送給聯網服務。
- API Key 僅保存在 chrome.storage.local，不同步、不寫入日誌、不傳送給 Mercury。
- PDF 原始位元組只駐留記憶體。可選 PDF 快取保存譯文和雜湊，不保存原 PDF。
- OCR 語言模型可能從固定 GitHub Release 資產下載，校驗通過後才在本地使用。
- OpenAI 相容 / Sub2API 只有在你點擊取得模型時請求 `/v1/models`；翻譯文字只會在你主動開始翻譯時傳送。

Mercury Translate 是獨立 GPL-3.0 專案，不代表 Google、Microsoft、OpenAI、Gemini、DeepSeek、Ollama、PDF.js、Tesseract.js 或其他服務商的官方背書。
```

## 截圖標題

```text
01 不離開網頁的雙語閱讀
02 YouTube 原字幕與譯文同屏
03 左側原始 PDF，右側對應譯文
04 圖片文字與掃描頁本地 OCR
05 本地、聯網和自帶密鑰邊界清楚
```
