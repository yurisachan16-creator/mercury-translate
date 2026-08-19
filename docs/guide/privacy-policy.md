# Mercury Translate 隐私说明

**生效日期：2026-08-19**

Mercury Translate（水星翻译）是一款无账号、无自建后端、无遥测的开源浏览器扩展。
我们不运营 Mercury Translate 中转服务器，也不收集用户活动、浏览历史、设备标识、
广告数据或分析事件。

## 1. 本地处理

以下数据默认只在当前浏览器内处理：

- 扩展设置、界面语言、翻译历史计数和用户主动保存的服务配置；
- Chrome Translator API 处理的网页、字幕或 PDF 文本；
- 交给本机 Ollama 端点的文本；
- PDF 原始字节，它们只保留在当前 PDF 页面的内存中，不写入扩展存储；
- 图片或扫描 PDF 的 OCR 像素、文字框和识别结果。

Chrome 可能在首次使用某个语言组合时下载本地翻译模型；该过程由 Chrome 管理。

## 2. 需要联网的情况

只有用户选择联网服务时，待翻译文本才会发送到相应第三方：

- Google Translate；
- Microsoft/Bing Translator；
- DeepSeek、Gemini、OpenAI/GPT 或其他 OpenAI-compatible 端点；
- 用户手动配置的其他服务。

Google 和 Microsoft/Bing 不是本地翻译。当 Chrome 本地翻译不支持某语言组合时，
Mercury Translate 会先显示提示，用户可选择“仅本次”、“记住该服务”或取消。
扩展不会在本地服务失败后静默改用联网服务。
“仅本次”只对当前网页或 PDF 阅读器会话生效，不会授权其他标签页；新建或重载页面会再次询问。

第三方服务收到数据后，由其自身条款和隐私政策约束。敏感文档应使用 Chrome 本地翻译、
本机 Ollama，或不进行翻译。

## 3. OCR 语言模型

首次启用英文、简体中文、繁体中文、日文或韩文 OCR 时，扩展会从固定的 GitHub 版本资产
下载对应 `traineddata` 文件。下载请求不包含网页、PDF、图片或识别文本。模型通过
SHA-256 校验后才会保存到 IndexedDB 并交给 Tesseract.js。

## 4. 本地存储

- API key 和自定义端点保存在 `storage.local`，不写入日志，不通过 Mercury 服务器同步。
- 普通翻译缓存遵循扩展的缓存开关。
- PDF 译文缓存只保存文本译文和哈希键，不保存 PDF 原始字节；默认最长 7 天、上限 50 MB。
- 用户可在扩展中清除翻译缓存、PDF 缓存和 OCR 语言模型，或卸载扩展删除所有本地数据。

## 5. 权限用途

- 页面访问权限：识别用户要求翻译的文本，并将译文放回当前页面；
- `storage`：保存设置、用户同意选择、缓存和密钥；
- `offscreen`：运行 Chrome 本地翻译、OCR 和图像处理；
- `contextMenus`：提供右键翻译操作；
- PDF MIME 处理：在 Chrome 151+ 中打开 PDF 对照阅读器。
- 可选域名权限：只在用户选择服务、确认联网授权、提交自定义端点或下载 OCR 模型时申请对应来源。

## 6. 联系与变更

问题和隐私反馈请在项目 GitHub Issues 中提交；提交前请删除 API key、Cookie、个人信息和原始文档内容。
本文档更新时会随对应的开源版本一同发布。
