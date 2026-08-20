import { beforeEach, describe, expect, it, vi } from 'vitest';

const { localStore, storageLocal } = vi.hoisted(() => {
  const store: Record<string, unknown> = {};
  return {
    localStore: store,
    storageLocal: {
      get: vi.fn(async (key: string) => ({ [key]: store[key] })),
      set: vi.fn(async (value: Record<string, unknown>) => Object.assign(store, value)),
      remove: vi.fn(async (key: string) => { delete store[key]; }),
    },
  };
});

vi.mock('webextension-polyfill', () => ({
  default: { storage: { local: storageLocal } },
}));

import { services } from '@/entrypoints/utils/option';
import {
  clearRememberedNetworkProviderConsent,
  consumeNetworkProviderConsent,
  createNetworkConsentRequiredOutcome,
  getProviderNetworkConsentState,
  grantNetworkProviderConsent,
  isNetworkConsentRequiredOutcome,
  PROVIDER_NETWORK_CONSENT_STORAGE_KEY,
  resetSessionNetworkProviderConsents,
} from '@/entrypoints/utils/providerConsent';

beforeEach(() => {
  resetSessionNetworkProviderConsents();
  for (const key of Object.keys(localStore)) delete localStore[key];
  vi.clearAllMocks();
});

describe('network provider consent', () => {
  it('returns a typed local-unavailable outcome with no chosen network provider', () => {
    const outcome = createNetworkConsentRequiredOutcome('local-provider-unavailable');

    expect(isNetworkConsentRequiredOutcome(outcome)).toBe(true);
    expect(outcome).toMatchObject({
      type: 'network-consent-required',
      reason: 'local-provider-unavailable',
      providerId: null,
      availableProviders: [services.microsoft, services.google],
    });
  });

  it('limits a once grant to the requesting page/viewer scope without persisting it', async () => {
    await grantNetworkProviderConsent(services.microsoft, 'once', 'scope-a');

    await expect(consumeNetworkProviderConsent(services.microsoft, 'scope-a')).resolves.toBe(true);
    await expect(consumeNetworkProviderConsent(services.microsoft, 'scope-a')).resolves.toBe(true);
    await expect(consumeNetworkProviderConsent(services.microsoft, 'scope-b')).resolves.toBe(false);
    await expect(consumeNetworkProviderConsent(services.microsoft)).resolves.toBe(false);
    expect(storageLocal.set).not.toHaveBeenCalled();
  });

  it('persists a remembered default in storage.local and does not consume it', async () => {
    await grantNetworkProviderConsent(services.google, 'remember-default');

    expect(storageLocal.set).toHaveBeenCalledWith({
      [PROVIDER_NETWORK_CONSENT_STORAGE_KEY]: {version: 1, defaultProvider: services.google},
    });
    await expect(getProviderNetworkConsentState()).resolves.toEqual({version: 1, defaultProvider: services.google});
    await expect(consumeNetworkProviderConsent(services.google)).resolves.toBe(true);
    await expect(consumeNetworkProviderConsent(services.google)).resolves.toBe(true);

    await clearRememberedNetworkProviderConsent();
    await expect(consumeNetworkProviderConsent(services.google)).resolves.toBe(false);
  });
});
