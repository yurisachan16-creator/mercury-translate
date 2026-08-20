import { getSourceLanguageOptions, getTranslationTargetOptions } from "./languageRegistry";
import type { MessagePath } from '../i18n/messages';

export const services = {
    // 机器翻译
    microsoft: "microsoft",
    freeTranslation: "freeTranslation",
    deepL: "deepL",
    deeplx: "deeplx",
    google: "google",
    xiaoniu: "xiaoniu",
    youdao: "youdao",
    tencent: "tencent", // 腾讯云机器翻译
    chromeTranslator: "chromeTranslator", // Chrome 内置翻译 API
    // 大模型翻译
    openai: "openai",
    azureOpenai: "azureOpenai", // Azure OpenAI
    gemini: "gemini",
    yiyan: "yiyan",
    tongyi: "tongyi",
    zhipu: "zhipu",
    moonshot: "moonshot",
    claude: "claude",
    custom: "custom",
    infini: "infini",
    // baidu: 'baidu',
    baichuan: "baichuan",
    lingyi: "lingyi",
    deepseek: "deepseek",
    minimax: "minimax",
    jieyue: "jieyue", // 阶跃星辰
    groq: "groq",
    cozecom: "cozecom", // coze 支持机器人不支持模型
    cozecn: "cozecn",
    huanYuan: "huanYuan", // 腾讯混元
    huanYuanTranslation: "huanYuanTranslation", // 腾讯混元翻译大模型
    doubao: "doubao", // 字节豆包
    siliconCloud: "siliconCloud", // 硅流
    openrouter: "openrouter", // openrouter
    grok: "grok", // X.AI 的 Grok
    newapi: "newapi", // New API 接口
};

export const servicesType = {
    // 阵营划分
    machine: new Set([services.microsoft, services.freeTranslation, services.deepL, services.deeplx, services.google, services.xiaoniu, services.youdao, services.tencent, services.chromeTranslator,]),
    AI: new Set([
        services.openai,
        services.azureOpenai,
        services.gemini,
        services.yiyan,
        services.tongyi,
        services.zhipu,
        services.moonshot,
        services.claude, services.custom,
        services.infini,
        services.baichuan,
        services.deepseek,
        services.lingyi,
        services.minimax,
        services.jieyue,
        services.groq,
        services.cozecom,
        services.cozecn,
        services.huanYuan,
        services.huanYuanTranslation,
        services.doubao,
        services.siliconCloud,
        services.openrouter,
        services.grok,
        services.newapi,
    ]),
    // 需要 token
    useToken: new Set([
        services.openai,
        services.azureOpenai,
        services.gemini,
        services.yiyan,
        services.tongyi,
        services.zhipu,
        services.moonshot,
        services.claude,
        services.deepL,
        services.deeplx,
        services.xiaoniu,
        services.infini,
        services.baichuan,
        services.deepseek,
        services.lingyi,
        services.minimax,
        services.jieyue,
        services.groq,
        services.custom,
        services.cozecom,
        services.cozecn,
        services.huanYuan,
        services.doubao,
        services.siliconCloud,
        services.openrouter,
        services.grok,
        services.newapi,
    ]),
    // 需要 model
    useModel: new Set([
        services.openai,
        services.azureOpenai,
        services.gemini,
        services.yiyan,
        services.tongyi,
        services.zhipu,
        services.moonshot,
        services.claude,
        services.custom,
        services.infini,
        services.baichuan,
        services.deepseek,
        services.lingyi,
        services.minimax,
        services.jieyue,
        services.groq,
        services.huanYuan,
        services.huanYuanTranslation,
        services.doubao,
        services.siliconCloud,
        services.openrouter,
        services.grok,
        services.newapi,
    ]),
    // 支持代理
    useProxy: new Set([
        services.openai,
        services.azureOpenai,
        services.gemini,
        services.claude,
        services.google,
        services.deepL,
        services.deeplx,
        services.moonshot,
        services.tongyi,
        services.xiaoniu,
        services.youdao,
        services.tencent,
        services.baichuan,
        services.deepseek,
        services.lingyi,
        services.jieyue,
        services.groq,
        services.cozecom,
        services.cozecn,
        services.huanYuan,
        services.huanYuanTranslation,
        services.doubao,
        services.siliconCloud,
        services.openrouter,
        services.grok,
    ]),
    // 支持自定义 URL 的服务
    useCustomUrl: new Set([
        services.custom,
        services.deeplx,
        services.newapi,
        services.azureOpenai,
    ]),

    isMachine: (service: string) => servicesType.machine.has(service),
    isAI: (service: string) => servicesType.AI.has(service),
    isUseAIContext: (service: string, model = '') =>
        servicesType.AI.has(service)
        && service !== services.huanYuanTranslation
        && !(service === services.tongyi && model.startsWith('qwen-mt')),
    isUseToken: (service: string) => servicesType.useToken.has(service),
    isUseProxy: (service: string) => servicesType.useProxy.has(service),
    isUseModel: (service: string) => servicesType.useModel.has(service),
    // 所有 AI 服务的请求体都支持附加顶层字段，包括不使用模型选择器的 Coze。
    isUseCustomBody: (service: string) => servicesType.AI.has(service),
    isCustom: (service: string) => service === services.custom,
    isNewApi: (service: string) => service === services.newapi,
    // 文心一言已迁移到千帆 v2 的 Bearer Token 鉴权；保留方法供 UI 兼容。
    isUseAkSk: (_service: string) => false,
    isCoze: (service: string) => service === services.cozecom || service === services.cozecn,
    isYoudao: (service: string) => service === services.youdao,
    isTencent: (service: string) => service === services.tencent || service === services.huanYuanTranslation,
    isAzureOpenai: (service: string) => service === services.azureOpenai,
    isUseCustomUrl: (service: string) => servicesType.useCustomUrl.has(service),
};

export const customModelString = "自定义模型";

export const minimaxBillingPlans = [
    {value: "payg", label: "按量付费（API）"},
    {value: "token-plan", label: "Token Plan（套餐/积分）"},
] as const;

export type MiniMaxBillingPlan = typeof minimaxBillingPlans[number]["value"];

export const minimaxRegions = [
    {value: "cn", label: "中国版（api.minimaxi.com）"},
    {value: "global", label: "全球版（api.minimax.io）"},
] as const;

export type MiniMaxRegion = typeof minimaxRegions[number]["value"];

/** Resolve the model that is actually sent to a provider. */
export function resolveConfiguredModel(selectedModel?: string, customModel?: string): string {
    return selectedModel === customModelString ? customModel || '' : selectedModel || '';
}

// 当前官方模型编号的单一来源，同时供列表和旧配置迁移使用。
export const currentModelIds = {
    openai: "gpt-5.6-luna",
    zhipu: "glm-5.3",
    zhipuFlash: "glm-4.5-flash",
    tongyiTokenPlan: "qwen3.8-max-preview",
    moonshot: "kimi-k3",
    moonshotCompatible: "kimi-k2.6",
    claude: "claude-fable-5",
    claudeSonnet: "claude-sonnet-5",
    claudeOpus: "claude-opus-5",
    claudeHaiku: "claude-haiku-4-5",
    deepseek: "deepseek-v4-flash",
    minimax: "MiniMax-M2.7",
    jieyue: "step-3.5-flash",
    huanYuan: "hy3",
    grok: "grok-4.5",
    groqLarge: "openai/gpt-oss-120b",
    groqSmall: "openai/gpt-oss-20b",
    yiyan: "ernie-5.1",
    yiyanFast: "ernie-speed-128k",
    infiniZhipu: "glm-5.2",
    infiniGeneral: "qwen3.6-27b",
} as const;

// 各 AI 服务的开箱默认模型优先选择近期、低延迟或低成本档位。
// currentModelIds 仍作为官方编号与旧配置迁移的单一来源；用户仍可在模型列表中主动选择更大的模型。
export const defaultModelIds = {
    [services.openai]: currentModelIds.openai,
    [services.azureOpenai]: currentModelIds.openai,
    [services.gemini]: "gemini-3.6-flash",
    [services.yiyan]: currentModelIds.yiyanFast,
    [services.tongyi]: "qwen3.6-flash",
    [services.zhipu]: currentModelIds.zhipuFlash,
    [services.moonshot]: currentModelIds.moonshotCompatible,
    [services.claude]: currentModelIds.claudeHaiku,
    [services.custom]: currentModelIds.openai,
    [services.infini]: currentModelIds.deepseek,
    [services.baichuan]: "Baichuan-M3",
    [services.lingyi]: "yi-lightning",
    [services.deepseek]: currentModelIds.deepseek,
    [services.minimax]: "MiniMax-M2.7-highspeed",
    [services.jieyue]: currentModelIds.jieyue,
    [services.huanYuan]: currentModelIds.huanYuan,
    [services.huanYuanTranslation]: "hunyuan-translation-lite",
    [services.newapi]: currentModelIds.openai,
    [services.grok]: "grok-4.3",
    [services.doubao]: "doubao-seed-1-6-250615",
    [services.siliconCloud]: "deepseek-ai/DeepSeek-V4-Flash",
    [services.groq]: currentModelIds.groqSmall,
    [services.openrouter]: "google/gemini-3.6-flash",
} as const;

export const models = new Map<string, Array<string>>([
    [services.openai, [currentModelIds.openai, "gpt-5.4-mini", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.5", "gpt-5.4-nano", "gpt-5-mini", "gpt-5-nano", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", customModelString]],
    [services.azureOpenai, [currentModelIds.openai, "gpt-5.4-mini", "gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.5", "gpt-5.4-nano", "gpt-5-mini", "gpt-5-nano", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", customModelString]],
    [services.gemini, [defaultModelIds[services.gemini], "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", customModelString]],
    [services.yiyan, [defaultModelIds[services.yiyan], currentModelIds.yiyan, "ernie-5.0-thinking-preview", "ernie-x1.1-preview", "ernie-4.5-turbo-128k", "ernie-4.5-21b-a3b", customModelString]],
    [services.tongyi, [defaultModelIds[services.tongyi], currentModelIds.tongyiTokenPlan, "qwen3.7-max", "qwen3.7-plus", "qwen-mt-plus", "qwen-mt-turbo", "qwen-mt-flash", "qwen-mt-lite", "qwen-long-latest", customModelString]],
    [services.zhipu, [defaultModelIds[services.zhipu], currentModelIds.zhipu, "glm-5.2", "glm-5.1", "glm-5-turbo", "glm-5", "glm-4.7", customModelString]],
    [services.moonshot, [defaultModelIds[services.moonshot], currentModelIds.moonshot, "kimi-k2.7-code-highspeed", "kimi-k2.7-code", "kimi-k2.5", customModelString]],
    [services.claude, [defaultModelIds[services.claude], currentModelIds.claude, currentModelIds.claudeOpus, currentModelIds.claudeSonnet, "claude-opus-4-8", "claude-sonnet-4-6", customModelString]],
    [services.custom, [currentModelIds.openai, "gpt-5.4-mini", "gpt-5.6-sol", "gemini-3.6-flash", currentModelIds.claude, currentModelIds.deepseek, "gemma:7b", "llama2:7b", "mistral:7b", customModelString]],
    [services.infini, [defaultModelIds[services.infini], "deepseek-v4-pro", currentModelIds.infiniZhipu, "kimi-k2.7-code", currentModelIds.infiniGeneral, "qwen3.6-35b-a3b", customModelString]],
    [services.baichuan, [defaultModelIds[services.baichuan], "Baichuan-M3-Plus", "Baichuan4-Air", "Baichuan4-Turbo", "Baichuan4", customModelString]],
    [services.lingyi, [defaultModelIds[services.lingyi], customModelString]],
    [services.deepseek, [currentModelIds.deepseek, "deepseek-v4-pro", customModelString]],
    [services.minimax, [defaultModelIds[services.minimax], currentModelIds.minimax, "MiniMax-M2.5", "MiniMax-M2.5-highspeed", customModelString]],
    [services.jieyue, [currentModelIds.jieyue, "step-3", "step-2", customModelString]],
    [services.huanYuan, [currentModelIds.huanYuan, "hy3-preview", customModelString]],
    [services.huanYuanTranslation, [defaultModelIds[services.huanYuanTranslation], "hunyuan-translation", customModelString]],
    [services.newapi, [currentModelIds.openai, "gpt-5.4-mini", "gpt-5.6-sol", "gemini-3.6-flash", "gemini-3.5-flash-lite", currentModelIds.claude, currentModelIds.deepseek, "kimi-k2.7-code", customModelString]],
    [services.grok, [defaultModelIds[services.grok], currentModelIds.grok, customModelString]],
    [services.doubao, ["doubao-seed-1-6-250615", customModelString]],

    // mix model
    [services.siliconCloud, [defaultModelIds[services.siliconCloud], "deepseek-ai/DeepSeek-V4-Pro", "zai-org/GLM-5.2", "Qwen/Qwen3.6-27B", "Qwen/Qwen3.6-35B-A3B", "deepseek-ai/DeepSeek-V3.2", "deepseek-ai/DeepSeek-R1", customModelString]],

    [services.groq, [defaultModelIds[services.groq], currentModelIds.groqLarge, "qwen/qwen3.6-27b", customModelString]],
    [services.openrouter, [defaultModelIds[services.openrouter], "openrouter/auto", "openai/gpt-5.6-luna", "openai/gpt-5.6-sol", "anthropic/claude-fable-5", "anthropic/claude-opus-5", "x-ai/grok-4.5", "deepseek/deepseek-v4-pro", "moonshotai/kimi-k3", "z-ai/glm-5.2", customModelString]]
]);

// 每个需要模型选择的 AI 服务都把列表第一项作为开箱即用的默认模型。
// 统一从模型列表生成，避免设置页、配置初始化和请求模板各自维护一份默认值。
export const defaultModels = new Map<string, string>(
    Array.from(models.entries())
        .map(([service, modelOptions]) => [service, modelOptions[0] || ""] as [string, string])
        .filter(([, model]) => Boolean(model)),
);

export const options = {
    minimaxBillingPlan: minimaxBillingPlans,
    minimaxRegion: minimaxRegions,
    on: [
        {value: true, label: "开启"},
        {value: false, label: "关闭"},
    ],
    // 是否即时翻译
    autoTranslate: [
        {value: true, label: "开启"},
        {value: false, label: "关闭"},
    ],
    // 是否使用缓存
    useCache: [
        {value: true, label: "开启"},
        {value: false, label: "关闭"},
    ],
    form: getSourceLanguageOptions(),
    // DeepSeek API 格式（仅 DeepSeek 服务显示）
    deepseekApiType: [
        {value: "auto", label: "自动（Chat Completion）"},
        {value: "responses", label: "Responses API"},
        {value: "chat", label: "Chat Completion"},
    ],
    deepseekThinkingMode: [
        {value: "disabled", label: "关闭（推荐）"},
        {value: "enabled", label: "开启"},
    ],
    to: getTranslationTargetOptions(['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'ru']),
    keys: [
        {value: "none", label: "禁用快捷键"},

        {value: "Computer", label: "键盘选项", disabled: true},
        {value: "Control", label: "Ctrl"},
        {value: "Alt", label: "Alt"},
        {value: "Shift", label: "Shift"},
        {value: "Escape", label: "ESC"},
        {value: "`", label: "波浪号键"},

        {value: "mouse", label: "鼠标选项", disabled: true},
        {value: "DoubleClick", label: "鼠标双击"},
        {value: "LongPress", label: "鼠标长按"},
        {value: "MiddleClick", label: "鼠标滚轮单击"},

        {value: "touchscreen", label: "触屏设备选项", disabled: true},
        {value: "TwoFinger", label: "双指翻译"},
        {value: "ThreeFinger", label: "三指翻译"},
        {value: "FourFinger", label: "四指翻译"},
        {value: "DoubleClickScree", label: "双击翻译"},
        {value: "TripleClickScree", label: "三击翻译"},
        
        {value: "custom", label: "自定义快捷键（测试版）"},
    ],
    services: [
        // 机器翻译
        {value: "machine", label: "机器翻译", disabled: true},
        {
            value: services.chromeTranslator,
            label: "Chrome 本地翻译",
            description: "在设备上使用 Chrome 内置翻译模型。语言组合可用性由浏览器运行时决定。",
        },
        {
            value: services.microsoft,
            label: "微软翻译（联网）",
            description: "免费联网服务：待翻译文本会发送给微软。该非合约集成不保证稳定性。",
        },
        {
            value: services.google,
            label: "谷歌翻译（联网）",
            description: "免费联网服务：待翻译文本会发送给谷歌。该非合约集成不保证稳定性。",
        },
        {
            value: services.deeplx,
            label: "DeepLX（实验）",
            description: "实验性联网服务，仅在高级选项中主动启用后显示。",
            experimental: true,
        },
        {value: services.deepL, label: "DeepL"},
        {value: services.xiaoniu, label: "小牛翻译"},
        {value: services.youdao, label: "有道翻译"},
        {value: services.tencent, label: "腾讯云翻译"},
        // 大模型翻译
        {value: "ai", label: "AI翻译", disabled: true},
        {value: services.siliconCloud, label: "硅基流动"},
        {value: services.huanYuan, label: "腾讯混元"},
        {value: services.newapi, label: "OpenAI-compatible / Sub2API"},
        {value: services.deepseek, label: "DeepSeek"},
        {value: services.openai, label: "OpenAI"},
        {value: services.azureOpenai, label: "Azure OpenAI"},
        {value: services.huanYuanTranslation, label: "腾讯混元翻译"},
        {value: services.tongyi, label: "阿里通义"},
        {value: services.doubao, label: "字节豆包"},
        {value: services.grok, label: "Grok (X.AI)"},
        {value: services.openrouter, label: "OpenRouter"},
        {value: services.groq, label: "Groq"},
        {value: services.moonshot, label: "Kimi"},
        {value: services.zhipu, label: "智谱"},
        {value: services.baichuan, label: "百川智能"},
        {value: services.lingyi, label: "零一万物"},
        {value: services.minimax, label: "MiniMax"},
        {value: services.jieyue, label: "阶跃星辰"},
        {value: services.infini, label: "无向芯穹"},
        {value: services.cozecom, label: "Coze国际"},
        {value: services.cozecn, label: "Coze国内"},
        {value: services.claude, label: "Claude"},
        {value: services.gemini, label: "Gemini"},
        {value: services.yiyan, label: "文心一言"},
        {value: services.custom, label: "自定义接口"},
    ],
    display: [
        {value: 0, label: "仅译文模式"},
        {value: 1, label: "双语对照模式"},
    ],
    // 双语翻译样式
    styles: [
        // 基础样式
        {value: "basic", label: "基础样式", disabled: true},
        {value: 0, label: "朴素模式", class: "fluent-display-default", group: "basic"},
        {value: 1, label: "加粗显示", class: "fluent-display-bold", group: "basic"},
        {value: 2, label: "优雅斜体", class: "fluent-display-italic", group: "basic"},
        {value: 3, label: "立体阴影", class: "fluent-display-text-shadow", group: "basic"},

        // 下划线系列
        {value: "underline", label: "下划线系列", disabled: true},
        {value: 4, label: "蓝色实线", class: "fluent-display-solid-underline", group: "underline"},
        {value: 5, label: "优雅虚线", class: "fluent-display-dot-underline", group: "underline"},
        {value: 6, label: "活泼波浪", class: "fluent-display-wavy", group: "underline"},

        // 卡片系列
        {value: "card", label: "卡片系列", disabled: true},
        {value: 7, label: "简约卡片", class: "fluent-display-card-mode", group: "card"},
        {value: 8, label: "渐变卡片", class: "fluent-display-modern-card", group: "card"},
        {value: 9, label: "纸张卡片", class: "fluent-display-paper", group: "card"},

        // 高亮系列
        {value: "highlight", label: "高亮系列", disabled: true},
        {value: 10, label: "学习标记", class: "fluent-display-learning-mode", group: "highlight"},
        {value: 11, label: "荧光标记", class: "fluent-display-marker", group: "highlight"},
        {value: 12, label: "柔和渐变", class: "fluent-display-highlight-fade", group: "highlight"},

        // 背景色系列
        {value: "background", label: "背景色系列", disabled: true},
        {value: 13, label: "温暖黄底", class: "fluent-display-lightyellow", group: "background"},
        {value: 14, label: "清新蓝底", class: "fluent-display-lightblue", group: "background"},
        {value: 15, label: "素雅灰底", class: "fluent-display-lightgray", group: "background"},

        // 特殊效果
        {value: "special", label: "特殊效果", disabled: true},
        {value: 16, label: "典雅引用", class: "fluent-display-quote", group: "special"},
        {value: 17, label: "轻巧边框", class: "fluent-display-border", group: "special"},
        {value: 18, label: "阅读焦点", class: "fluent-display-focus", group: "special"},
        {value: 19, label: "简约底线", class: "fluent-display-clean", group: "special"},

        // 专业样式
        {value: "pro", label: "专业样式", disabled: true},
        {value: 20, label: "代码风格", class: "fluent-display-tech", group: "pro"},
        {value: 21, label: "书籍风格", class: "fluent-display-elegant", group: "pro"},

        // 透明度
        {value: "transparent", label: "透明效果", disabled: true},
        {value: 22, label: "半透明弱化", class: "fluent-display-dimmed", group: "transparent"},
        {value: 23, label: "轻透明感", class: "fluent-display-transparent-mode", group: "transparent"},
    ],
    // 悬浮球快捷键选项
    floatingBallHotkeys: [
        {value: "none", label: "禁用快捷键"},
        {value: "Alt+T", label: "Alt+T / Option+T (默认)"},
        {value: "Alt+A", label: "Alt+A / Option+A"},
        {value: "Alt+S", label: "Alt+S / Option+S"},
        {value: "Alt+D", label: "Alt+D / Option+D"},
        {value: "Alt+Q", label: "Alt+Q / Option+Q"},
        {value: "Ctrl+Shift+T", label: "Ctrl+Shift+T / Control+Shift+T"},
        {value: "Ctrl+Shift+A", label: "Ctrl+Shift+A / Control+Shift+A"},
        {value: "F9", label: "F9"},
        {value: "F10", label: "F10"},
        {value: "F11", label: "F11"},
        {value: "F12", label: "F12"},
        {value: "custom", label: "自定义快捷键（测试版）"},
    ],
    theme: [
        {value: "auto", label: "跟随操作系统"},
        {value: "light", label: "亮色主题"},
        {value: "dark", label: "暗色主题"},
    ],
    // 输入框翻译目标语言选项
    inputBoxTranslationTarget: getTranslationTargetOptions(),
    // 输入框翻译触发方式选项
    inputBoxTranslationTrigger: [
        {value: "disabled", label: "关闭"},
        {value: "triple_space", label: "连按三下空格"},
        {value: "triple_equal", label: "连按三下等号(=)"},
        {value: "triple_dash", label: "连按三下短横线(-)"},
    ],
};

type OptionMessagePath = Extract<MessagePath, `option.${string}`>;
export type OptionTranslator = (path: OptionMessagePath) => string;

type OptionItem = { value: string | number | boolean; label: string; [key: string]: unknown };

function localizeOptionItems<T extends OptionItem>(
    items: readonly T[],
    labels: Record<string, OptionMessagePath>,
    translate: OptionTranslator,
): T[] {
    return items.map((item) => {
        const key = labels[String(item.value)];
        return key ? { ...item, label: translate(key) } : { ...item };
    });
}

/**
 * UI-facing option labels are resolved at render time so Settings and the popup
 * follow the selected Mercury Translate interface language. The static `options`
 * export remains available to non-UI code that only needs stable values/classes.
 */
export function getLocalizedOptions(translate: OptionTranslator): typeof options {
    const serviceLabels: Record<string, OptionMessagePath> = {
        machine: 'option.machineTranslation',
        ai: 'option.aiTranslation',
        [services.chromeTranslator]: 'option.chromeLocal',
        [services.microsoft]: 'option.microsoftOnline',
        [services.google]: 'option.googleOnline',
        [services.deeplx]: 'option.deeplxExperimental',
        [services.custom]: 'option.customEndpoint',
    };
    const serviceDescriptions: Record<string, OptionMessagePath> = {
        [services.chromeTranslator]: 'option.chromeLocalDescription',
        [services.microsoft]: 'option.microsoftOnlineDescription',
        [services.google]: 'option.googleOnlineDescription',
        [services.deeplx]: 'option.deeplxExperimentalDescription',
    };
    const styleLabels: Record<string, OptionMessagePath> = {
        basic: 'option.basicStyle', underline: 'option.underlineStyle', card: 'option.cardStyle',
        highlight: 'option.highlightStyle', background: 'option.backgroundStyle', special: 'option.specialStyle',
        pro: 'option.professionalStyle', transparent: 'option.transparentStyle',
        0: 'option.plainStyle', 1: 'option.boldStyle', 2: 'option.italicStyle', 3: 'option.shadowStyle',
        4: 'option.solidUnderline', 5: 'option.dottedUnderline', 6: 'option.wavyUnderline',
        7: 'option.simpleCard', 8: 'option.gradientCard', 9: 'option.paperCard',
        10: 'option.learningMark', 11: 'option.marker', 12: 'option.softGradient',
        13: 'option.warmYellow', 14: 'option.freshBlue', 15: 'option.elegantGray',
        16: 'option.quote', 17: 'option.border', 18: 'option.readingFocus', 19: 'option.cleanUnderline',
        20: 'option.codeStyle', 21: 'option.bookStyle', 22: 'option.dimmed', 23: 'option.transparent',
    };

    return {
        ...options,
        minimaxBillingPlan: localizeOptionItems(options.minimaxBillingPlan, {
            payg: 'option.payAsYouGo', 'token-plan': 'option.tokenPlan',
        }, translate),
        minimaxRegion: localizeOptionItems(options.minimaxRegion, {
            cn: 'option.chinaRegion', global: 'option.globalRegion',
        }, translate),
        on: localizeOptionItems(options.on, { true: 'option.enabled', false: 'option.disabled' }, translate),
        autoTranslate: localizeOptionItems(options.autoTranslate, { true: 'option.enabled', false: 'option.disabled' }, translate),
        useCache: localizeOptionItems(options.useCache, { true: 'option.enabled', false: 'option.disabled' }, translate),
        form: localizeOptionItems(options.form, { auto: 'option.autoDetect' }, translate),
        deepseekApiType: localizeOptionItems(options.deepseekApiType, {
            auto: 'option.automatic', responses: 'option.responsesApi', chat: 'option.chatCompletion',
        }, translate),
        deepseekThinkingMode: localizeOptionItems(options.deepseekThinkingMode, {
            disabled: 'option.thinkingDisabled', enabled: 'option.enabled',
        }, translate),
        keys: localizeOptionItems(options.keys, {
            none: 'option.disableHotkey', Computer: 'option.keyboardOptions', '`': 'option.tildeKey',
            mouse: 'option.mouseOptions', DoubleClick: 'option.mouseDoubleClick', LongPress: 'option.mouseLongPress',
            MiddleClick: 'option.middleClick', touchscreen: 'option.touchscreenOptions', TwoFinger: 'option.twoFinger',
            ThreeFinger: 'option.threeFinger', FourFinger: 'option.fourFinger', DoubleClickScree: 'option.doubleTap',
            TripleClickScree: 'option.tripleTap', custom: 'option.customHotkey',
        }, translate),
        services: options.services.map((item) => ({
            ...item,
            label: serviceLabels[item.value] ? translate(serviceLabels[item.value]) : item.label,
            ...(serviceDescriptions[item.value] ? { description: translate(serviceDescriptions[item.value]) } : {}),
        })),
        display: localizeOptionItems(options.display, {
            0: 'option.translationOnlyMode', 1: 'option.bilingualMode',
        }, translate),
        styles: localizeOptionItems(options.styles, styleLabels, translate),
        floatingBallHotkeys: localizeOptionItems(options.floatingBallHotkeys, {
            none: 'option.disableHotkey', 'Alt+T': 'option.defaultFloatingHotkey', custom: 'option.customHotkey',
        }, translate),
        theme: localizeOptionItems(options.theme, {
            auto: 'option.followSystem', light: 'option.lightTheme', dark: 'option.darkTheme',
        }, translate),
        inputBoxTranslationTrigger: localizeOptionItems(options.inputBoxTranslationTrigger, {
            disabled: 'option.disabled', triple_space: 'option.tripleSpace', triple_equal: 'option.tripleEqual',
            triple_dash: 'option.tripleDash',
        }, translate),
    } as unknown as typeof options;
}

export const defaultOption = {
    on: true,
    from: "auto",
    to: "zh-Hans",
    style: 1,
    display: 1,
    hotkey: "Control",
    service: services.chromeTranslator,
    custom: "http://localhost:11434/v1/chat/completions",
    // DeepLX 是实验性服务。只有用户显式填入端点时才会请求它。
    deeplx: "",
    system_role:
        "You are a professional, authentic machine translation engine.",
    user_role: `Translate the following text into {{to}}, If translation is unnecessary (e.g. proper nouns, codes, etc.), return the original text. NO explanations. NO notes:

{{origin}}`,
    count: 0,
    useCache: true,
    floatingBallHotkey: "Alt+T", // 默认悬浮球快捷键
    inputBoxTranslationTrigger: "disabled", // 默认关闭输入框翻译
    inputBoxTranslationTarget: "en", // 默认翻译成英文
};
