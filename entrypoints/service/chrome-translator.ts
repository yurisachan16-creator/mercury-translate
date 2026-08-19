import { config } from "@/entrypoints/utils/config";
import { LocalProviderUnavailableError } from '@/entrypoints/utils/providerCapabilities';
import { services } from '@/entrypoints/utils/option';
import type { OcrLine } from "@/entrypoints/utils/imageTranslationCore";
import type { AreaTranslationSelection } from "@/entrypoints/utils/areaTranslationCore";
import type { ImageOcrLanguageCode } from "@/entrypoints/utils/imageOcrLanguages";
import type { OffscreenImageTranslationResult } from "@/entrypoints/offscreen/imageTranslation";
import {
    isNetworkConsentRequiredOutcome,
    type NetworkConsentRequiredOutcome,
} from "@/entrypoints/utils/providerConsent";

/**
 * Chrome 内置翻译 API 服务
 * 基于 Chrome 浏览器的 Translation API 实现快速、安全的翻译
 * 
 * 使用 Chrome Offscreen API 在独立的 DOM 环境中运行翻译功能
 */

// 在 background script 中使用 offscreen API 处理翻译
async function translateWithOffscreen(message: any): Promise<any> {
    try {
        // 确保 offscreen 文档存在
        await ensureOffscreenDocument();

        // 向 offscreen 文档发送翻译请求
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'CHROME_TRANSLATE_OFFSCREEN',
                data: {
                    text: message.origin,
                    from: typeof message.from === 'string' ? message.from : config.from,
                    to: typeof message.to === 'string' ? message.to : config.to
                }
            }, (response: any) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });

        // 检查响应
        if (response && typeof response === 'object' && 'success' in response) {
            const typedResponse = response as { success: boolean; result?: string; error?: string };
            if (typedResponse.success) {
                return typedResponse.result;
            } else {
                throw new Error(typedResponse.error || '翻译失败');
            }
        }

        throw new Error('无效的响应格式');
    } catch (error) {
        console.error('Offscreen 翻译失败');
        throw new LocalProviderUnavailableError(
            services.chromeTranslator,
            `Chrome Translation API 不可用：${error instanceof Error ? error.message : '未知错误'}`,
        );
    }
}

// 确保 offscreen 文档存在
async function ensureOffscreenDocument() {
    try {
        // 检查是否已经有 offscreen 文档
        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (existingContexts.length > 0) {
            return; // 已经存在
        }

        // 创建 offscreen 文档
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['DOM_SCRAPING'], // 使用 DOM_SCRAPING 原因来访问 Translation API
            justification: 'Chrome Translation API requires DOM context'
        });

        console.log('Offscreen 文档创建成功');
    } catch (error) {
        console.error('创建 offscreen 文档失败');
        throw new Error('无法创建 offscreen 文档');
    }
}

// 在 offscreen 页面中运行本地 OCR，避免内容脚本从网页源启动扩展 worker 时被浏览器拦截。
export async function recognizeImageWithOffscreen(image: string, sourceLanguage: string): Promise<OcrLine[]> {
    await ensureOffscreenDocument();

    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'FLUENT_READ_IMAGE_OCR_OFFSCREEN',
            image,
            sourceLanguage,
        }, (result: any) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result);
            }
        });
    });

    if (response?.success) return response.lines || [];
    throw new Error(response?.error || '图片 OCR 失败');
}

export async function translateImageWithOffscreen(
    image: string,
    sourceLanguage: string,
    title: string,
    serviceOverride?: string,
    consentScopeId?: string,
): Promise<OffscreenImageTranslationResult | NetworkConsentRequiredOutcome> {
    await ensureOffscreenDocument();

    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'FLUENT_READ_IMAGE_TRANSLATE_OFFSCREEN',
            image,
            sourceLanguage,
            title,
            serviceOverride,
            consentScopeId,
        }, (result: any) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result);
            }
        });
    });

    if (isNetworkConsentRequiredOutcome(response)) return response;
    if (response?.success) return response;
    throw new Error(response?.error || '图片翻译失败');
}

export async function translateAreaWithOffscreen(
    image: string,
    sourceLanguage: string,
    title: string,
    selection: AreaTranslationSelection,
    serviceOverride?: string,
    consentScopeId?: string,
): Promise<OffscreenImageTranslationResult | NetworkConsentRequiredOutcome> {
    await ensureOffscreenDocument();

    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'FLUENT_READ_AREA_TRANSLATE_OFFSCREEN',
            image,
            sourceLanguage,
            title,
            selection,
            serviceOverride,
            consentScopeId,
        }, (result: any) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result);
            }
        });
    });

    if (isNetworkConsentRequiredOutcome(response)) return response;
    if (response?.success) return response;
    throw new Error(response?.error || '圈选翻译失败');
}

export async function downloadImageOcrLanguagesWithOffscreen(languages: ImageOcrLanguageCode[]): Promise<void> {
    await ensureOffscreenDocument();

    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'FLUENT_READ_IMAGE_OCR_DOWNLOAD_OFFSCREEN',
            languages,
        }, (result: any) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result);
            }
        });
    });

    if (!response?.success) throw new Error(response?.error || '图片 OCR 语言包下载失败');
}

export async function clearImageOcrLanguagesWithOffscreen(): Promise<void> {
    await ensureOffscreenDocument();

    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'MERCURY_IMAGE_OCR_CLEAR_OFFSCREEN',
        }, (result: any) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve(result);
        });
    });

    if (!response?.success) throw new Error(response?.error || 'OCR 语言包清除失败');
}

export type ChromeTranslatorAvailability = 'ready' | 'downloadable' | 'downloading' | 'unsupported' | 'after-detection';

export async function checkChromeTranslatorAvailabilityWithOffscreen(
    from: string,
    to: string,
): Promise<ChromeTranslatorAvailability> {
    await ensureOffscreenDocument();
    const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: 'MERCURY_CHROME_TRANSLATOR_AVAILABILITY_OFFSCREEN',
            from,
            to,
        }, (result: any) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else resolve(result);
        });
    });
    if (!response?.success || typeof response.availability !== 'string') {
        throw new Error(response?.error || '无法检查 Chrome 本地翻译状态');
    }
    return response.availability as ChromeTranslatorAvailability;
}

// 主翻译函数
export default async function chromeTranslator(message: any): Promise<any> {
    const text = message.origin;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error('翻译文本不能为空');
    }

    // 检查是否在 background script 环境中
    if (typeof window === 'undefined') {
        // 在 background script 中，使用 offscreen API
        return await translateWithOffscreen(message);
    }

    // 如果在其他环境中，抛出错误
    throw new LocalProviderUnavailableError(
        services.chromeTranslator,
        'Chrome Translation API 只能在 Google Chrome 浏览器 v138 stable 版本以上使用',
    );
}
