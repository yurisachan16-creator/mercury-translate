# 隐私政策

更新日期：2026-08-20

Mercury Translate 是开源浏览器扩展，没有 Mercury 账号、后端服务器、遥测、广告、订阅或付款功能。

## 本地保存的内容

- 扩展设置保存在 `chrome.storage.local`。
- API Key 只保存在当前浏览器配置中，Mercury Translate 不同步、不记录日志、不上传到 Mercury 后端。
- PDF 原始字节只在阅读器打开期间保留在内存中。
- 可选 PDF 译文缓存保存译文、哈希、语言、服务商和页码元数据，不保存原始 PDF 文件。
- OCR 使用随扩展打包的本地 Worker。语言模型下载并校验后缓存在本地。

## 什么情况下会离开浏览器

只有当你主动选择联网翻译服务，或需要下载 OCR 语言模型时，数据才会离开浏览器。

- Chrome Translator API：语言组合可用时使用 Chrome 本地能力。
- Ollama：你自己选择的本地或自托管端点。
- Google、Microsoft/Bing：免费联网服务，不保证稳定性。
- DeepSeek、Gemini、OpenAI/GPT、OpenAI-compatible 自定义端点等 BYOK 服务：由你配置密钥或端点的联网服务。
- DeepLX：高级实验联网选项，默认关闭。
- OCR 模型：按需从固定 Release 资产下载，经过 SHA-256 校验后再使用。

当本地翻译不可用时，Mercury Translate 会先询问，不会静默跨越本地与联网的隐私边界。

## 设置迁移

v0.1.1 的迁移文件用于从 GitHub 侧载版移动到 Chrome Web Store 版。商店版会获得新的扩展 ID，无法直接读取旧版设置。API Key 和服务商密钥默认排除；只有你明确选择包含密钥后，文件才会以明文保存这些凭据。

## 不出售、不跟踪

Mercury Translate 不出售数据，不进行用户画像，也不会把使用分析发送给 Mercury 服务。你主动选择的联网服务商会按照其自身政策处理提交的文本。

## 联系

隐私问题或缺陷请使用公开 GitHub 仓库的 Issues。不要在 issue 中贴 API Key、私人文档或敏感文本。
