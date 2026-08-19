import { DEFAULT_UI_LOCALE, messages, SUPPORTED_UI_LOCALES, type MessagePath, type UiLocale } from './messages';
import { detectUiLocale, normalizeUiLocale } from './locale';

export { DEFAULT_UI_LOCALE, detectUiLocale, messages, normalizeUiLocale, SUPPORTED_UI_LOCALES };
export type { MessagePath, UiLocale };

export function createTranslator(locale: UiLocale = detectUiLocale()) {
  return (path: MessagePath) => t(path, locale);
}

export function t(path: MessagePath, locale: UiLocale = detectUiLocale()): string {
  const [section, key] = path.split('.') as [keyof typeof messages.en, string];
  const sectionMessages = messages[locale]?.[section] || messages[DEFAULT_UI_LOCALE][section];
  return (sectionMessages as Record<string, string>)[key]
    || (messages[DEFAULT_UI_LOCALE][section] as Record<string, string>)[key]
    || path;
}
