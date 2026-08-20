# 隱私權政策

更新日期：2026-08-20

Mercury Translate 沒有帳號系統、後端服務、遙測、廣告、訂閱或付款功能。擴充功能會依你選擇的服務商處理網頁、字幕、圖片和 PDF 文字。

本地翻譯只指 Chrome Translator API 或你自己的 Ollama 端點。Google、Microsoft/Bing、DeepSeek、Gemini、OpenAI/GPT、OpenAI 相容 / Sub2API 端點與實驗 DeepLX 都是聯網服務。當本地翻譯不可用時，Mercury 會先詢問，才會把文字送到聯網服務。

OpenAI 相容 / Sub2API 的模型探索只會在你點擊取得模型時請求 `/v1/models`，不會包含網頁、字幕、圖片或 PDF 文字。翻譯文字只會在你主動開始翻譯後，透過非串流 `/v1/chat/completions` 傳送。

API Key 只保存在 `chrome.storage.local`。設定匯出預設排除密鑰；只有在你明確確認明文警告後，遷移檔才會包含密鑰。

PDF 原始位元組只保留在記憶體中。可選快取保存譯文和雜湊，不保存原始 PDF。OCR 語言模型會按需從固定 Release 資產下載，通過 SHA-256 校驗後才快取到本機。目前固定大小為：`eng` 4,113,088 位元組、`chi_sim` 2,469,156 位元組、`chi_tra` 2,366,642 位元組、`jpn` 2,471,260 位元組、`kor` 1,677,415 位元組。

Mercury Translate 不出售資料，也不向 Mercury 後端傳送分析資料。你選擇的聯網服務商會依其自身條款處理提交的文字。
