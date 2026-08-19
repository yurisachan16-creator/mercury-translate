import type {NetworkConsentRequiredOutcome} from '@/entrypoints/utils/providerConsent';

export type OrderedBatchTranslationResult = string[] | NetworkConsentRequiredOutcome;

export interface OrderedBatchTranslationFallbackOptions {
  /**
   * The caller owns provider selection. Both the batch attempt and every
   * fallback request use this exact function, so a failure can never cause a
   * silent switch between local, free-network, or BYOK providers.
   */
  translate: (origin: string | string[]) => Promise<unknown>;
  origins: readonly string[];
  /** Used by PDF requests to stop before dispatching another segment. */
  assertActive?: () => void;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isNetworkConsentRequiredOutcome(value: unknown): value is NetworkConsentRequiredOutcome {
  return Boolean(value
    && typeof value === 'object'
    && (value as Record<string, unknown>).type === 'network-consent-required');
}

function isNetworkConsentRequiredError(error: unknown): boolean {
  return error instanceof Error && error.name === 'NetworkConsentRequiredError';
}

function isStringBatch(value: unknown, expectedLength: number): value is string[] {
  return Array.isArray(value)
    && value.length === expectedLength
    && value.every(item => typeof item === 'string');
}

/**
 * Prefer an adapter's native batch path, then retry the same sources through
 * the same adapter one by one. The sequential fallback keeps stable segment
 * order and creates a cancellation boundary before each outbound request.
 */
export async function translateBatchWithOrderedIndividualFallback(
  options: OrderedBatchTranslationFallbackOptions,
): Promise<OrderedBatchTranslationResult> {
  const {translate, origins, assertActive} = options;
  assertActive?.();

  try {
    const batchResult = await translate([...origins]);
    assertActive?.();
    if (isNetworkConsentRequiredOutcome(batchResult)) return batchResult;
    if (isStringBatch(batchResult, origins.length)) return batchResult;
  } catch (error) {
    // Cancellation and a typed consent error are control-flow signals. They
    // must reach the caller unchanged; only adapter/protocol failures qualify
    // for a same-provider, per-segment retry.
    if (isAbortError(error) || isNetworkConsentRequiredError(error)) throw error;
  }

  const translations: string[] = [];
  for (const origin of origins) {
    assertActive?.();
    const result = await translate(origin);
    assertActive?.();
    if (isNetworkConsentRequiredOutcome(result)) return result;
    if (typeof result !== 'string') throw new Error('逐段翻译返回格式异常');
    translations.push(result);
  }
  return translations;
}
