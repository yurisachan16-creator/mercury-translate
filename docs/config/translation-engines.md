# 翻译服务

Mercury Translate 把服务按隐私边界分为三类：本地、免费联网服务和自带密钥服务。切换到会联网的服务前，扩展会先取得你的明确同意，不会在本地服务不可用时静默把文本发给第三方。

<img class="doc-screenshot" src="/screenshots/settings-services.png" alt="Mercury Translate translation service settings" />

## 如何选择

| 你的优先级 | 建议先尝试 |
| --- | --- |
| 不希望文本离开本机 | Chrome 本地 Translator API，或你自己运行的 Ollama |
| 快速试用联网翻译 | Microsoft/Bing 或 Google 免费联网服务 |
| 需要自己的额度、质量或模型 | DeepSeek、Gemini、OpenAI/GPT、OpenAI-compatible 自定义端点 |
| 调试实验服务 | 高级实验选项中的 DeepLX |

Chrome 本地 Translator API 是默认服务。启动时 Mercury Translate 会检测当前语言组合和模型状态；如果浏览器不支持、模型未下载或语言组合不可用，界面会显示对应状态。

## 免费联网服务

Microsoft/Bing 和 Google 被归类为免费联网服务。它们不需要你填写 API Key，但文本会发送到对应服务商，且稳定性、频率限制和接口行为不保证长期可用。

首次需要从本地服务切换到联网服务时，Mercury Translate 会要求你选择：

- 仅本次使用指定联网服务；
- 将该服务设为默认服务；
- 取消，不发送任何文本。

网络失败、429 或服务商返回异常时，Mercury Translate 会保留当前页已有结果并让你重试或手动换服务，不会在不同隐私等级之间自动切换。

## 自带密钥服务

DeepSeek、Gemini、OpenAI/GPT、OpenAI-compatible 自定义端点和其他 AI 服务适合需要上下文、术语一致性或风格控制的内容。配置时通常需要填写：

- API Base URL；
- API Key；
- Model 名称；
- 目标语言和可选的高级参数。

API Key 只保存在浏览器本地存储中，不参与同步，也不会写入日志。保存服务配置时，Mercury Translate 才会申请对应域名权限。

不同供应商对兼容接口的实现并不完全相同。如果请求失败，先用服务商官方示例验证地址、模型和密钥，再回到 Mercury Translate 检查配置。

## DeepLX

DeepLX 是高级实验选项，默认关闭。它通常依赖非官方接口或自建网关，稳定性、可用性和合规边界取决于你的部署方式。只有在你理解其风险并主动启用后才建议使用。

## MiniMax

MiniMax 同时提供按量付费 API 和 Token Plan 两类权益。两类 Key 不能互换；Token Plan Key 通常以 `sk-cp-` 开头，并且要求对应订阅仍然有效。在 MiniMax 服务配置中分别选择“按量付费（API）”或“Token Plan（套餐/积分）”，再选择 Key 所属的“中国版”或“全球版”（默认中国版）。Mercury Translate 会根据区域使用对应的 OpenAI 兼容 Chat Completions 地址，并在页面显示当前地址。

如果看到 `401` 或错误码 `2049`，优先检查计费方式、区域和 Key 是否来自同一套 MiniMax 账户权益；不要把截图或完整 Key 发到 Issue、聊天记录或仓库。

## Ollama 本地模型

Ollama 适合希望在本机处理文本的用户。你需要在本机运行 Ollama、准备一个可用模型，并让浏览器扩展可以访问本地接口。

如果浏览器控制台出现跨域错误，请参考[常见问题中的 Ollama 部分](/guide/faq#ollama-无法连接)。本地模型的速度和质量取决于模型大小、显卡或 CPU 性能以及上下文长度。

## 失败排查

### 请求超时

先用短文本测试，检查网络和服务地址，再降低并发或切换到响应更快的服务。

### 返回空结果或格式错误

确认模型支持当前请求格式，并检查服务商是否返回了错误信息或触发了内容过滤。AI 服务还需要确认模型名称正确。

### 只有部分段落成功

长页面可能触发额度、频率或上下文限制。恢复原文后分批翻译，或选择更适合长文本的服务。

### API 密钥泄露

立即在服务商控制台撤销并重新生成密钥，同时检查仓库、Issue、截图和浏览器同步记录中是否存在旧密钥。不要把密钥提交到 Git。
