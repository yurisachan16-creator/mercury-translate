import browser from 'webextension-polyfill';

import {
  getNetworkFreeProviderIds,
  isNetworkFreeProvider,
  type ProviderPrivacyBoundary,
} from '@/entrypoints/utils/providerCapabilities';

export const PROVIDER_NETWORK_CONSENT_STORAGE_KEY = 'mercuryProviderNetworkConsent' as const;
export const PROVIDER_NETWORK_CONSENT_MESSAGE = 'providerNetworkConsent' as const;

export type NetworkConsentMode = 'once' | 'remember-default';
export type NetworkConsentRequiredReason = 'local-provider-unavailable' | 'network-provider-not-approved';

export interface ProviderNetworkConsentState {
  version: 1;
  /** The provider selected by an explicit “remember and use as default” action. */
  defaultProvider?: string;
}

export interface NetworkConsentRequiredOutcome {
  type: 'network-consent-required';
  reason: NetworkConsentRequiredReason;
  providerId: string | null;
  privacyBoundary: ProviderPrivacyBoundary;
  availableProviders: string[];
  message: string;
}

export interface NetworkConsentDecision {
  providerId: string;
  mode: NetworkConsentMode;
}

const EMPTY_CONSENT_STATE: ProviderNetworkConsentState = { version: 1 };
const sessionGrants = new Set<string>();
let clientConsentScopeId: string | undefined;

export function getNetworkConsentScopeId(): string {
  if (!clientConsentScopeId) {
    clientConsentScopeId = typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return clientConsentScopeId;
}

function scopedGrantKey(providerId: string, consentScopeId: string): string {
  return `${consentScopeId}:${providerId}`;
}

function normalizeConsentState(value: unknown): ProviderNetworkConsentState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...EMPTY_CONSENT_STATE };
  const candidate = value as Record<string, unknown>;
  return {
    version: 1,
    ...(typeof candidate.defaultProvider === 'string' && isNetworkFreeProvider(candidate.defaultProvider)
      ? { defaultProvider: candidate.defaultProvider }
      : {}),
  };
}

export function createNetworkConsentRequiredOutcome(
  reason: NetworkConsentRequiredReason,
  providerId: string | null = null,
): NetworkConsentRequiredOutcome {
  const provider = providerId && isNetworkFreeProvider(providerId) ? providerId : null;
  return {
    type: 'network-consent-required',
    reason,
    providerId: provider,
    privacyBoundary: 'network-free',
    availableProviders: provider ? [provider] : getNetworkFreeProviderIds(),
    message: reason === 'local-provider-unavailable'
      ? '本地 Chrome 翻译当前不可用。请选择并明确同意使用联网翻译服务。'
      : '该联网翻译服务会将待翻译文本发送到服务商。请先选择“仅本次使用”或“记住并设为默认”。',
  };
}

export function isNetworkConsentRequiredOutcome(value: unknown): value is NetworkConsentRequiredOutcome {
  return Boolean(value
    && typeof value === 'object'
    && (value as Record<string, unknown>).type === 'network-consent-required');
}

export class NetworkConsentRequiredError extends Error {
  readonly outcome: NetworkConsentRequiredOutcome;

  constructor(outcome: NetworkConsentRequiredOutcome) {
    super(outcome.message);
    this.name = 'NetworkConsentRequiredError';
    this.outcome = outcome;
  }
}

export function isNetworkConsentRequiredError(value: unknown): value is NetworkConsentRequiredError {
  return value instanceof NetworkConsentRequiredError;
}

/** Marks a network-free provider as approved in the current worker session or persistently. */
export async function grantNetworkProviderConsent(
  providerId: string,
  mode: NetworkConsentMode,
  consentScopeId?: string,
): Promise<ProviderNetworkConsentState> {
  if (!isNetworkFreeProvider(providerId)) {
    throw new Error('只有免费联网翻译服务需要此授权');
  }

  if (mode === 'once') {
    if (!consentScopeId) throw new Error('临时联网翻译授权缺少请求作用域');
    sessionGrants.add(scopedGrantKey(providerId, consentScopeId));
    return getProviderNetworkConsentState();
  }

  const next: ProviderNetworkConsentState = { version: 1, defaultProvider: providerId };
  await browser.storage.local.set({ [PROVIDER_NETWORK_CONSENT_STORAGE_KEY]: next });
  return next;
}

export async function getProviderNetworkConsentState(): Promise<ProviderNetworkConsentState> {
  const stored = await browser.storage.local.get(PROVIDER_NETWORK_CONSENT_STORAGE_KEY);
  return normalizeConsentState(stored[PROVIDER_NETWORK_CONSENT_STORAGE_KEY]);
}

/**
 * Checks an explicit grant at the request boundary. One-time grants intentionally
 * last for the current worker session so batch/page segments do not prompt once
 * per request; remembered defaults remain in `storage.local`.
 */
export async function consumeNetworkProviderConsent(providerId: string, consentScopeId?: string): Promise<boolean> {
  if (!isNetworkFreeProvider(providerId)) return true;

  if (consentScopeId && sessionGrants.has(scopedGrantKey(providerId, consentScopeId))) return true;

  const stored = await getProviderNetworkConsentState();
  return stored.defaultProvider === providerId;
}

export async function clearRememberedNetworkProviderConsent(): Promise<void> {
  await browser.storage.local.remove(PROVIDER_NETWORK_CONSENT_STORAGE_KEY);
}

/** Test-only reset for the non-persistent session grant map. */
export function resetSessionNetworkProviderConsents(): void {
  sessionGrants.clear();
}
