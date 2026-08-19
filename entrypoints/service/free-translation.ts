import { translateMicrosoftTexts } from '@/entrypoints/service/microsoft';
import { translateGoogleText } from '@/entrypoints/service/google';
import { config } from '@/entrypoints/utils/config';
import {
  consumeNetworkProviderConsent,
  createNetworkConsentRequiredOutcome,
  type NetworkConsentRequiredOutcome,
} from '@/entrypoints/utils/providerConsent';
import { services } from '@/entrypoints/utils/option';

export const FREE_TRANSLATION_PROVIDER_IDS = [services.microsoft, services.google] as const;
export type FreeTranslationProviderId = typeof FREE_TRANSLATION_PROVIDER_IDS[number];

/**
 * Kept as a compatibility export for older callers. It is no longer a fallback
 * order: callers must name exactly one provider before any text is sent.
 */
export const FREE_TRANSLATION_ORDER = ['微软翻译', '谷歌翻译'] as const;

function isFreeTranslationProviderId(value: unknown): value is FreeTranslationProviderId {
  return typeof value === 'string' && (FREE_TRANSLATION_PROVIDER_IDS as readonly string[]).includes(value);
}

function requireTranslation(text: string, provider: string): string {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error(`${provider}未返回有效译文`);
  }
  return text;
}

async function translateWithProvider(text: string, provider: FreeTranslationProviderId): Promise<string> {
  if (provider === services.microsoft) {
    const translations = await translateMicrosoftTexts([text], config.from, config.to);
    return requireTranslation(translations[0] || '', '微软翻译');
  }

  return requireTranslation(
    await translateGoogleText(text, config.from, config.to),
    '谷歌翻译',
  );
}

async function authorizeProvider(provider: unknown, consentScopeId?: string): Promise<FreeTranslationProviderId | NetworkConsentRequiredOutcome> {
  if (!isFreeTranslationProviderId(provider)) {
    return createNetworkConsentRequiredOutcome('network-provider-not-approved');
  }

  if (!await consumeNetworkProviderConsent(provider, consentScopeId)) {
    return createNetworkConsentRequiredOutcome('network-provider-not-approved', provider);
  }

  return provider;
}

/**
 * The former implementation silently chained Microsoft → DeepLX → Google.
 * This compatibility function now contacts only the explicitly approved
 * provider and returns a typed outcome before making any network request.
 */
export async function translateFreeText(
  text: string,
  provider?: FreeTranslationProviderId,
  consentScopeId?: string,
): Promise<string | NetworkConsentRequiredOutcome> {
  if (typeof text !== 'string') {
    throw new Error('免费翻译服务仅支持文本输入');
  }

  const approvedProvider = await authorizeProvider(provider, consentScopeId);
  if (typeof approvedProvider !== 'string') return approvedProvider;
  return translateWithProvider(text, approvedProvider);
}

async function freeTranslation(message: { origin: string | string[]; provider?: FreeTranslationProviderId; consentScopeId?: string }) {
  const approvedProvider = await authorizeProvider(message.provider, message.consentScopeId);
  if (typeof approvedProvider !== 'string') return approvedProvider;

  if (typeof message.origin === 'string') {
    return translateWithProvider(message.origin, approvedProvider);
  }

  if (Array.isArray(message.origin)) {
    return Promise.all(message.origin.map((text) => {
      if (typeof text !== 'string') throw new Error('免费翻译服务仅支持文本输入');
      return translateWithProvider(text, approvedProvider);
    }));
  }

  throw new Error('免费翻译服务仅支持文本输入');
}

export default freeTranslation;
