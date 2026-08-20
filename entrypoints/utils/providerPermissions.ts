import browser from 'webextension-polyfill';

import {MINIMAX_ENDPOINTS, tongyiTokenPlanUrl, urls} from '@/entrypoints/utils/constant';
import {Config} from '@/entrypoints/utils/model';
import {services} from '@/entrypoints/utils/option';

const MICROSOFT_ENDPOINT = 'https://edge.microsoft.com/translate/translatetext';
const GOOGLE_ENDPOINTS = [
  'https://translate.google.com/',
  'https://translate.google.co.uk/',
  'https://translate.googleapis.com/',
];
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/';

export function hostPermissionPattern(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.protocol}//${parsed.host}/*`;
  } catch {
    return null;
  }
}

function configuredEndpoint(service: string, current: Config): string | undefined {
  const proxy = current.proxy[service]?.trim();
  if (proxy) return proxy;
  if (service === services.custom) return current.custom;
  if (service === services.newapi) return current.newApiUrl;
  if (service === services.azureOpenai) return current.azureOpenaiEndpoint;
  if (service === services.deeplx) return current.deeplx;
  if (service === services.minimax) {
    const plan = current.minimaxBillingPlan === 'token-plan' ? 'token-plan' : 'payg';
    const region = current.minimaxRegion === 'global' ? 'global' : 'cn';
    return MINIMAX_ENDPOINTS[plan][region];
  }
  return urls[service];
}

export function getProviderHostPermissions(service: string, current: Config = new Config()): string[] {
  const endpoints = service === services.microsoft
    ? [MICROSOFT_ENDPOINT]
    : service === services.google
      ? GOOGLE_ENDPOINTS
      : service === services.gemini
        ? [current.proxy[service] || GEMINI_ENDPOINT]
        : service === services.tongyi
          ? [configuredEndpoint(service, current), tongyiTokenPlanUrl]
          : [configuredEndpoint(service, current)];

  return [...new Set(endpoints.flatMap(endpoint => {
    if (!endpoint) return [];
    const permission = hostPermissionPattern(endpoint);
    return permission ? [permission] : [];
  }))];
}

export async function requestHostPermissions(origins: string[]): Promise<boolean> {
  const uniqueOrigins = [...new Set(origins)];
  if (uniqueOrigins.length === 0) return true;
  const permissionsApi = browser.permissions;
  if (!permissionsApi?.request) return true;
  if (await permissionsApi.contains({origins: uniqueOrigins})) return true;
  return permissionsApi.request({origins: uniqueOrigins});
}

export function requestUrlHostPermission(url: string): Promise<boolean> {
  const permission = hostPermissionPattern(url);
  return permission ? requestHostPermissions([permission]) : Promise.resolve(false);
}

export function requestProviderHostPermission(service: string, current: Config = new Config()): Promise<boolean> {
  return requestHostPermissions(getProviderHostPermissions(service, current));
}
