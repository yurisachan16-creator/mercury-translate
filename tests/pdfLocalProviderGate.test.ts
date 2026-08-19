import {describe, expect, it} from 'vitest';

import {canPreparePdfLocalProvider, shouldGatePdfLocalProvider} from '@/entrypoints/pdf-viewer/localProviderGate';
import {services} from '@/entrypoints/utils/option';

describe('PDF local provider gate', () => {
  it('blocks automatic Chrome local translation until the language pair is ready', () => {
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'downloadable', false)).toBe(true);
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'downloading', false)).toBe(true);
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'after-detection', false)).toBe(true);
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'unsupported', false)).toBe(true);
  });

  it('allows Chrome local translation after readiness or an explicit gesture', () => {
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'ready', false)).toBe(false);
    expect(shouldGatePdfLocalProvider(services.chromeTranslator, 'downloadable', true)).toBe(false);
  });

  it('does not gate manually selected non-local PDF providers', () => {
    expect(shouldGatePdfLocalProvider(services.microsoft, 'unsupported', false)).toBe(false);
    expect(shouldGatePdfLocalProvider(services.google, null, false)).toBe(false);
  });

  it('only enables the explicit start button when Chrome can prepare a local model', () => {
    expect(canPreparePdfLocalProvider('downloadable')).toBe(true);
    expect(canPreparePdfLocalProvider('after-detection')).toBe(true);
    expect(canPreparePdfLocalProvider('downloading')).toBe(false);
    expect(canPreparePdfLocalProvider('unsupported')).toBe(false);
  });
});
