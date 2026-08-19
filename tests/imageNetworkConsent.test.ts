import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  requestConsent: vi.fn(),
}));

vi.mock('webextension-polyfill', () => ({
  default: {runtime: {sendMessage: mocks.sendMessage}},
}));

vi.mock('@/entrypoints/utils/networkConsentUi', () => ({
  requestNetworkProviderConsent: mocks.requestConsent,
}));

vi.mock('@/entrypoints/i18n/errors', () => ({
  localizeStructuredErrorResponseFromPreference: vi.fn(async (_response, key: string) => new Error(key)),
}));

vi.mock('@/entrypoints/utils/providerPermissions', () => ({
  requestUrlHostPermission: vi.fn(),
}));

import {translateImageInExtension} from '@/entrypoints/utils/imageOcrClient';
import {translateCapturedAreaInExtension} from '@/entrypoints/utils/areaTranslationClient';

const consentOutcome = {
  type: 'network-consent-required' as const,
  reason: 'local-provider-unavailable' as const,
  providerId: null,
  privacyBoundary: 'network-free' as const,
  availableProviders: ['microsoft', 'google'],
  message: 'Choose a network provider.',
};

const translatedImageResponse = {
  success: true,
  image: 'data:image/png;base64,translated',
  lines: [{
    text: '你好',
    bbox: {x0: 0, y0: 0, x1: 40, y1: 12},
    confidence: 96,
    backgroundColor: 'rgb(255,255,255)',
  }],
};

const areaSelection = {
  left: 10,
  top: 20,
  width: 120,
  height: 60,
  viewportWidth: 800,
  viewportHeight: 600,
};

describe('image and area translation network consent', () => {
  beforeEach(() => {
    mocks.sendMessage.mockReset();
    mocks.requestConsent.mockReset();
  });

  it('retries image translation only after explicit provider consent', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce(translatedImageResponse);
    mocks.requestConsent.mockResolvedValueOnce({providerId: 'microsoft', mode: 'once'});

    await expect(translateImageInExtension('data:image/png;base64,source', 'eng', 'Page title'))
      .resolves.toEqual({image: translatedImageResponse.image, lines: translatedImageResponse.lines});

    expect(mocks.sendMessage).toHaveBeenNthCalledWith(1, {
      type: 'fluentReadImageTranslate',
      image: 'data:image/png;base64,source',
      sourceLanguage: 'eng',
      title: 'Page title',
      serviceOverride: undefined,
      consentScopeId: expect.any(String),
    });
    expect(mocks.requestConsent).toHaveBeenCalledWith(consentOutcome, undefined);
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, {
      type: 'fluentReadImageTranslate',
      image: 'data:image/png;base64,source',
      sourceLanguage: 'eng',
      title: 'Page title',
      serviceOverride: 'microsoft',
      consentScopeId: expect.any(String),
    });
  });

  it('does not retry image translation when the consent dialog is cancelled', async () => {
    mocks.sendMessage.mockResolvedValueOnce(consentOutcome);
    mocks.requestConsent.mockResolvedValueOnce(null);

    await expect(translateImageInExtension('data:image/png;base64,source', 'eng', 'Page title'))
      .rejects.toMatchObject({name: 'NetworkConsentRequiredError'});

    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('retries area translation only with the selected consented provider', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValueOnce(translatedImageResponse);
    mocks.requestConsent.mockResolvedValueOnce({providerId: 'google', mode: 'once'});

    await expect(translateCapturedAreaInExtension('data:image/png;base64,capture', areaSelection, 'eng', 'Page title'))
      .resolves.toEqual({image: translatedImageResponse.image, lines: translatedImageResponse.lines});

    expect(mocks.sendMessage).toHaveBeenNthCalledWith(1, {
      type: 'fluentReadAreaTranslateCapture',
      image: 'data:image/png;base64,capture',
      selection: areaSelection,
      sourceLanguage: 'eng',
      title: 'Page title',
      serviceOverride: undefined,
      consentScopeId: expect.any(String),
    });
    expect(mocks.requestConsent).toHaveBeenCalledWith(consentOutcome, undefined);
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, {
      type: 'fluentReadAreaTranslateCapture',
      image: 'data:image/png;base64,capture',
      selection: areaSelection,
      sourceLanguage: 'eng',
      title: 'Page title',
      serviceOverride: 'google',
      consentScopeId: expect.any(String),
    });
  });

  it('does not retry area translation when the consent dialog is cancelled', async () => {
    mocks.sendMessage.mockResolvedValueOnce(consentOutcome);
    mocks.requestConsent.mockResolvedValueOnce(null);

    await expect(translateCapturedAreaInExtension('data:image/png;base64,capture', areaSelection, 'eng', 'Page title'))
      .rejects.toMatchObject({name: 'NetworkConsentRequiredError'});

    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });
});
