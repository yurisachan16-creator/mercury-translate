import {describe, expect, it} from 'vitest';

import {
  translateBatchWithOrderedIndividualFallback,
} from '@/entrypoints/utils/translationBatchFallback';

function abortError(): Error {
  const error = new Error('cancelled');
  error.name = 'AbortError';
  return error;
}

const consentOutcome = {
  type: 'network-consent-required' as const,
  reason: 'local-provider-unavailable' as const,
  providerId: null,
  privacyBoundary: 'network-free' as const,
  availableProviders: ['microsoft', 'google'],
  message: 'Choose a network provider.',
};

describe('ordered translation batch fallback', () => {
  it('retries a throwing batch adapter one segment at a time in stable order', async () => {
    const calls: Array<string | string[]> = [];
    const result = await translateBatchWithOrderedIndividualFallback({
      origins: ['first', 'second'],
      async translate(origin) {
        calls.push(origin);
        if (Array.isArray(origin)) throw new Error('native batch endpoint failed');
        return origin === 'first' ? '一' : '二';
      },
    });

    expect(result).toEqual(['一', '二']);
    expect(calls).toEqual([['first', 'second'], 'first', 'second']);
  });

  it('does not turn a typed network-consent outcome into segment requests', async () => {
    const calls: Array<string | string[]> = [];
    const result = await translateBatchWithOrderedIndividualFallback({
      origins: ['private source'],
      async translate(origin) {
        calls.push(origin);
        return consentOutcome;
      },
    });

    expect(result).toBe(consentOutcome);
    expect(calls).toEqual([['private source']]);
  });

  it('propagates an AbortError without sending fallback requests', async () => {
    const calls: Array<string | string[]> = [];
    await expect(translateBatchWithOrderedIndividualFallback({
      origins: ['first', 'second'],
      async translate(origin) {
        calls.push(origin);
        throw abortError();
      },
    })).rejects.toMatchObject({name: 'AbortError'});

    expect(calls).toEqual([['first', 'second']]);
  });

  it('propagates a thrown consent signal without retrying source text', async () => {
    const calls: Array<string | string[]> = [];
    await expect(translateBatchWithOrderedIndividualFallback({
      origins: ['private source'],
      async translate(origin) {
        calls.push(origin);
        const error = new Error('consent required');
        error.name = 'NetworkConsentRequiredError';
        throw error;
      },
    })).rejects.toMatchObject({name: 'NetworkConsentRequiredError'});

    expect(calls).toEqual([['private source']]);
  });

  it('checks cancellation before every fallback dispatch', async () => {
    const calls: Array<string | string[]> = [];
    let activeChecks = 0;
    await expect(translateBatchWithOrderedIndividualFallback({
      origins: ['first', 'second'],
      assertActive() {
        activeChecks += 1;
        if (activeChecks === 2) throw abortError();
      },
      async translate(origin) {
        calls.push(origin);
        if (Array.isArray(origin)) throw new Error('batch failed');
        return origin;
      },
    })).rejects.toMatchObject({name: 'AbortError'});

    expect(calls).toEqual([['first', 'second']]);
  });

  it('stops the sequential retry when a segment returns a consent outcome', async () => {
    const calls: Array<string | string[]> = [];
    const result = await translateBatchWithOrderedIndividualFallback({
      origins: ['first', 'second'],
      async translate(origin) {
        calls.push(origin);
        if (Array.isArray(origin)) return ['only-one'];
        return consentOutcome;
      },
    });

    expect(result).toBe(consentOutcome);
    expect(calls).toEqual([['first', 'second'], 'first']);
  });
});
