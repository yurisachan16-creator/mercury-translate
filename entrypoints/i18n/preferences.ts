import { type UiLocale } from './messages';
import { detectUiLocale, normalizeUiLocale } from './locale';

export type UiLocalePreference = 'auto' | UiLocale;

export const UI_LOCALE_STORAGE_KEY = 'mercuryUiLocale';

export const UI_LOCALE_OPTIONS: Array<{ value: UiLocalePreference; labelKey: 'locale.auto' | 'locale.en' | 'locale.zhCN' | 'locale.zhTW' }> = [
  { value: 'auto', labelKey: 'locale.auto' },
  { value: 'en', labelKey: 'locale.en' },
  { value: 'zh-CN', labelKey: 'locale.zhCN' },
  { value: 'zh-TW', labelKey: 'locale.zhTW' },
];

export interface UiLocalePreferenceStorage {
  local: {
    get: (key: string) => Promise<Record<string, unknown>>;
    set: (value: Record<string, unknown>) => Promise<void>;
  };
  onChanged: {
    addListener: (listener: (changes: Record<string, { newValue?: unknown }>, areaName: string) => void) => void;
    removeListener: (listener: (changes: Record<string, { newValue?: unknown }>, areaName: string) => void) => void;
  };
}

function getDefaultStorage(): UiLocalePreferenceStorage | undefined {
  const extensionGlobal = globalThis as typeof globalThis & {
    browser?: { storage?: UiLocalePreferenceStorage };
    chrome?: { storage?: UiLocalePreferenceStorage };
  };
  return extensionGlobal.browser?.storage ?? extensionGlobal.chrome?.storage;
}

function requireDefaultStorage(): UiLocalePreferenceStorage {
  const storage = getDefaultStorage();
  if (!storage) throw new Error('Extension storage is unavailable');
  return storage;
}

const PREFERENCE_LOCALE_ALIASES = new Set(['en', 'en-US', 'en-GB', 'zh-CN', 'zh_CN', 'zh-Hans', 'zh-TW', 'zh_TW', 'zh-Hant', 'zh-HK', 'zh-MO']);

export function normalizeUiLocalePreference(value: unknown): UiLocalePreference {
  if (value === 'auto') return 'auto';
  if (typeof value === 'string' && PREFERENCE_LOCALE_ALIASES.has(value)) {
    return normalizeUiLocale(value);
  }
  return 'auto';
}

export function resolveUiLocalePreference(preference: UiLocalePreference): UiLocale {
  return preference === 'auto' ? detectUiLocale() : preference;
}

export async function getStoredUiLocalePreference(storage?: UiLocalePreferenceStorage): Promise<UiLocalePreference> {
  try {
    const resolvedStorage = storage ?? getDefaultStorage();
    if (!resolvedStorage) return 'auto';
    const stored = await resolvedStorage.local.get(UI_LOCALE_STORAGE_KEY);
    return normalizeUiLocalePreference(stored[UI_LOCALE_STORAGE_KEY]);
  } catch {
    return 'auto';
  }
}

export async function saveUiLocalePreference(
  preference: UiLocalePreference,
  storage: UiLocalePreferenceStorage = requireDefaultStorage(),
): Promise<void> {
  await storage.local.set({ [UI_LOCALE_STORAGE_KEY]: normalizeUiLocalePreference(preference) });
}

export function watchStoredUiLocalePreference(
  listener: (locale: UiLocale, preference: UiLocalePreference) => void,
  storage: UiLocalePreferenceStorage = requireDefaultStorage(),
): () => void {
  const onChanged = (
    changes: Record<string, { newValue?: unknown }>,
    areaName: string,
  ) => {
    if (areaName !== 'local' || !(UI_LOCALE_STORAGE_KEY in changes)) return;
    const preference = normalizeUiLocalePreference(changes[UI_LOCALE_STORAGE_KEY]?.newValue);
    listener(resolveUiLocalePreference(preference), preference);
  };

  storage.onChanged.addListener(onChanged);
  return () => storage.onChanged.removeListener(onChanged);
}
