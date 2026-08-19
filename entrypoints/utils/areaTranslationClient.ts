import browser from 'webextension-polyfill';
import type { OcrLine } from '@/entrypoints/utils/imageTranslationCore';
import type { AreaTranslationSelection } from '@/entrypoints/utils/areaTranslationCore';
import {localizeStructuredErrorResponseFromPreference} from '@/entrypoints/i18n/errors';
import {
    getNetworkConsentScopeId,
    isNetworkConsentRequiredOutcome,
    NetworkConsentRequiredError,
    type NetworkConsentRequiredOutcome,
} from '@/entrypoints/utils/providerConsent';
import {requestNetworkProviderConsent} from '@/entrypoints/utils/networkConsentUi';

export interface AreaTranslationResult {
    image: string;
    lines: Array<OcrLine & { backgroundColor: string }>;
}

interface AreaTranslationResponse extends Partial<AreaTranslationResult> {
    success: boolean;
    error?: string;
}

type AreaTranslationRuntimeResponse = AreaTranslationResponse | NetworkConsentRequiredOutcome | undefined;

export async function captureVisibleAreaInExtension(): Promise<string> {
    const response = await browser.runtime.sendMessage({ type: 'fluentReadAreaCapture' }) as { success?: boolean; image?: string; error?: string } | undefined;
    if (!response?.success || !response.image) {
        throw await localizeStructuredErrorResponseFromPreference(response, 'error.areaCaptureFailed');
    }
    return response.image;
}

export async function translateCapturedAreaInExtension(
    image: string,
    selection: AreaTranslationSelection,
    sourceLanguage: string,
    title: string,
    signal?: AbortSignal,
): Promise<AreaTranslationResult> {
    const send = (serviceOverride?: string) => browser.runtime.sendMessage({
        type: 'fluentReadAreaTranslateCapture',
        image,
        selection,
        sourceLanguage,
        title,
        serviceOverride,
        consentScopeId: getNetworkConsentScopeId(),
    }) as Promise<AreaTranslationRuntimeResponse>;

    let response = await send();
    if (isNetworkConsentRequiredOutcome(response)) {
        const decision = await requestNetworkProviderConsent(response, signal);
        if (!decision) throw new NetworkConsentRequiredError(response);
        response = await send(decision.providerId);
        if (isNetworkConsentRequiredOutcome(response)) throw new NetworkConsentRequiredError(response);
    }

    if (!response?.success || !response.image || !Array.isArray(response.lines)) {
        throw await localizeStructuredErrorResponseFromPreference(response, 'error.areaTranslationUnavailable');
    }

    return { image: response.image, lines: response.lines };
}
