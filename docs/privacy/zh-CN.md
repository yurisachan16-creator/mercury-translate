# 隐私政策

更新日期：2026-08-20

Mercury Translate 没有账号系统、后端服务、遥测、广告、订阅或付款功能。扩展会按照你选择的服务商处理网页、字幕、图片和 PDF 文本。

本地翻译只指 Chrome Translator API 或你自己的 Ollama 端点。Google、Microsoft/Bing、DeepSeek、Gemini、OpenAI/GPT、OpenAI 兼容 / Sub2API 端点与实验 DeepLX 都是联网服务。当本地翻译不可用时，Mercury 会先询问，才会把文本发送到联网服务。

OpenAI 兼容 / Sub2API 的模型发现只会在你点击获取模型时请求 `/v1/models`，不会包含网页、字幕、图片或 PDF 文本。翻译文本只会在你主动开始翻译后，通过非流式 `/v1/chat/completions` 发送。

API Key 只保存在 `chrome.storage.local`。设置导出默认排除密钥；只有在你明确确认明文警告后，迁移文件才会包含密钥。

PDF 原始字节只保留在内存中。可选缓存保存译文和哈希，不保存原始 PDF。OCR 语言模型会按需从固定 Release 资产下载，通过 SHA-256 校验后才缓存到本地。当前固定大小为：`eng` 4,113,088 字节、`chi_sim` 2,469,156 字节、`chi_tra` 2,366,642 字节、`jpn` 2,471,260 字节、`kor` 1,677,415 字节。

Mercury Translate 不出售数据，也不向 Mercury 后端发送分析数据。你选择的联网服务商会按照其自身条款处理提交的文本。
