# 隐私政策

更新日期：2026-08-20

Mercury Translate 没有账号系统、后端服务、遥测、广告、订阅或付款功能。扩展会按照你选择的服务商处理网页、字幕、图片和 PDF 文本。

本地翻译只指 Chrome Translator API 或你自己的 Ollama 端点。Google、Microsoft/Bing、DeepSeek、Gemini、OpenAI/GPT、OpenAI-compatible 端点与实验 DeepLX 都是联网服务。当本地翻译不可用时，Mercury 会先询问，才会把文本发送到联网服务。

API Key 只保存在 `chrome.storage.local`。设置导出默认排除密钥；只有在你明确确认明文警告后，迁移文件才会包含密钥。

PDF 原始字节只保留在内存中。可选缓存保存译文和哈希，不保存原始 PDF。OCR 语言模型会按需从固定 Release 资产下载，通过 SHA-256 校验后才缓存到本地。

Mercury Translate 不出售数据，也不向 Mercury 后端发送分析数据。你选择的联网服务商会按照其自身条款处理提交的文本。
