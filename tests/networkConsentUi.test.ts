import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseHTML } from 'linkedom';

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
}));

vi.mock('webextension-polyfill', () => ({
  default: { runtime: { sendMessage: mocks.sendMessage } },
}));

import {
  chooseNetworkProviderConsent,
  requestNetworkProviderConsent,
} from '@/entrypoints/utils/networkConsentUi';
import { PROVIDER_NETWORK_CONSENT_MESSAGE } from '@/entrypoints/utils/providerConsent';

const outcome = {
  type: 'network-consent-required' as const,
  reason: 'local-provider-unavailable' as const,
  providerId: null,
  privacyBoundary: 'network-free' as const,
  availableProviders: ['microsoft', 'google'],
  message: 'Choose a network provider.',
};

function installDocument(): void {
  const { document, HTMLButtonElement } = parseHTML('<html><body></body></html>');
  vi.stubGlobal('document', document);
  vi.stubGlobal('HTMLButtonElement', HTMLButtonElement);
}

function clickConsentButton(value: string): void {
  const host = document.getElementById('mercury-translate-network-consent');
  const button = host?.shadowRoot?.querySelector(`button[data-value="${value}"]`);
  if (!button || typeof (button as HTMLElement).click !== 'function') throw new Error(`Missing consent button: ${value}`);
  (button as HTMLElement).click();
}

describe('network consent UI', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installDocument();
    mocks.sendMessage.mockReset();
  });

  it('resolves cancel without sending providerNetworkConsent', async () => {
    const decision = chooseNetworkProviderConsent(outcome);
    clickConsentButton('cancel');

    await expect(decision).resolves.toBeNull();
    expect(mocks.sendMessage).not.toHaveBeenCalled();
  });

  it('sends providerNetworkConsent for remember-default after an explicit action', async () => {
    mocks.sendMessage.mockResolvedValue({ success: true });
    const decision = requestNetworkProviderConsent(outcome);
    clickConsentButton('remember-default');

    await expect(decision).resolves.toEqual({ providerId: 'microsoft', mode: 'remember-default' });
    expect(mocks.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: PROVIDER_NETWORK_CONSENT_MESSAGE,
      providerId: 'microsoft',
      mode: 'remember-default',
      consentScopeId: expect.any(String),
    }));
  });
});
