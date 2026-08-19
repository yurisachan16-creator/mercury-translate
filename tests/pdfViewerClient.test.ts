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

import {createRuntimePdfViewerClient} from '@/entrypoints/utils/pdfViewerClient';
import type {PdfTranslationRequest} from '@/entrypoints/types/pdf';

const request: PdfTranslationRequest = {
  documentFingerprint: 'doc:test',
  pageIndex: 0,
  sourceLanguage: 'en',
  targetLanguage: 'zh-Hans',
  providerId: 'chromeTranslator',
  segments: [{id: '0:0', text: 'Hello', contentHash: 'hash'}],
};

const consentOutcome = {
  type: 'network-consent-required' as const,
  reason: 'local-provider-unavailable' as const,
  providerId: null,
  privacyBoundary: 'network-free' as const,
  availableProviders: ['microsoft', 'google'],
  message: 'Choose a network provider.',
};

describe('PDF viewer runtime client', () => {
  beforeEach(() => {
    mocks.sendMessage.mockReset();
    mocks.requestConsent.mockReset();
  });

  it('preserves stable segment IDs in a successful response', async () => {
    mocks.sendMessage.mockResolvedValue({
      success: true,
      translations: [{id: '0:0', translation: '你好'}],
    });

    const client = createRuntimePdfViewerClient(mocks.sendMessage);
    await expect(client.translatePage(request)).resolves.toEqual({
      translations: [{id: '0:0', translation: '你好'}],
    });
  });

  it('checks provider availability without translating PDF text', async () => {
    mocks.sendMessage.mockResolvedValue({success: true, availability: 'downloadable'});
    const client = createRuntimePdfViewerClient(mocks.sendMessage);

    await expect(client.checkProviderAvailability('chromeTranslator', 'en', 'zh-Hans')).resolves.toBe('downloadable');

    expect(mocks.sendMessage).toHaveBeenCalledWith({
      type: 'provider.checkAvailability',
      providerId: 'chromeTranslator',
      from: 'en',
      to: 'zh-Hans',
    });
  });

  it('retries only after explicit consent and keeps that provider for later pages', async () => {
    mocks.sendMessage
      .mockResolvedValueOnce(consentOutcome)
      .mockResolvedValue({success: true, translations: [{id: '0:0', translation: '你好'}]});
    mocks.requestConsent.mockResolvedValue({providerId: 'microsoft', mode: 'once'});
    const selected = vi.fn();
    const client = createRuntimePdfViewerClient(mocks.sendMessage, {onProviderSelected: selected});

    await client.translatePage(request);
    await client.translatePage({...request, pageIndex: 1});

    const scopedRequest = {...request, consentScopeId: expect.any(String)};
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(1, {type: 'pdf.translatePage', request: scopedRequest});
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(2, {
      type: 'pdf.translatePage',
      request: {...scopedRequest, providerId: 'microsoft'},
    });
    expect(mocks.sendMessage).toHaveBeenNthCalledWith(3, {
      type: 'pdf.translatePage',
      request: {...scopedRequest, pageIndex: 1, providerId: 'microsoft'},
    });
    expect(selected).toHaveBeenCalledWith('microsoft');
  });

  it('does not retry or send text after the user cancels consent', async () => {
    mocks.sendMessage.mockResolvedValue(consentOutcome);
    mocks.requestConsent.mockResolvedValue(null);
    const client = createRuntimePdfViewerClient(mocks.sendMessage);

    await expect(client.translatePage(request)).rejects.toMatchObject({
      name: 'NetworkConsentRequiredError',
    });
    expect(mocks.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch an already-cancelled request', async () => {
    const client = createRuntimePdfViewerClient(mocks.sendMessage);
    const controller = new AbortController();
    controller.abort();

    await expect(client.translatePage(request, controller.signal)).rejects.toMatchObject({name: 'AbortError'});
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });
});
