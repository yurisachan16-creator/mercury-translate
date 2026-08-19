import { DEFAULT_UI_LOCALE, type UiLocale } from './messages';

const LOCALE_ALIASES: Record<string, UiLocale> = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  zh: 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-SG': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-MO': 'zh-TW',
};

export function normalizeUiLocale(locale?: string | null): UiLocale {
  if (!locale) return DEFAULT_UI_LOCALE;
  if (locale in LOCALE_ALIASES) return LOCALE_ALIASES[locale];
  const normalized = locale.replace('_', '-');
  if (normalized in LOCALE_ALIASES) return LOCALE_ALIASES[normalized];
  const language = normalized.split('-')[0];
  return LOCALE_ALIASES[language] || DEFAULT_UI_LOCALE;
}

export function detectUiLocale(): UiLocale {
  const browserLocale = typeof browser !== 'undefined' && browser.i18n?.getUILanguage
    ? browser.i18n.getUILanguage()
    : undefined;
  const navigatorLocale = typeof navigator !== 'undefined' ? navigator.language : undefined;
  return normalizeUiLocale(browserLocale || navigatorLocale);
}
