# Install Mercury Translate from GitHub

Mercury Translate v0.1.2 supports Google Chrome desktop version 151 or newer.

## Chrome Web Store

The v0.1.2 work package prepares an Unlisted Chrome Web Store ZIP:
`mercury-translate-v0.1.2-chrome-web-store.zip`.

Installation from the store requires the repository owner to manually complete
Chrome Web Store developer registration, upload, privacy declarations, and
review submission in Chrome Developer Dashboard. This repository does not run
payment, upload, declaration, or submission automation.

After review approval, users install from the Unlisted store link and receive
Chrome-managed updates. The store extension receives a new ID, so existing
GitHub sideload users should export settings from the old extension and import
them into the store extension. API keys are excluded from export by default.

## GitHub sideload

1. Download `mercury-translate-v0.1.2-chrome.zip` and `SHA256SUMS` from the same GitHub Release.
2. Verify the ZIP checksum against `SHA256SUMS`.
3. Extract the ZIP into a permanent folder. Do not delete that folder while the extension is installed.
4. Open `chrome://extensions` in Chrome.
5. Enable **Developer mode**.
6. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.

To update, download and verify the newer Release ZIP, replace the files in the same
folder, and click **Reload** on `chrome://extensions`. Release builds carry a stable
public extension key so the extension ID and locally stored settings remain unchanged.

OCR models are downloaded only when selected. Mercury Translate verifies every OCR
model against the pinned size and SHA-256 digest before using it.

## 从 GitHub 手动安装

Mercury Translate v0.1.2 仅支持 Google Chrome 桌面版 151 或更高版本。

## Chrome Web Store 安装

v0.1.2 会准备不公开搜索的 Chrome Web Store ZIP：
`mercury-translate-v0.1.2-chrome-web-store.zip`。

商店安装需要仓库所有者在 Chrome Developer Dashboard 手动完成开发者注册、
上传、隐私声明和提交审核。本仓库不会自动执行付款、上传、声明或提交。

审核通过后，用户通过 Unlisted 链接安装，并由 Chrome 自动更新。商店版会获得
新的扩展 ID；已有 GitHub 侧载版用户请先从旧扩展导出设置，再在商店版导入。
API Key 默认不会导出。

## GitHub 手动安装

1. 从同一个 GitHub Release 下载扩展 ZIP 和 `SHA256SUMS`，并核对校验值。
2. 将 ZIP 解压到一个长期保留的文件夹。
3. 打开 `chrome://extensions`，开启“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择包含 `manifest.json` 的解压目录。

更新时，把新版本文件替换到同一目录并点击“重新加载”。稳定的扩展公钥会保持
扩展 ID 和本地设置不变。OCR 模型只在用户选择后下载，校验失败时不会加载。
