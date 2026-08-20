/**
 * Chrome Translation API Offscreen 文档
 * 在 offscreen 环境中处理 Chrome Translation API 调用
 */

import { clearImageOcrLanguages, downloadImageOcrLanguages, recognizeImage } from './imageOcr';
import { translateAreaInOffscreen, translateImageInOffscreen } from './imageTranslation';
import {getChromeTranslatorLanguageCode} from '@/entrypoints/utils/languageRegistry';

// 语言代码映射
const languageMap: { [key: string]: string } = {
    'zh-Hans': 'zh',
    'zh-Hant': 'zh-TW',
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'de': 'de',
    'es': 'es',
    'ru': 'ru',
    'it': 'it',
    'pt': 'pt',
    'ar': 'ar',
    'hi': 'hi',
    'th': 'th',
    'vi': 'vi',
    'nl': 'nl',
    'pl': 'pl',
    'tr': 'tr'
};

// 检查是否支持 Chrome Translation API
function isChromeTranslationSupported(): boolean {
    console.log('检查 Translation API 支持:', {
        hasTranslation: 'translation' in self,
        hasTranslator: 'Translator' in self,
        hasLanguageDetector: 'LanguageDetector' in self,
        windowType: typeof window,
        selfType: typeof self
    });
    
    // 检查新的 API
    if ('translation' in self && 'createTranslator' in (self as any).translation) {
        return true;
    }
    
    // 检查旧的 API
    if ('Translator' in self && 'LanguageDetector' in self) {
        return true;
    }
    
    return false;
}

type ChromeTranslatorAvailability = 'ready' | 'downloadable' | 'downloading' | 'unsupported' | 'after-detection';

function normalizeTranslatorAvailability(value: unknown): ChromeTranslatorAvailability {
    if (value === 'available' || value === 'readily' || value === true) return 'ready';
    if (value === 'downloadable' || value === 'after-download') return 'downloadable';
    if (value === 'downloading') return 'downloading';
    return 'unsupported';
}

async function checkChromeTranslationAvailability(from: string, to: string): Promise<ChromeTranslatorAvailability> {
    if (!isChromeTranslationSupported()) return 'unsupported';
    if (from === 'auto') return 'after-detection';

    const sourceLanguage = languageMap[from] || getChromeTranslatorLanguageCode(from);
    const targetLanguage = languageMap[to] || getChromeTranslatorLanguageCode(to);
    if (sourceLanguage === targetLanguage) return 'ready';

    try {
        const translatorApi = (self as any).Translator;
        if (typeof translatorApi?.availability === 'function') {
            return normalizeTranslatorAvailability(await translatorApi.availability({sourceLanguage, targetLanguage}));
        }
        const legacyTranslationApi = (self as any).translation;
        if (typeof legacyTranslationApi?.canTranslate === 'function') {
            return normalizeTranslatorAvailability(await legacyTranslationApi.canTranslate({sourceLanguage, targetLanguage}));
        }
        // A supported implementation without an availability probe is checked
        // lazily by createTranslator/Translator.create during the first request.
        return 'after-detection';
    } catch {
        return 'unsupported';
    }
}

// 检测文本语言
async function detectLanguage(text: string): Promise<string> {
    try {
        // 尝试使用新的 API
        if ('translation' in self && 'createDetector' in (self as any).translation) {
            const detector = await (self as any).translation.createDetector();
            const results = await detector.detect(text);
            const detected = results.length > 0 ? results[0].detectedLanguage : 'en';
            console.log('新 API 检测结果:', detected);
            return detected;
        }
        
        // 尝试使用旧的 API
        if ('LanguageDetector' in self) {
            const detector = await (self as any).LanguageDetector.create();
            const results = await detector.detect(text);
            const detected = results.length > 0 ? results[0].detectedLanguage : 'en';
            console.log('旧 API 检测结果:', detected);
            return detected;
        }
    } catch (error) {
        console.warn('Language detection failed');
    }
    
    // 回退到简单检测
    const chineseRegex = /[\u4e00-\u9fff]/;
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanRegex = /[\uac00-\ud7af]/;
    
    if (chineseRegex.test(text)) {
        return 'zh';
    } else if (japaneseRegex.test(text)) {
        return 'ja';
    } else if (koreanRegex.test(text)) {
        return 'ko';
    } else {
        return 'en';
    }
}

// 执行翻译
async function performTranslation(text: string, fromLang: string, toLang: string): Promise<string> {
    try {
        let translator;
        
        // 尝试使用新的 API
        if ('translation' in self && 'createTranslator' in (self as any).translation) {
            console.log('使用新的 translation API');
            translator = await (self as any).translation.createTranslator({
                sourceLanguage: fromLang,
                targetLanguage: toLang
            });
        }
        // 尝试使用旧的 API
        else if ('Translator' in self) {
            console.log('使用旧的 Translator API');
            translator = await (self as any).Translator.create({
                sourceLanguage: fromLang,
                targetLanguage: toLang
            });
        } else {
            throw new Error('没有可用的翻译 API');
        }

        let translatedText = '';
        
        // 检查是否支持流式翻译
        if (translator.translateStreaming) {
            console.log('使用流式翻译');
            const stream = translator.translateStreaming(text);
            for await (const chunk of stream) {
                translatedText += chunk;
            }
        } else if (translator.translate) {
            console.log('使用普通翻译');
            translatedText = await translator.translate(text);
        } else {
            throw new Error('翻译器不支持翻译方法');
        }

        return translatedText;
        
    } catch (error) {
        console.error('翻译执行失败');
        throw error;
    }
}

// 处理翻译请求
async function handleTranslationRequest(data: any): Promise<string> {
    const { text, from, to } = data;
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return ""
    }

    // 检查是否支持 Chrome Translation API
    if (!isChromeTranslationSupported()) {
        throw new Error('当前浏览器不支持 Chrome Translation API，请确保使用 Google Chrome 浏览器 v138 stable 或更高版本。');
    }

    // 声明变量以便在 catch 块中使用
    let detectedLang = from;
    let fromLang = from;
    let toLang = to;
    
    try {
        // 检测源语言
        if (from === 'auto') {
            detectedLang = await detectLanguage(text);
            console.log('自动检测到的语言:', detectedLang);
        }
        
        // 映射语言代码 - 确保使用 Chrome API 支持的格式
        fromLang = languageMap[detectedLang] || getChromeTranslatorLanguageCode(detectedLang);
        toLang = languageMap[to] || getChromeTranslatorLanguageCode(to);

        console.log('语言映射:', { 
            original: { from, to }, 
            detected: detectedLang,
            mapped: { fromLang, toLang }
        });

        // 如果源语言和目标语言相同，不需要翻译
        if (fromLang === toLang) {
            console.log('源语言和目标语言相同，返回原文');
            return text;
        }

        // 执行翻译
        return await performTranslation(text, fromLang, toLang);

    } catch (error) {
        console.error('Chrome Translation API error');
        
        // 提供更友好的错误信息
        if (error instanceof Error) {
            if (error.message.includes('not available') || error.message.includes('not ready')) {
                throw new Error('Chrome Translation API 暂时不可用。可能需要下载语言模型，请稍后重试。');
            } else if (error.message.includes('language') || error.message.includes('not supported')) {
                throw new Error(`不支持的语言组合：${fromLang} -> ${toLang}。请尝试其他语言对或检查浏览器版本。`);
            } else if (error.message.includes('model')) {
                throw new Error('翻译模型未就绪，请稍后重试或检查网络连接。');
            }
        }
        
        throw new Error(`翻译失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
}

// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CHROME_TRANSLATE_OFFSCREEN') {
        handleTranslationRequest(message.data)
            .then(result => {
                sendResponse({ success: true, result });
            })
            .catch(error => {
                console.error('Offscreen 翻译失败');
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // 保持消息通道开放以支持异步响应
    }

    if (message.type === 'MERCURY_CHROME_TRANSLATOR_AVAILABILITY_OFFSCREEN') {
        checkChromeTranslationAvailability(message.from, message.to)
            .then(availability => sendResponse({success: true, availability}))
            .catch(error => sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
            }));
        return true;
    }

    if (message.type === 'FLUENT_READ_IMAGE_OCR_OFFSCREEN') {
        recognizeImage(message.image, message.sourceLanguage)
            .then(lines => sendResponse({ success: true, lines }))
            .catch(error => {
                console.error('图片 OCR 失败');
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    }

    if (message.type === 'FLUENT_READ_IMAGE_TRANSLATE_OFFSCREEN') {
        translateImageInOffscreen(message.image, message.sourceLanguage, message.title || '', {
            serviceOverride: typeof message.serviceOverride === 'string' ? message.serviceOverride : undefined,
            consentScopeId: typeof message.consentScopeId === 'string' ? message.consentScopeId : undefined,
        })
            .then(result => {
                if (result && typeof result === 'object' && 'type' in result && result.type === 'network-consent-required') {
                    sendResponse(result);
                    return;
                }
                sendResponse({ success: true, ...result });
            })
            .catch(error => {
                console.error('图片翻译失败');
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    }

    if (message.type === 'FLUENT_READ_AREA_TRANSLATE_OFFSCREEN') {
        translateAreaInOffscreen(message.image, message.sourceLanguage, message.title || '', message.selection, {
            serviceOverride: typeof message.serviceOverride === 'string' ? message.serviceOverride : undefined,
            consentScopeId: typeof message.consentScopeId === 'string' ? message.consentScopeId : undefined,
        })
            .then(result => {
                if (result && typeof result === 'object' && 'type' in result && result.type === 'network-consent-required') {
                    sendResponse(result);
                    return;
                }
                sendResponse({ success: true, ...result });
            })
            .catch(error => {
                console.error('圈选翻译失败');
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    }

    if (message.type === 'FLUENT_READ_IMAGE_OCR_DOWNLOAD_OFFSCREEN') {
        downloadImageOcrLanguages(message.languages || [])
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error('图片 OCR 语言包下载失败');
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    }

    if (message.type === 'MERCURY_IMAGE_OCR_CLEAR_OFFSCREEN') {
        clearImageOcrLanguages()
            .then(() => sendResponse({ success: true }))
            .catch(error => {
                console.error('OCR 语言包清除失败');
                sendResponse({
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                });
            });

        return true;
    }
    
    return false;
});

// 初始化检查
console.log('Chrome Translation Offscreen 初始化');
console.log('Translation API 支持状态:', isChromeTranslationSupported());
