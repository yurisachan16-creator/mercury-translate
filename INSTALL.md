# Install Mercury Translate from GitHub

Mercury Translate v0.1 supports Google Chrome desktop version 151 or newer.

1. Download `mercury-translate-v0.1.0-chrome.zip` and `SHA256SUMS` from the same GitHub Release.
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

Mercury Translate v0.1 仅支持 Google Chrome 桌面版 151 或更高版本。

1. 从同一个 GitHub Release 下载扩展 ZIP 和 `SHA256SUMS`，并核对校验值。
2. 将 ZIP 解压到一个长期保留的文件夹。
3. 打开 `chrome://extensions`，开启“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择包含 `manifest.json` 的解压目录。

更新时，把新版本文件替换到同一目录并点击“重新加载”。稳定的扩展公钥会保持
扩展 ID 和本地设置不变。OCR 模型只在用户选择后下载，校验失败时不会加载。
