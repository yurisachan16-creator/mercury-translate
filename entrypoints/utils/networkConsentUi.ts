import browser from 'webextension-polyfill';

import {
  type NetworkConsentDecision,
  type NetworkConsentMode,
  type NetworkConsentRequiredOutcome,
  getNetworkConsentScopeId,
  PROVIDER_NETWORK_CONSENT_MESSAGE,
} from '@/entrypoints/utils/providerConsent';
import { services } from '@/entrypoints/utils/option';
import {
  getStoredUiLocalePreference,
  resolveUiLocalePreference,
} from '@/entrypoints/i18n/preferences';
import type {UiLocale} from '@/entrypoints/i18n/messages';
import {requestProviderHostPermission} from '@/entrypoints/utils/providerPermissions';
import {localizeStructuredErrorResponseFromPreference} from '@/entrypoints/i18n/errors';

export type NetworkConsentResult = NetworkConsentDecision | null;

const PROVIDER_LABELS: Record<string, string> = {
  [services.microsoft]: 'Microsoft / Bing',
  [services.google]: 'Google',
};

const CONSENT_COPY: Record<UiLocale, {
  title: string;
  localUnavailable: string;
  providerWarning: string;
  cancel: string;
  once: string;
  remember: string;
}> = {
  en: {
    title: 'Allow an online translation service?',
    localUnavailable: 'Chrome local translation is unavailable for this request. Choose a provider only if you agree to send the text to that provider.',
    providerWarning: 'This service sends the text to the selected provider. The free integration has no stability guarantee.',
    cancel: 'Cancel',
    once: 'Use this time',
    remember: 'Remember as default',
  },
  'zh-CN': {
    title: '允许使用联网翻译服务？',
    localUnavailable: 'Chrome 本地翻译无法处理这次请求。只有你明确同意后，文本才会发送给所选服务商。',
    providerWarning: '该服务会把待翻译文本发送给所选服务商，免费接口不保证稳定性。',
    cancel: '取消',
    once: '仅本次使用',
    remember: '记住并设为默认',
  },
  'zh-TW': {
    title: '允許使用連網翻譯服務？',
    localUnavailable: 'Chrome 本地翻譯無法處理這次請求。只有你明確同意後，文字才會傳送給所選服務商。',
    providerWarning: '此服務會把待翻譯文字傳送給所選服務商，免費介面不保證穩定性。',
    cancel: '取消',
    once: '僅本次使用',
    remember: '記住並設為預設',
  },
};

function detectedConsentLocale(): UiLocale {
  const locale = typeof navigator === 'undefined' ? 'en' : navigator.language;
  if (/^zh-(tw|hk|mo|hant)/i.test(locale)) return 'zh-TW';
  if (/^zh/i.test(locale)) return 'zh-CN';
  return 'en';
}

function providerLabel(providerId: string): string {
  return PROVIDER_LABELS[providerId] || providerId;
}

function createButton(label: string, value: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.value = value;
  return button;
}

export function chooseNetworkProviderConsent(
  outcome: NetworkConsentRequiredOutcome,
  signal?: AbortSignal,
): Promise<NetworkConsentResult> {
  if (typeof document === 'undefined' || signal?.aborted) return Promise.resolve(null);

  return new Promise((resolve) => {
    const host = document.createElement('div');
    host.id = 'mercury-translate-network-consent';
    const shadow = host.attachShadow({ mode: 'open' });
    const providers = outcome.availableProviders.length > 0
      ? outcome.availableProviders
      : [services.microsoft, services.google];
    let selectedProvider = providers[0] || services.microsoft;

    const style = document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(15, 23, 42, 0.38);
      }
      .dialog {
        width: min(420px, calc(100vw - 48px));
        border-radius: 8px;
        background: #fff;
        color: #111827;
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
        padding: 20px;
      }
      h2 {
        margin: 0 0 10px;
        font-size: 17px;
        line-height: 1.35;
        font-weight: 650;
      }
      p {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.6;
        color: #4b5563;
      }
      .providers {
        display: grid;
        gap: 8px;
        margin: 0 0 16px;
      }
      label {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 9px 10px;
        font-size: 13px;
        cursor: pointer;
      }
      input {
        margin: 0;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      button {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        color: #111827;
        padding: 8px 10px;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      button[data-value="remember-default"] {
        border-color: #2563eb;
        background: #2563eb;
        color: #fff;
      }
    `;

    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    const dialog = document.createElement('section');
    dialog.className = 'dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const title = document.createElement('h2');
    const message = document.createElement('p');

    const providerList = document.createElement('div');
    providerList.className = 'providers';
    for (const providerId of providers) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'mercury-network-provider';
      input.value = providerId;
      input.checked = providerId === selectedProvider;
      input.addEventListener('change', () => {
        selectedProvider = providerId;
      });
      label.append(input, document.createTextNode(providerLabel(providerId)));
      providerList.append(label);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    const cancelButton = createButton('', 'cancel');
    const onceButton = createButton('', 'once');
    const rememberButton = createButton('', 'remember-default');
    actions.append(cancelButton, onceButton, rememberButton);

    const applyCopy = (locale: UiLocale) => {
      const copy = CONSENT_COPY[locale];
      title.textContent = copy.title;
      message.textContent = outcome.reason === 'local-provider-unavailable'
        ? copy.localUnavailable
        : copy.providerWarning;
      cancelButton.textContent = copy.cancel;
      onceButton.textContent = copy.once;
      rememberButton.textContent = copy.remember;
    };
    applyCopy(detectedConsentLocale());
    void getStoredUiLocalePreference()
      .then(preference => applyCopy(resolveUiLocalePreference(preference)))
      .catch(() => undefined);

    const cleanup = (result: NetworkConsentResult) => {
      signal?.removeEventListener('abort', onAbort);
      host.remove();
      resolve(result);
    };
    const onAbort = () => cleanup(null);

    actions.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLButtonElement ? event.target : null;
      if (!target) return;
      const value = target.dataset.value;
      if (value === 'cancel') {
        cleanup(null);
        return;
      }
      if (value === 'once' || value === 'remember-default') {
        cleanup({ providerId: selectedProvider, mode: value as NetworkConsentMode });
      }
    });

    dialog.append(title, message, providerList, actions);
    backdrop.append(dialog);
    shadow.append(style, backdrop);
    document.documentElement.append(host);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export async function requestNetworkProviderConsent(
  outcome: NetworkConsentRequiredOutcome,
  signal?: AbortSignal,
): Promise<NetworkConsentResult> {
  const decision = await chooseNetworkProviderConsent(outcome, signal);
  if (!decision) return null;

  const permissionGranted = await requestProviderHostPermission(decision.providerId);
  if (!permissionGranted) throw await localizeStructuredErrorResponseFromPreference(undefined, 'error.networkPermissionDenied');

  const response = await browser.runtime.sendMessage({
    type: PROVIDER_NETWORK_CONSENT_MESSAGE,
    providerId: decision.providerId,
    mode: decision.mode,
    consentScopeId: getNetworkConsentScopeId(),
  });

  if (!response || typeof response !== 'object' || !(response as { success?: boolean }).success) {
    throw await localizeStructuredErrorResponseFromPreference(response, 'error.networkConsentFailed');
  }

  return decision;
}
