# Chrome Web Store 上架文案（简体中文）

更新日期：2026-08-20

## 名称

```text
Mercury Translate
```

## 短描述

```text
本地优先的网页、YouTube 字幕、图片和 PDF 双语翻译扩展。
```

## 长描述

```text
Mercury Translate（水星翻译）是一款面向 Chrome 桌面版的开源双语阅读扩展。

它不会把你带离原网页，而是在阅读位置呈现译文：文章段落旁、视频字幕下、PDF 页面右侧，或图片文字上方。

核心功能：

1. 网页双语阅读
- 在文章页和动态网页内直接翻译
- 原文与译文同时保留，适合对照阅读
- 不需要时可恢复原文
- 在 Chrome 允许扩展访问的范围内支持普通页面、富文本和开放 Shadow DOM 内容

2. YouTube 双语字幕
- 同时显示原字幕和译文字幕
- 复用网页翻译相同的服务商与隐私规则
- 页面导航、播放和重试互不串扰

3. Chrome 151+ PDF 双栏阅读器
- 支持的 PDF 会进入左原文、右译文的阅读器
- 左侧保留原始 PDF 页面，右侧按页展示译文块
- 只处理可视页和相邻页，不在首版预翻译整本
- 密码、损坏或不支持的 PDF 会回退到 Chrome 原生阅读器

4. 图片 OCR 与翻译
- 识别图片或扫描 PDF 页面中的文字
- OCR 使用随扩展打包的本地 Worker，并校验语言模型后使用
- 首批 OCR 语言：英文、简体中文、繁体中文、日文、韩文

5. 翻译服务由你选择
- 默认：Chrome 本地 Translator API（语言组合可用时）
- 本地选项：你自己的 Ollama
- 联网选项：Google、Microsoft/Bing、DeepSeek、Gemini、OpenAI/GPT、OpenAI 兼容 / Sub2API 自定义端点，以及默认关闭的实验 DeepLX

隐私与费用：

- Mercury Translate 没有账号、没有 Mercury 后端、没有遥测、没有广告、没有订阅。
- 本地翻译只指 Chrome Translator 或你自己的 Ollama。Google、Microsoft/Bing 和 BYOK 云服务都属于联网服务。
- 当本地翻译不可用时，扩展会先询问，不会静默把文本发给联网服务。
- API Key 仅保存在 chrome.storage.local，不同步、不写日志、不发送给 Mercury。
- PDF 原始字节只驻留内存。可选 PDF 缓存保存译文和哈希，不保存原 PDF。
- OCR 语言模型可能从固定 GitHub Release 资产下载，校验通过后才在本地使用。
- OpenAI 兼容 / Sub2API 只有在你点击获取模型时请求 `/v1/models`；翻译文本只会在你主动开始翻译时发送。

Mercury Translate 是独立 GPL-3.0 项目，不代表 Google、Microsoft、OpenAI、Gemini、DeepSeek、Ollama、PDF.js、Tesseract.js 或其他服务商的官方背书。
```

## 截图标题

```text
01 不离开网页的双语阅读
02 YouTube 原字幕与译文同屏
03 左侧原始 PDF，右侧对应译文
04 图片文字与扫描页本地 OCR
05 本地、联网和自带密钥边界清楚
```
