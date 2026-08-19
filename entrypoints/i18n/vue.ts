import { createI18n } from 'vue-i18n';
import { DEFAULT_UI_LOCALE, messages, type UiLocale } from './messages';
import { getStoredUiLocalePreference, resolveUiLocalePreference, watchStoredUiLocalePreference, type UiLocalePreference } from './preferences';

export async function createMercuryI18n(preference?: UiLocalePreference) {
  const storedPreference = preference ?? await getStoredUiLocalePreference();
  const locale = resolveUiLocalePreference(storedPreference);

  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: DEFAULT_UI_LOCALE,
    messages: messages as unknown as Record<UiLocale, typeof messages[typeof DEFAULT_UI_LOCALE]>,
  });
}

type MercuryI18n = Awaited<ReturnType<typeof createMercuryI18n>>;

export function bindMercuryI18nLocale(i18n: MercuryI18n): () => void {
  return watchStoredUiLocalePreference((locale) => {
    i18n.global.locale.value = locale;
  });
}
