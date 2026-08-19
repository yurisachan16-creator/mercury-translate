import { describe, expect, it } from 'vitest';
import {
  getLanguageDescriptor,
  getProviderLanguageCode,
  getOcrLanguageCodesForSource,
  getSourceLanguageOptions,
  getTranslationTargetOptions,
  getTranslationTargetOptionsForProvider,
  LANGUAGE_REGISTRY,
  OCR_LANGUAGE_CODES,
} from '@/entrypoints/utils/languageRegistry';
import { getRequiredImageOcrLanguages, IMAGE_OCR_LANGUAGE_PACKS, normalizeImageOcrLanguageCodes } from '@/entrypoints/utils/imageOcrLanguages';
import { options } from '@/entrypoints/utils/option';

describe('language registry', () => {
  it('defines unique BCP-47 language descriptors', () => {
    const codes = LANGUAGE_REGISTRY.map((language) => language.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('zh-Hans');
    expect(codes).toContain('zh-Hant');
    expect(codes).toContain('en');
  });

  it('maps v0.1 OCR languages through a single registry', () => {
    expect(OCR_LANGUAGE_CODES).toEqual(['eng', 'chi_sim', 'chi_tra', 'jpn', 'kor']);
    expect(IMAGE_OCR_LANGUAGE_PACKS.map((pack) => pack.code).sort()).toEqual([...OCR_LANGUAGE_CODES].sort());
    expect(getLanguageDescriptor('zh-Hant')?.ocrCode).toBe('chi_tra');
    expect(getLanguageDescriptor('ko')?.ocrCode).toBe('kor');
    expect(getProviderLanguageCode('zh-Hans', 'google')).toBe('zh-CN');
    expect(getProviderLanguageCode('zh-Hant', 'microsoft')).toBe('zh-Hant');
  });

  it('keeps legacy image OCR helpers aligned with the registry', () => {
    expect(getRequiredImageOcrLanguages('zh-Hant')).toEqual(['chi_tra', 'eng']);
    expect(getRequiredImageOcrLanguages('ko')).toEqual(['kor', 'eng']);
    expect(getRequiredImageOcrLanguages('en')).toEqual(['eng']);
    expect(normalizeImageOcrLanguageCodes(['eng', 'kor', 'missing', 'kor'])).toEqual(['eng', 'kor']);
  });

  it('derives existing option language lists from the central registry', () => {
    expect(getSourceLanguageOptions()).toEqual([{ value: 'auto', label: '自动检测' }]);
    expect(options.form).toEqual(getSourceLanguageOptions());
    expect(options.to).toEqual(getTranslationTargetOptions(['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'ru']));
    expect(options.inputBoxTranslationTarget).toEqual(getTranslationTargetOptions());
  });

  it('derives target choices from the active provider capability namespace', () => {
    const google = getTranslationTargetOptionsForProvider('google');
    const local = getTranslationTargetOptionsForProvider('chromeTranslator');
    expect(google.map(option => option.value)).toEqual(local.map(option => option.value));
    expect(google).toHaveLength(LANGUAGE_REGISTRY.length);
  });
});
