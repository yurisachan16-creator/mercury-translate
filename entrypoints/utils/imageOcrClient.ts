import browser from 'webextension-polyfill';
import type { OcrLine } from '@/entrypoints/utils/imageTranslationCore';
import {requestUrlHostPermission} from '@/entrypoints/utils/providerPermissions';
import {localizeStructuredErrorResponseFromPreference} from '@/entrypoints/i18n/errors';
import {
    getNetworkConsentScopeId,
    isNetworkConsentRequiredOutcome,
    NetworkConsentRequiredError,
    type NetworkConsentRequiredOutcome,
} from '@/entrypoints/utils/providerConsent';
import {requestNetworkProviderConsent} from '@/entrypoints/utils/networkConsentUi';

interface ImageTranslationLine extends OcrLine {
    backgroundColor: string;
}

interface ImageTranslationResponse {
    success: boolean;
    image?: string;
    lines?: ImageTranslationLine[];
    error?: string;
}

type ImageTranslationRuntimeResponse = ImageTranslationResponse | NetworkConsentRequiredOutcome | undefined;

interface ImageOcrResponse {
    success: boolean;
    lines?: OcrLine[];
    error?: string;
}

interface ImageFetchResponse {
    success: boolean;
    image?: string;
    error?: string;
}

export async function recognizeImageInExtension(image: string, sourceLanguage: string): Promise<OcrLine[]> {
    const response = await browser.runtime.sendMessage({
        type: 'fluentReadImageOcr',
        image,
        sourceLanguage,
    }) as ImageOcrResponse | undefined;

    if (!response?.success) {
        throw await localizeStructuredErrorResponseFromPreference(response, 'error.imageOcrUnavailable');
    }

    return response.lines || [];
}

export async function translateImageInExtension(
    image: string,
    sourceLanguage: string,
    title: string,
    signal?: AbortSignal,
): Promise<{ image: string; lines: ImageTranslationLine[] }> {
    const send = (serviceOverride?: string) => browser.runtime.sendMessage({
        type: 'fluentReadImageTranslate',
        image,
        sourceLanguage,
        title,
        serviceOverride,
        consentScopeId: getNetworkConsentScopeId(),
    }) as Promise<ImageTranslationRuntimeResponse>;

    let response = await send();
    if (isNetworkConsentRequiredOutcome(response)) {
        const decision = await requestNetworkProviderConsent(response, signal);
        if (!decision) throw new NetworkConsentRequiredError(response);
        response = await send(decision.providerId);
        if (isNetworkConsentRequiredOutcome(response)) throw new NetworkConsentRequiredError(response);
    }

    if (!response?.success || !response.image || !Array.isArray(response.lines)) {
        throw await localizeStructuredErrorResponseFromPreference(response, 'error.imageTranslationUnavailable');
    }

    return { image: response.image, lines: response.lines };
}

export async function fetchImageInExtension(imageUrl: string): Promise<string> {
    if (!await requestUrlHostPermission(imageUrl)) {
        throw await localizeStructuredErrorResponseFromPreference(undefined, 'error.imageFetchPermissionDenied');
    }
    const response = await browser.runtime.sendMessage({
        type: 'fluentReadImageFetch',
        url: imageUrl,
    }) as ImageFetchResponse | undefined;

    if (!response?.success || !response.image) {
        throw await localizeStructuredErrorResponseFromPreference(response, 'error.imageFetchFailed');
    }

    return response.image;
}
