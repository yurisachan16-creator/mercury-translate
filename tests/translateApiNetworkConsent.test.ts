import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  saveConfig: vi.fn(async () => undefined),
  requestNetworkProviderConsent: vi.fn(),
  config: {
    count: 0,
    maxConcurrentTranslations: 6,
    model: { chromeTranslator: '', microsoft: '', google: '' } as Record<string, string>,
    customModel: { chromeTranslator: '', microsoft: '', google: '' } as Record<string, string>,
    service: 'chromeTranslator',
    videoService: 'chromeTranslator',
    to: 'zh-Hans',
    useCache: true,
    enableAIContext: false,
  },
}));

vi.mock('webextension-polyfill', () => ({
  default: { runtime: { sendMessage: mocks.sendMessage } },
}));
vi.mock('@/entrypoints/utils/config', () => ({
  config: mocks.config,
  saveConfig: mocks.saveConfig,
}));
vi.mock('@/entrypoints/utils/common', () => ({ detectlang: () => 'en' }));
vi.mock('@/entrypoints/utils/option', () => ({
  services: {
    microsoft: 'microsoft',
    freeTranslation: 'freeTranslation',
    deeplx: 'deeplx',
    google: 'google',
    chromeTranslator: 'chromeTranslator',
    custom: 'custom',
  },
  resolveConfiguredModel: (model: string) => model,
  servicesType: { isUseAIContext: () => false },
}));
vi.mock('@/entrypoints/utils/pageContext', () => ({ getPageTranslationContext: vi.fn() }));
vi.mock('@/entrypoints/utils/configValidation', () => ({ getMissingCredentialMessage: () => null }));
vi.mock('@/entrypoints/utils/networkConsentUi', () => ({
  requestNetworkProviderConsent: mocks.requestNetworkProviderConsent,
}));

import {
  cancelAllTranslations,
  translateText,
  translateTextBatch,
  translateVideoText,
} from '@/entrypoints/utils/translateApi';
import { clearTranslationQueue } from '@/entrypoints/utils/translateQueue';

const consentOutcome = {
  type: 'network-consent-required',
  reason: 'local-provider-unavailable',
  providerId: null,
  privacyBoundary: 'network-free',
  availableProviders: ['microsoft', 'google'],
  message: 'Choose a network provider.',
};

describe('translation API network consent UX', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.sendMessage.mockReset();
    mocks.saveConfig.mockClear();
    mocks.requestNetworkProviderConsent.mockReset();
    mocks.config.count = 0;
    mocks.config.service = 'chromeTranslator';
    mocks.config.videoService = 'chromeTranslator';
    globalThis.document = { title: 'Video title' } as Document;
  });

  afterEach(async () => {
    clearTranslationQueue();
    cancelAllTranslations();
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('asks once, sends no network retry before consent, then retries direct text with the selected provider', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce('译文');
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce({ providerId: 'microsoft', mode: 'once' });

    await expect(translateText('Readable source', 'Context', { maxRetries: 3 })).resolves.toBe('译文');

    expect(mocks.requestNetworkProviderConsent).toHaveBeenCalledWith(consentOutcome, undefined);
    expect(mocks.sendMessage).toHaveBeenCalledTimes(2);
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(1, expect.objectContaining({
      origin: 'Readable source',
      serviceOverride: undefined,
    }));
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      origin: 'Readable source',
      serviceOverride: 'microsoft',
    }));
  });

  it('does not retry or send consent when the chooser is cancelled', async () => {
    mocks.sendMessage.mockResolvedValueOnce(consentOutcome);
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce(null);

    const outcome = translateText('Readable source', 'Context', { maxRetries: 3 }).catch((error) => error);

    await expect(outcome).resolves.toMatchObject({
      name: 'NetworkConsentRequiredError',
      outcome: consentOutcome,
    });
    expect(mocks.requestNetworkProviderConsent).toHaveBeenCalledOnce();
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('uses the remembered provider decision as the retry override', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce('谷歌译文');
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce({ providerId: 'google', mode: 'remember-default' });

    await expect(translateText('Readable source', 'Context')).resolves.toBe('谷歌译文');

    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      serviceOverride: 'google',
    }));
  });

  it('retries a batch once with the selected provider and preserves segment order', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce(['第一段译文', '第二段译文']);
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce({ providerId: 'microsoft', mode: 'once' });

    await expect(translateTextBatch(['First segment', 'Second segment'], 'Context')).resolves.toEqual([
      '第一段译文',
      '第二段译文',
    ]);

    expect(mocks.requestNetworkProviderConsent).toHaveBeenCalledOnce();
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      origin: ['First segment', 'Second segment'],
      serviceOverride: 'microsoft',
    }));
  });

  it('keeps a session provider override so repeated segments do not prompt again', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce('第一段译文')
      .mockResolvedValueOnce('第二段译文');
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce({ providerId: 'microsoft', mode: 'once' });

    await expect(translateText('First readable source', 'Context')).resolves.toBe('第一段译文');
    await expect(translateText('Second readable source', 'Context')).resolves.toBe('第二段译文');

    expect(mocks.requestNetworkProviderConsent).toHaveBeenCalledTimes(1);
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(3, expect.objectContaining({
      origin: 'Second readable source',
      serviceOverride: 'microsoft',
    }));
  });

  it('handles video subtitle consent through the same selected provider override', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce('字幕译文');
    mocks.requestNetworkProviderConsent.mockResolvedValueOnce({ providerId: 'google', mode: 'once' });

    await expect(translateVideoText('Subtitle source')).resolves.toBe('字幕译文');

    expect(mocks.requestNetworkProviderConsent).toHaveBeenCalledWith(consentOutcome, undefined);
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      origin: 'Subtitle source',
      serviceOverride: 'google',
    }));
  });
});
