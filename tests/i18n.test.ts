import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createI18n } from 'vue-i18n';
import {
  DEFAULT_UI_LOCALE,
  createTranslator,
  messages,
  normalizeUiLocale,
  SUPPORTED_UI_LOCALES,
  t,
  type UiLocale,
} from '@/entrypoints/i18n/runtime';
import { getLocalizedOptions } from '@/entrypoints/utils/option';
import { getLocalizedImageOcrLanguagePacks } from '@/entrypoints/utils/imageOcrLanguages';
import { localizeStructuredErrorResponse, OCR_MODEL_MISSING_ERROR_CODE } from '@/entrypoints/i18n/errors';
import {
  getStoredUiLocalePreference,
  normalizeUiLocalePreference,
  saveUiLocalePreference,
  UI_LOCALE_STORAGE_KEY,
  watchStoredUiLocalePreference,
  type UiLocalePreferenceStorage,
} from '@/entrypoints/i18n/preferences';

function flattenKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key));
}

function readChromeLocale(locale: string) {
  return JSON.parse(readFileSync(resolve(__dirname, `../public/_locales/${locale}/messages.json`), 'utf8')) as Record<string, { message: string }>;
}

describe('Mercury Translate i18n', () => {
  it('keeps all UI locales on the same message schema', () => {
    const expectedKeys = flattenKeys(messages[DEFAULT_UI_LOCALE]);

    for (const locale of SUPPORTED_UI_LOCALES) {
      expect(flattenKeys(messages[locale]).sort(), `${locale} message keys`).toEqual(expectedKeys.sort());
    }
  });

  it('compiles every UI message without Vue I18n syntax errors', () => {
    const errors: unknown[][] = [];
    const warnings: unknown[][] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation((...args) => warnings.push(args));
    try {
      for (const locale of SUPPORTED_UI_LOCALES) {
        const i18n = createI18n({
          legacy: false,
          locale,
          fallbackLocale: DEFAULT_UI_LOCALE,
          messages,
        });
        for (const path of flattenKeys(messages[locale])) {
          i18n.global.t(path);
        }
      }
      expect(errors).toEqual([]);
      expect(warnings).toEqual([]);
    } finally {
      consoleError.mockRestore();
      consoleWarn.mockRestore();
    }
  });

  it('normalizes browser locale aliases to supported UI locales', () => {
    expect(normalizeUiLocale('zh_CN')).toBe('zh-CN');
    expect(normalizeUiLocale('zh-HK')).toBe('zh-TW');
    expect(normalizeUiLocale('en-US')).toBe('en');
    expect(normalizeUiLocale('fr-FR')).toBe('en');
  });

  it('returns translated brand strings with English fallback', () => {
    expect(t('brand.productName', 'zh-CN')).toBe('Mercury Translate');
    expect(t('brand.productSubtitle', 'zh-TW')).toBe('水星翻譯');
    expect(t('brand.openSourceProject', 'en')).toBe('Open source project');
  });

  it('localizes settings option labels and OCR pack copy for every UI locale', () => {
    const expected = {
      en: { service: 'Microsoft Translator (online)', newapi: 'OpenAI-compatible / Sub2API', display: 'Translation only', ocr: 'Simplified Chinese' },
      'zh-CN': { service: '微软翻译（联网）', newapi: 'OpenAI 兼容 / Sub2API', display: '仅译文模式', ocr: '简体中文' },
      'zh-TW': { service: '微軟翻譯（聯網）', newapi: 'OpenAI 相容 / Sub2API', display: '僅譯文模式', ocr: '簡體中文' },
    } satisfies Record<UiLocale, { service: string; newapi: string; display: string; ocr: string }>;

    for (const locale of SUPPORTED_UI_LOCALES) {
      const translate = createTranslator(locale);
      const localized = getLocalizedOptions(translate);
      const ocrPacks = getLocalizedImageOcrLanguagePacks(translate);
      expect(localized.services.find(item => item.value === 'microsoft')?.label).toBe(expected[locale].service);
      expect(localized.services.find(item => item.value === 'newapi')?.label).toBe(expected[locale].newapi);
      expect(localized.display.find(item => item.value === 0)?.label).toBe(expected[locale].display);
      expect(ocrPacks.find(item => item.code === 'chi_sim')?.label).toBe(expected[locale].ocr);
      expect(translate('hotkey.title')).not.toBe('hotkey.title');
      expect(translate('serviceCatalog.searchServices')).not.toBe('serviceCatalog.searchServices');
    }
  });

  it('provides Chrome locale metadata for every supported UI locale', () => {
    const chromeLocales: Record<UiLocale, string> = {
      en: 'en',
      'zh-CN': 'zh_CN',
      'zh-TW': 'zh_TW',
    };

    for (const locale of SUPPORTED_UI_LOCALES) {
      const chromeMessages = readChromeLocale(chromeLocales[locale]);
      expect(chromeMessages.extensionName.message).toBe(messages[locale].extension.name);
      expect(chromeMessages.extensionDescription.message).toBe(messages[locale].extension.description);
    }
  });

  it('persists an explicit UI locale preference and falls back to auto for invalid values', async () => {
    const storageState: Record<string, unknown> = {};
    const get = vi.fn(async (key: string) => ({ [key]: storageState[key] }));
    const set = vi.fn(async (value: Record<string, unknown>) => {
      Object.assign(storageState, value);
    });
    const addListener = vi.fn();
    const removeListener = vi.fn();
    const storage: UiLocalePreferenceStorage = {
      local: { get, set },
      onChanged: { addListener, removeListener },
    };

    expect(normalizeUiLocalePreference('fr-FR')).toBe('auto');
    expect(normalizeUiLocalePreference('zh_HK')).toBe('auto');
    expect(await getStoredUiLocalePreference(storage)).toBe('auto');

    await saveUiLocalePreference('zh-TW', storage);
    expect(set).toHaveBeenCalledWith({ [UI_LOCALE_STORAGE_KEY]: 'zh-TW' });
    expect(await getStoredUiLocalePreference(storage)).toBe('zh-TW');

    const listener = vi.fn();
    const stop = watchStoredUiLocalePreference(listener, storage);
    expect(addListener).toHaveBeenCalledTimes(1);
    const storageListener = addListener.mock.calls[0][0];
    storageListener({ [UI_LOCALE_STORAGE_KEY]: { newValue: 'zh-CN' } }, 'local');
    storageListener({ [UI_LOCALE_STORAGE_KEY]: { newValue: 'zh-TW' } }, 'sync');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('zh-CN', 'zh-CN');
    stop();
    expect(removeListener).toHaveBeenCalledWith(storageListener);
  });

  it('falls back to auto when preference storage is unavailable', async () => {
    const storage: UiLocalePreferenceStorage = {
      local: {
        get: vi.fn(async () => {
          throw new Error('storage unavailable');
        }),
        set: vi.fn(async () => undefined),
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    };

    await expect(getStoredUiLocalePreference(storage)).resolves.toBe('auto');
  });

  it('localizes structured OCR model errors client-side', () => {
    const error = localizeStructuredErrorResponse({
      success: false,
      code: OCR_MODEL_MISSING_ERROR_CODE,
      details: { languages: ['eng', 'chi_sim'] },
    }, 'error.pdfOcrUnavailable', 'zh-CN');

    expect(error.message).toBe('OCR 语言模型尚未准备好。请先在设置 > 图片翻译中下载 eng, chi_sim。');
  });
});
