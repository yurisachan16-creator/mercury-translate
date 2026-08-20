import { services } from '@/entrypoints/utils/option';

/**
 * A provider's privacy boundary is deliberately separate from its technical
 * protocol.  A no-key endpoint can still transmit page text, while an Ollama
 * endpoint may be entirely local.
 */
export type ProviderPrivacyBoundary = 'local' | 'network-free' | 'byok';

export interface ProviderDescriptor {
  id: string;
  privacyBoundary: ProviderPrivacyBoundary;
  /** Network-free endpoints are best-effort integrations, not an SLA. */
  unstable?: boolean;
  /** Experimental providers stay supported for existing configurations only. */
  experimental?: boolean;
  /** Network-free providers must never receive text without an explicit grant. */
  requiresNetworkConsent: boolean;
  /** Whether normal use depends on a user-supplied credential. */
  requiresApiKey: boolean;
  /** Native multi-segment support; other adapters use the ordered fallback. */
  supportsBatch: boolean;
  /** Chrome local pairs are decided by the browser at runtime. */
  runtimeAvailability: 'runtime-check' | 'configured' | 'requires-configuration';
}

/** Marks a failure that is safe to offer a consent-gated network alternative for. */
export class LocalProviderUnavailableError extends Error {
  readonly providerId: string;

  constructor(providerId: string, message: string) {
    super(message);
    this.name = 'LocalProviderUnavailableError';
    this.providerId = providerId;
  }
}

export function isLocalProviderUnavailableError(value: unknown): value is LocalProviderUnavailableError {
  return value instanceof LocalProviderUnavailableError;
}

export const NETWORK_FREE_PROVIDER_IDS = [services.microsoft, services.google] as const;

const NETWORK_FREE_PROVIDERS = new Set<string>(NETWORK_FREE_PROVIDER_IDS);
const BYOK_PROVIDER_IDS = new Set<string>([
  services.openai,
  services.azureOpenai,
  services.gemini,
  services.deepseek,
  services.newapi,
  services.custom,
  services.claude,
  services.groq,
  services.grok,
  services.openrouter,
  services.moonshot,
  services.tongyi,
  services.zhipu,
  services.yiyan,
  services.tencent,
  services.youdao,
  services.deepL,
  services.xiaoniu,
  services.huanYuan,
  services.huanYuanTranslation,
  services.doubao,
  services.siliconCloud,
  services.minimax,
  services.jieyue,
  services.infini,
  services.baichuan,
  services.lingyi,
  services.cozecom,
  services.cozecn,
]);

function isLoopbackEndpoint(endpoint: string | undefined): boolean {
  if (!endpoint?.trim()) return false;
  try {
    const hostname = new URL(endpoint).hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
  } catch {
    return false;
  }
}

function descriptor(
  id: string,
  privacyBoundary: ProviderPrivacyBoundary,
  options: Partial<Pick<ProviderDescriptor,
    'unstable' | 'experimental' | 'supportsBatch' | 'runtimeAvailability' | 'requiresApiKey'>> = {},
): ProviderDescriptor {
  return {
    id,
    privacyBoundary,
    requiresNetworkConsent: privacyBoundary === 'network-free',
    requiresApiKey: privacyBoundary === 'byok',
    supportsBatch: false,
    runtimeAvailability: 'configured',
    ...options,
  };
}

/**
 * Resolve the policy for an adapter without changing how that adapter sends a
 * request.  `custom` is the existing OpenAI-compatible/Ollama adapter: it is
 * local only for a loopback endpoint and BYOK for any remote endpoint.
 */
export function getProviderDescriptor(service: string, endpoint?: string): ProviderDescriptor {
  if (service === services.chromeTranslator || service === 'ollama') {
    return descriptor(service, 'local', {
      runtimeAvailability: service === services.chromeTranslator ? 'runtime-check' : 'configured',
    });
  }

  if (service === services.deeplx) {
    return descriptor(service, 'network-free', {
      unstable: true,
      experimental: true,
      runtimeAvailability: endpoint?.trim() ? 'configured' : 'requires-configuration',
    });
  }

  if (service === services.freeTranslation) {
    return descriptor(service, 'network-free', { unstable: true, experimental: true });
  }

  if (NETWORK_FREE_PROVIDERS.has(service)) {
    return descriptor(service, 'network-free', {
      unstable: true,
      supportsBatch: service === services.microsoft,
    });
  }

  if (service === services.custom && isLoopbackEndpoint(endpoint)) {
    return descriptor(service, 'local', {requiresApiKey: false});
  }

  if (BYOK_PROVIDER_IDS.has(service)) {
    return descriptor(service, 'byok');
  }

  // Unknown adapters are treated as user-configured network providers. This
  // prevents a future adapter from accidentally being advertised as local.
  return descriptor(service, 'byok');
}

export function isNetworkFreeProvider(service: string, endpoint?: string): boolean {
  return getProviderDescriptor(service, endpoint).privacyBoundary === 'network-free';
}

export function getNetworkFreeProviderIds(): string[] {
  return [...NETWORK_FREE_PROVIDER_IDS];
}
