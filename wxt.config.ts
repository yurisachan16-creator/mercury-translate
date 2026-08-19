import {defineConfig} from 'wxt';
import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import fs from 'fs';


const packageJson = JSON.parse(fs.readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const firefoxRunnerBinary = process.env.FLUENTREAD_FIREFOX_RUNNER_BINARY;
const firefoxRunnerProfile = process.env.FLUENTREAD_FIREFOX_RUNNER_PROFILE;
const firefoxRunnerStartUrl = process.env.FLUENTREAD_FIREFOX_RUNNER_START_URL;

/**
 * Edge 的扩展内容脚本加载器会拒绝产物中的 Unicode 非字符 U+FFFE/U+FFFF，
 * 并把它们误报成“不是 UTF-8 编码”。部分第三方解析器会把源码中的转义
 * 序列展开成这些字符，因此在最终 JavaScript chunk 中重新写成 ASCII 转义，
 * 保持运行时值不变，同时避免扩展加载失败。
 */
function escapeExtensionNoncharacters() {
    const escapeActualNoncharacters = (code: string) => code.replace(/[\uFFFE\uFFFF]/g, (character) => {
        const codePoint = character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
        return `\\u${codePoint}`;
    });

    return {
        name: 'escape-extension-noncharacters',
        generateBundle(_options: unknown, bundle: Record<string, {type: string; code?: string}>) {
            // 部分构建阶段会在 renderChunk 之后再次序列化字符串，因此在
            // 写入扩展目录前再检查一次最终 chunk，覆盖后台脚本等产物。
            for (const chunk of Object.values(bundle)) {
                if (chunk.type !== 'chunk' || chunk.code === undefined) continue;

                const escaped = escapeActualNoncharacters(chunk.code);
                if (escaped !== chunk.code) chunk.code = escaped;
            }
        },
    };
}


// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/webextension-polyfill'],
    // Firefox 的开发 runner 使用一次性 profile；预置启动参数，避免每轮 UI
    // 回归都被 about:welcome 首次启动引导遮挡。仅影响 pnpm dev:firefox，
    // 不会写入用户 Firefox profile，也不会进入扩展发布产物。
    webExt: {
        binaries: firefoxRunnerBinary ? {firefox: firefoxRunnerBinary} : undefined,
        firefoxProfile: firefoxRunnerProfile || undefined,
        startUrls: [firefoxRunnerStartUrl || 'about:blank'],
        firefoxPref: {
            'browser.aboutwelcome.enabled': false,
            'browser.aboutwelcome.screens': '',
            'browser.startup.homepage_override.mstone': 'ignore',
            'browser.startup.homepage_override.buildID': 'ignore',
            'startup.homepage_override_url': 'about:blank',
            'startup.homepage_override_nimbus_disable_wnp': true,
            'browser.messaging-system.whatsNewPanel.enabled': false,
            'browser.startup.homepage': 'about:blank',
            'startup.homepage_welcome_url': 'about:blank',
            'startup.homepage_welcome_url.additional': '',
            'trailhead.firstrun.didSeeAboutWelcome': true,
            'trailhead.firstrun.branches': 'nofirstrun-exp',
            'browser.shell.checkDefaultBrowser': false,
        },
    },
    imports: {
        addons: {
            vueTemplate: true,
        },
    },
    vite: () => ({
        plugins: [vue(), escapeExtensionNoncharacters()],
        define: {
            'process.env.VUE_APP_VERSION': JSON.stringify(packageJson.version),
            'process.env.MERCURY_OCR_BASE_URL': JSON.stringify(process.env.MERCURY_OCR_BASE_URL || ''),
        }
    }),
    manifest: {
        name: '__MSG_extensionName__',
        short_name: '__MSG_extensionShortName__',
        description: '__MSG_extensionDescription__',
        default_locale: 'en',
        minimum_chrome_version: '151',
        // The public half of the project key keeps the extension ID stable for
        // users updating GitHub Release builds. No signing secret is bundled.
        key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyhbl80xN1FSvgW53b6Q0lYB6t/uobOZmfhW/Wm/jE9kLdG28Mel0VeGNToaV0c6RHuSApkfd5SdnQpteAH4/QcWv1p45Cxdtr2eNzfATFdRoBa10VfPtbMBCIQZDzSuwfEUNHLV94ITWyuHroxSav3QqlzWkPkO+X5wWWDdyzMxFton3NL//ekRLhdDh1CKcQv6T04KNsQjrb3jXdBBjapqJBl20BowWWxKHt6D4Fx7dajWg5bpgJAD5s9dNR5E73MaunP5A5WNnhCxHAoqPfTw3AoOLW73Q9v+cObTySRvtskVK56y/Bj2DM81bJrzezxRnzD3P+YPg/XA2Pt1FOwIDAQAB',
        permissions: ['storage', 'alarms', 'contextMenus', 'offscreen'],
        content_security_policy: {
            extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
        },
        // Page access comes from the declared content-script match patterns.
        // Provider/OCR/image origins are requested from a user gesture only
        // when that service or asset is selected.
        host_permissions: [],
        optional_host_permissions: ['http://*/*', 'https://*/*'],
        web_accessible_resources: [
            {
                resources: ['icon/32.png', 'icon/48.png', 'icon/128.png'],
                matches: ['<all_urls>'],
                use_dynamic_url: true,
            },
        ],
        // Chrome 151+ routes PDF responses to the extension while preserving
        // the original URL and one-shot response stream.
        mime_types_handler: {
            'application/pdf': {
                handler_url: 'pdf-viewer.html',
                can_embed: true,
            },
        },
    } as any,

});
