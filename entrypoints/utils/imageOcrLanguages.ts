import { getOcrLanguageCodesForSource, OCR_LANGUAGE_CODES, type OcrLanguageCode } from './languageRegistry';
import type { MessagePath } from '../i18n/messages';

export type ImageOcrLanguageCode = OcrLanguageCode;

export type ImageOcrLanguagePack = {
    code: ImageOcrLanguageCode;
    label: string;
    description: string;
    size: string;
    recommended: boolean;
};

export const IMAGE_OCR_LANGUAGE_STATE_KEY = 'fluentReadImageOcrLanguages';

export const IMAGE_OCR_LANGUAGE_PACKS: ImageOcrLanguagePack[] = [
    {
        code: 'chi_sim',
        label: '简体中文',
        description: '识别中文界面、截图和图片文字',
        size: '约 2.5 MB',
        recommended: true,
    },
    {
        code: 'eng',
        label: 'English',
        description: '识别英文和拉丁字母文字',
        size: '约 4.1 MB',
        recommended: true,
    },
    {
        code: 'chi_tra',
        label: '繁體中文',
        description: '識別繁體中文界面、截圖和圖片文字',
        size: '约 2.4 MB',
        recommended: true,
    },
    {
        code: 'jpn',
        label: '日本語',
        description: '识别日文图片和漫画文字',
        size: '约 2.5 MB',
        recommended: false,
    },
    {
        code: 'kor',
        label: '한국어',
        description: '识别韩文图片和字幕截图文字',
        size: '约 1.7 MB',
        recommended: false,
    },
];

export const IMAGE_OCR_RECOMMENDED_LANGUAGES: ImageOcrLanguageCode[] = ['chi_sim', 'chi_tra', 'eng'];

type OcrMessagePath = Extract<MessagePath, `ocr.${string}`>;
export type OcrLanguageTranslator = (path: OcrMessagePath) => string;

const OCR_LANGUAGE_MESSAGE_KEYS: Record<ImageOcrLanguageCode, { label: OcrMessagePath; description: OcrMessagePath }> = {
    chi_sim: { label: 'ocr.simplifiedChinese', description: 'ocr.simplifiedChineseDescription' },
    chi_tra: { label: 'ocr.traditionalChinese', description: 'ocr.traditionalChineseDescription' },
    eng: { label: 'ocr.english', description: 'ocr.englishDescription' },
    jpn: { label: 'ocr.japanese', description: 'ocr.japaneseDescription' },
    kor: { label: 'ocr.korean', description: 'ocr.koreanDescription' },
};

/** Resolve OCR pack copy at render time without changing the persisted pack codes. */
export function getLocalizedImageOcrLanguagePacks(translate: OcrLanguageTranslator): ImageOcrLanguagePack[] {
    return IMAGE_OCR_LANGUAGE_PACKS.map((pack) => {
        const keys = OCR_LANGUAGE_MESSAGE_KEYS[pack.code];
        const size = pack.size.match(/[\d.]+/)?.[0] || pack.size;
        return {
            ...pack,
            label: translate(keys.label),
            description: translate(keys.description),
            size: translate('ocr.size').replace('{size}', size),
        };
    });
}

export function getRequiredImageOcrLanguages(sourceLanguage: string): ImageOcrLanguageCode[] {
    const mappedLanguages = getOcrLanguageCodesForSource(sourceLanguage);
    return mappedLanguages.length ? mappedLanguages : [...IMAGE_OCR_RECOMMENDED_LANGUAGES];
}

export function normalizeImageOcrLanguageCodes(value: unknown): ImageOcrLanguageCode[] {
    if (!Array.isArray(value)) return [];
    const supported = new Set(OCR_LANGUAGE_CODES);
    return [...new Set(value.filter((code): code is ImageOcrLanguageCode => typeof code === 'string' && supported.has(code as ImageOcrLanguageCode)))];
}
