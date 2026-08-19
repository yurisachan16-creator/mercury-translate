import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockConfig, microsoftMock, googleMock, consumeConsentMock } = vi.hoisted(() => ({
  mockConfig: { from: 'auto', to: 'zh-Hans' },
  microsoftMock: vi.fn(),
  googleMock: vi.fn(),
  consumeConsentMock: vi.fn(),
}));

vi.mock('@/entrypoints/utils/config', () => ({ config: mockConfig }));
vi.mock('@/entrypoints/utils/option', () => ({
  services: {
    microsoft: 'microsoft',
    google: 'google',
  },
}));
vi.mock('@/entrypoints/service/microsoft', () => ({ translateMicrosoftTexts: microsoftMock }));
vi.mock('@/entrypoints/service/google', () => ({ translateGoogleText: googleMock }));
vi.mock('@/entrypoints/utils/providerConsent', () => ({
  consumeNetworkProviderConsent: consumeConsentMock,
  createNetworkConsentRequiredOutcome: (reason: string, providerId: string | null = null) => ({
    type: 'network-consent-required',
    reason,
    providerId,
  }),
}));

import freeTranslation, {
  FREE_TRANSLATION_ORDER,
  translateFreeText,
} from '@/entrypoints/service/free-translation';

beforeEach(() => {
  vi.clearAllMocks();
  consumeConsentMock.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('免费联网翻译服务', () => {
  it('does not choose a provider or send text without an explicit choice', async () => {
    await expect(translateFreeText('Hello')).resolves.toMatchObject({
      type: 'network-consent-required',
      reason: 'network-provider-not-approved',
    });
    expect(microsoftMock).not.toHaveBeenCalled();
    expect(googleMock).not.toHaveBeenCalled();
  });

  it('does not send text when an explicit provider lacks consent', async () => {
    consumeConsentMock.mockResolvedValue(false);

    await expect(translateFreeText('Hello', 'microsoft')).resolves.toMatchObject({
      type: 'network-consent-required',
      providerId: 'microsoft',
    });
    expect(microsoftMock).not.toHaveBeenCalled();
    expect(googleMock).not.toHaveBeenCalled();
  });

  it('uses only the explicitly consented provider', async () => {
    microsoftMock.mockResolvedValue(['微软译文']);

    await expect(translateFreeText('Hello', 'microsoft')).resolves.toBe('微软译文');
    expect(microsoftMock).toHaveBeenCalledWith(['Hello'], 'auto', 'zh-Hans');
    expect(googleMock).not.toHaveBeenCalled();
  });

  it('does not fall back from a failed selected provider to another network provider', async () => {
    microsoftMock.mockRejectedValue(new Error('HTTP 503'));

    await expect(translateFreeText('Hello', 'microsoft')).rejects.toThrow('HTTP 503');
    expect(microsoftMock).toHaveBeenCalledOnce();
    expect(googleMock).not.toHaveBeenCalled();
    expect(FREE_TRANSLATION_ORDER).toEqual(['微软翻译', '谷歌翻译']);
  });

  it('authorizes one batch request once, then calls only its named provider', async () => {
    googleMock.mockImplementation(async (text: string) => `${text} 的译文`);

    await expect(freeTranslation({ origin: ['Hello', 'World'], provider: 'google' })).resolves.toEqual([
      'Hello 的译文',
      'World 的译文',
    ]);
    expect(consumeConsentMock).toHaveBeenCalledTimes(1);
    expect(googleMock).toHaveBeenCalledTimes(2);
    expect(microsoftMock).not.toHaveBeenCalled();
  });
});
