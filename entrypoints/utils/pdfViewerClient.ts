import browser from 'webextension-polyfill';

import type {
  PdfOcrClient,
  PdfOcrLine,
  PdfOcrRequest,
  PdfTranslationClient,
  PdfTranslationRequest,
  PdfTranslationResponse,
  ProviderRuntimeAvailability,
} from '@/entrypoints/types/pdf';
import {
  isNetworkConsentRequiredOutcome,
  getNetworkConsentScopeId,
  NetworkConsentRequiredError,
} from '@/entrypoints/utils/providerConsent';
import {requestNetworkProviderConsent, type NetworkConsentResult} from '@/entrypoints/utils/networkConsentUi';
import {services} from '@/entrypoints/utils/option';
import {OCR_LANGUAGE_ASSET_BASE_URL} from '@/entrypoints/utils/ocrLanguageAssets';
import {requestUrlHostPermission} from '@/entrypoints/utils/providerPermissions';
import {localizeStructuredErrorResponseFromPreference} from '@/entrypoints/i18n/errors';

type RuntimeMessageSender = (message: unknown) => Promise<unknown>;

interface SuccessfulResponse {
  success: true;
}

function isSuccessfulResponse(value: unknown): value is SuccessfulResponse {
  return !!value && typeof value === 'object' && (value as { success?: unknown }).success === true;
}

function responseError(value: unknown, fallback: string): Error {
  const error = value && typeof value === 'object' ? (value as { error?: unknown }).error : undefined;
  return new Error(typeof error === 'string' && error ? error : fallback);
}

function abortError(): Error {
  const error = new Error('PDF translation cancelled');
  error.name = 'AbortError';
  return error;
}

async function abortable<T>(request: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return request;
  if (signal.aborted) throw abortError();
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(abortError());
    };
    signal.addEventListener('abort', onAbort, {once: true});
    request.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

export interface RuntimePdfViewerClient extends PdfTranslationClient, PdfOcrClient {}

export interface RuntimePdfViewerClientOptions {
  onProviderSelected?: (providerId: string) => void;
}

/**
 * Browser-message implementation for the unlisted PDF viewer. It has no
 * provider/network knowledge: the background reuses the established service
 * selection and enforces the user's privacy/consent policy.
 */
export function createRuntimePdfViewerClient(
  sendMessage: RuntimeMessageSender = message => browser.runtime.sendMessage(message),
  options: RuntimePdfViewerClientOptions = {},
): RuntimePdfViewerClient {
  let sessionNetworkProviderOverride: string | undefined;
  let networkConsentRequest: Promise<NetworkConsentResult> | null = null;

  const effectiveProvider = (providerId?: string): string | undefined => {
    if (!sessionNetworkProviderOverride) return providerId;
    if (!providerId || [services.chromeTranslator, services.freeTranslation, services.microsoft, services.google].includes(providerId)) {
      return sessionNetworkProviderOverride;
    }
    return providerId;
  };

  const translatePage = async (
    request: PdfTranslationRequest,
    signal?: AbortSignal,
    consentAttempted = false,
  ): Promise<PdfTranslationResponse> => {
    if (signal?.aborted) throw abortError();
    const effectiveRequest = {
      ...request,
      providerId: effectiveProvider(request.providerId),
      consentScopeId: getNetworkConsentScopeId(),
    };
    const response = await abortable(sendMessage({type: 'pdf.translatePage', request: effectiveRequest}), signal) as unknown;
    if (isNetworkConsentRequiredOutcome(response)) {
      if (consentAttempted) throw new NetworkConsentRequiredError(response);
      networkConsentRequest ||= requestNetworkProviderConsent(response, signal)
        .finally(() => {
          networkConsentRequest = null;
        });
      const decision = await networkConsentRequest;
      if (!decision) throw new NetworkConsentRequiredError(response);
      sessionNetworkProviderOverride = decision.providerId;
      options.onProviderSelected?.(decision.providerId);
      return translatePage({...request, providerId: decision.providerId}, signal, true);
    }
    if (!isSuccessfulResponse(response)) throw responseError(response, 'PDF translation service is unavailable.');
    const translations = (response as { translations?: unknown }).translations;
    if (!Array.isArray(translations)) throw new Error('PDF translation returned an invalid response.');
    return {
      translations: translations.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const value = item as { id?: unknown; translation?: unknown };
        return typeof value.id === 'string' && typeof value.translation === 'string'
          ? [{id: value.id, translation: value.translation}]
          : [];
      }),
    };
  };

  return {
    async checkProviderAvailability(providerId, from, to): Promise<ProviderRuntimeAvailability> {
      const response = await sendMessage({type: 'provider.checkAvailability', providerId, from, to}) as unknown;
      if (!isSuccessfulResponse(response)) throw responseError(response, 'PDF translation provider is unavailable.');
      const availability = (response as { availability?: unknown }).availability;
      if (
        availability === 'ready'
        || availability === 'downloadable'
        || availability === 'downloading'
        || availability === 'unsupported'
        || availability === 'after-detection'
        || availability === 'configured'
      ) return availability;
      throw new Error('PDF translation provider returned an invalid availability state.');
    },

    translatePage,

    async ensureOcrLanguage(language, signal): Promise<void> {
      if (signal?.aborted) throw abortError();
      if (!await requestUrlHostPermission(OCR_LANGUAGE_ASSET_BASE_URL)) {
        throw await localizeStructuredErrorResponseFromPreference(undefined, 'error.pdfOcrDownloadPermissionDenied');
      }
      if (signal?.aborted) throw abortError();
      const response = await abortable(sendMessage({type: 'ocr.ensureLanguage', language}), signal);
      if (!isSuccessfulResponse(response)) throw await localizeStructuredErrorResponseFromPreference(response, 'error.pdfOcrDownloadFailed');
    },

    async recognizePage(request: PdfOcrRequest, signal?: AbortSignal): Promise<PdfOcrLine[]> {
      if (signal?.aborted) throw abortError();
      const response = await abortable(sendMessage({type: 'pdf.ocrPage', request}), signal) as unknown;
      if (!isSuccessfulResponse(response)) throw await localizeStructuredErrorResponseFromPreference(response, 'error.pdfOcrUnavailable');
      const lines = (response as { lines?: unknown }).lines;
      if (!Array.isArray(lines)) throw new Error('PDF OCR returned an invalid response.');
      return lines.flatMap((line) => {
        if (!line || typeof line !== 'object') return [];
        const value = line as { text?: unknown; bbox?: Partial<PdfOcrLine['bbox']> };
        const bbox = value.bbox;
        if (
          typeof value.text !== 'string'
          || !bbox
          || !['x0', 'y0', 'x1', 'y1'].every(key => typeof bbox[key as keyof typeof bbox] === 'number')
        ) return [];
        return [{
          text: value.text,
          bbox: {
            x0: Number(bbox.x0),
            y0: Number(bbox.y0),
            x1: Number(bbox.x1),
            y1: Number(bbox.y1),
          },
        }];
      });
    },

    async cancel(documentFingerprint: string, pageIndex?: number): Promise<void> {
      try {
        await sendMessage({type: 'pdf.cancel', documentFingerprint, pageIndex});
      } catch {
        // Cancellation is local-first. The viewer still aborts its scheduler
        // even when the background has restarted or is unavailable.
      }
    },
  };
}
