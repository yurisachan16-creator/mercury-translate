export type Bcp47LanguageCode =
  | 'zh-Hans'
  | 'zh-Hant'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'ru'
  | 'es'
  | 'de'
  | 'pt'
  | 'it';

export type OcrLanguageCode = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor';
export type ProviderLanguageNamespace = 'google' | 'microsoft' | 'deepl' | 'tesseract';

export type LanguageDescriptor = {
  code: Bcp47LanguageCode;
  label: string;
  nativeName: string;
  chromeTranslatorCode: string;
  providerCodes: Partial<Record<ProviderLanguageNamespace, string>>;
  ocrCode?: OcrLanguageCode;
};

export const SOURCE_AUTO_LANGUAGE = { value: 'auto', label: '自动检测' } as const;

export const OCR_LANGUAGE_CODES: OcrLanguageCode[] = ['eng', 'chi_sim', 'chi_tra', 'jpn', 'kor'];

export const LANGUAGE_REGISTRY: LanguageDescriptor[] = [
  {
    code: 'zh-Hans',
    label: '简体中文',
    nativeName: '简体中文',
    chromeTranslatorCode: 'zh-Hans',
    providerCodes: { google: 'zh-CN', microsoft: 'zh-Hans', deepl: 'ZH-HANS', tesseract: 'chi_sim' },
    ocrCode: 'chi_sim',
  },
  {
    code: 'zh-Hant',
    label: '繁体中文',
    nativeName: '繁體中文',
    chromeTranslatorCode: 'zh-Hant',
    providerCodes: { google: 'zh-TW', microsoft: 'zh-Hant', deepl: 'ZH-HANT', tesseract: 'chi_tra' },
    ocrCode: 'chi_tra',
  },
  {
    code: 'en',
    label: '英语',
    nativeName: 'English',
    chromeTranslatorCode: 'en',
    providerCodes: { google: 'en', microsoft: 'en', deepl: 'EN', tesseract: 'eng' },
    ocrCode: 'eng',
  },
  {
    code: 'ja',
    label: '日语',
    nativeName: '日本語',
    chromeTranslatorCode: 'ja',
    providerCodes: { google: 'ja', microsoft: 'ja', deepl: 'JA', tesseract: 'jpn' },
    ocrCode: 'jpn',
  },
  {
    code: 'ko',
    label: '韩语',
    nativeName: '한국어',
    chromeTranslatorCode: 'ko',
    providerCodes: { google: 'ko', microsoft: 'ko', deepl: 'KO', tesseract: 'kor' },
    ocrCode: 'kor',
  },
  {
    code: 'fr',
    label: '法语',
    nativeName: 'Français',
    chromeTranslatorCode: 'fr',
    providerCodes: { google: 'fr', microsoft: 'fr', deepl: 'FR' },
  },
  {
    code: 'ru',
    label: '俄语',
    nativeName: 'Русский',
    chromeTranslatorCode: 'ru',
    providerCodes: { google: 'ru', microsoft: 'ru', deepl: 'RU' },
  },
  {
    code: 'es',
    label: '西班牙语',
    nativeName: 'Español',
    chromeTranslatorCode: 'es',
    providerCodes: { google: 'es', microsoft: 'es', deepl: 'ES' },
  },
  {
    code: 'de',
    label: '德语',
    nativeName: 'Deutsch',
    chromeTranslatorCode: 'de',
    providerCodes: { google: 'de', microsoft: 'de', deepl: 'DE' },
  },
  {
    code: 'pt',
    label: '葡萄牙语',
    nativeName: 'Português',
    chromeTranslatorCode: 'pt',
    providerCodes: { google: 'pt', microsoft: 'pt', deepl: 'PT' },
  },
  {
    code: 'it',
    label: '意大利语',
    nativeName: 'Italiano',
    chromeTranslatorCode: 'it',
    providerCodes: { google: 'it', microsoft: 'it', deepl: 'IT' },
  },
];

export function getLanguageDescriptor(code: string): LanguageDescriptor | undefined {
  return LANGUAGE_REGISTRY.find((language) => language.code === code);
}

export function getProviderLanguageCode(
  code: string,
  provider: ProviderLanguageNamespace,
): string {
  if (code === 'auto') return 'auto';
  return getLanguageDescriptor(code)?.providerCodes[provider] || code;
}

export function getChromeTranslatorLanguageCode(code: string): string {
  if (code === 'auto') return 'auto';
  return getLanguageDescriptor(code)?.chromeTranslatorCode || code;
}

export function getTranslationTargetOptions(codes: Bcp47LanguageCode[] = LANGUAGE_REGISTRY.map((language) => language.code)) {
  return codes
    .map((code) => getLanguageDescriptor(code))
    .filter((language): language is LanguageDescriptor => Boolean(language))
    .map((language) => ({ value: language.code, label: language.label }));
}

export function getTranslationLanguageDescriptorsForProvider(providerId: string): LanguageDescriptor[] {
  const namespace: ProviderLanguageNamespace | null = providerId === 'google'
    ? 'google'
    : providerId === 'microsoft'
      ? 'microsoft'
      : providerId === 'deepL' || providerId === 'deeplx'
        ? 'deepl'
        : null;

  if (namespace) {
    return LANGUAGE_REGISTRY.filter(language => Boolean(language.providerCodes[namespace]));
  }
  if (providerId === 'chromeTranslator') {
    return LANGUAGE_REGISTRY.filter(language => Boolean(language.chromeTranslatorCode));
  }
  // BYOK/OpenAI-compatible services expose model-specific capabilities. Keep
  // the complete canonical registry available and let the adapter report an
  // unsupported pair without rewriting the BCP 47 language value.
  return [...LANGUAGE_REGISTRY];
}

export function getTranslationTargetOptionsForProvider(providerId: string) {
  return getTranslationLanguageDescriptorsForProvider(providerId)
    .map(language => ({value: language.code, label: language.nativeName}));
}

export function getSourceLanguageOptions() {
  return [SOURCE_AUTO_LANGUAGE];
}

export function getOcrLanguageCodesForSource(sourceLanguage: string): OcrLanguageCode[] {
  const descriptor = getLanguageDescriptor(sourceLanguage);
  if (!descriptor?.ocrCode) return ['chi_sim', 'eng'];
  if (descriptor.ocrCode === 'eng') return ['eng'];
  return [descriptor.ocrCode, 'eng'];
}
