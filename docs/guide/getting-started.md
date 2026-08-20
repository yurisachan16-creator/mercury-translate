# 安装与第一次翻译

Mercury Translate 0.1.2 面向 Chrome 桌面版 151 及更高版本。GitHub 侧载包仍然免费可用；Chrome Web Store 版准备为不公开搜索安装链接，审核通过后由 Chrome 自动更新。

## 安装扩展

1. 从项目 GitHub Releases 下载 `mercury-translate-v0.1.2-chrome.zip`。
2. 校对同一 Release 中 `SHA256SUMS` 的扩展包摘要，然后解压到一个固定目录。
3. 打开 `chrome://extensions`，启用“开发者模式”。
4. 选择“加载已解压的扩展程序”，指向解压后的目录。
5. 把 Mercury Translate 固定到工具栏。

更新时使用新版本替换同一目录中的文件，再在扩展页点击“重新加载”。发布包使用稳定的公开扩展密钥，扩展 ID 和本地设置会保持不变。

## Chrome Web Store 版

商店版使用 `mercury-translate-v0.1.2-chrome-web-store.zip` 手动上传审核，不由项目脚本自动提交。审核通过后用户通过 Unlisted 链接安装。因为商店包不包含 GitHub 侧载公钥，Chrome 会分配新的扩展 ID；旧版设置需要通过“配置管理”的导出/导入迁移，API Key 默认排除。

## 第一次网页翻译

1. 打开包含普通段落的网页。浏览器内部页、扩展商店和部分受保护编辑器不允许扩展注入。
2. 打开 Mercury Translate 弹窗，选择源语言和目标语言。
3. 保留默认的 Chrome Translator；首次使用某语言组合时，Chrome 可能需要下载本地模型。
4. 点击“翻译页面”。译文会按可见内容分批出现在原文附近。

如果当前语言组合不支持本地翻译，扩展会请你选择是否使用 Google、Microsoft/Bing 或自己的 API；取消时不会发送文本。

## 打开 PDF

安装后直接在 Chrome 中打开 PDF 链接或本地 PDF。Mercury Translate 会保留地址栏中的原始地址，并显示原页/译文双栏阅读器。详见 [PDF 双语阅读](/guide/pdf-translation)。

## 从源码构建

```bash
pnpm install --frozen-lockfile
pnpm compile
pnpm test
pnpm build
```

在 `chrome://extensions` 中加载 `.output/chrome-mv3`。
