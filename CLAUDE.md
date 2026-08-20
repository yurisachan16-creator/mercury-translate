# Mercury Translate 开发规则

## 项目定位

- Mercury Translate（水星翻译）是基于 FluentRead 的非官方 GPL-3.0 独立项目，首版只支持 Chrome 桌面版 151+。
- 项目提供网页双语翻译、划词与图片翻译、YouTube 双语字幕、PDF 双栏阅读与本地 OCR。
- `docs/spec.md` 是产品约束真源；当前执行状态以 repo-harness 的 active plan、contract、review 和 checks 为准。

## 技术与隐私边界

- 保持 WXT 0.20、Vue 3、TypeScript、Element Plus、Manifest V3 和 pnpm 9；未经专项任务不升级框架主版本。
- 复用既有模块：`entrypoints/` 管理扩展入口、翻译服务和共享运行时，`components/` 管理 Vue UI，`tests/` 管理自动化回归。
- Chrome Translator API 和用户自己的 Ollama 属于本地能力；Google、Microsoft/Bing、DeepLX 与 BYOK 服务均属于联网边界，禁止静默跨隐私等级回退。
- API key 只能保存在 `storage.local`，不得进入同步存储、日志、源码、测试夹具或提交历史。
- 保留既有 `fluent-read-*` DOM/CSS 标识以避免页面兼容回归；新增外部品牌、文档和发布入口统一使用 Mercury Translate。
- v0.1.0 不承诺 Firefox、Safari、Edge 商店或 Chrome Web Store 兼容性；v0.1.1 仅准备 Chrome Web Store 不公开搜索发布材料。

## repo-harness 工作流

- 开始任务先运行 `repo-harness state resolve --json`，只按解析出的计划、契约、允许路径和下一步执行。
- 读取 `.ai/context/capabilities.json`，按最长前缀选择能力上下文；存在 `.codegraph/` 时，理解或定位代码优先使用 CodeGraph。
- 契约级修改必须在独立 `codex/<slug>` linked worktree 中完成；主工作树只用于接收已验证结果与发布。
- 完成前更新 contract、notes、review、`tasks/todos.md` 与 `.ai/harness/checks/latest.json`，不得把缺失的外部证据推断为通过。
- 上游同步只能使用独立 `codex/upstream-sync-YYYYMMDD` 计划、契约和 PR；不得直接改写 `main`。

## 实现原则

- 修复问题时处理根因，并覆盖恢复原文、重复触发、动态 DOM、Shadow DOM、页面卸载、取消与失败重试。
- 新翻译服务沿用 `entrypoints/service/` 适配器；UI 不直接散落供应商网络请求。
- PDF、字幕和网页共用现有翻译、同意、取消与缓存契约，不建立第二套服务商客户端。
- 用户可见行为、隐私边界或版本变化必须同步更新 README、文档和 CHANGELOG。
- 不提交构建产物、OCR 模型、密钥、浏览器配置或本地 repo-harness 运行证据。
- Chrome Web Store 上架素材、三语文案、隐私页和手动上传清单位于 `store-assets/`；不得在该目录加入付费操作、商店 API 凭据、遥测或复制的第三方商店身份。

## Required Checks

- `pnpm compile`
- `pnpm test`
- `pnpm build`
- `pnpm docs:build`
- `git diff --check`

发布契约另需执行 `pnpm zip`、ZIP 完整性校验、SHA-256 校验和干净环境侧载验证。
