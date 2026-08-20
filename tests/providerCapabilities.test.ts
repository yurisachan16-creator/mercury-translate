import { describe, expect, it } from 'vitest';

import { services } from '@/entrypoints/utils/option';
import {
  getProviderDescriptor,
  getNetworkFreeProviderIds,
} from '@/entrypoints/utils/providerCapabilities';

describe('provider privacy capabilities', () => {
  it('classifies Chrome Translator and Ollama as local providers', () => {
    expect(getProviderDescriptor(services.chromeTranslator)).toMatchObject({
      privacyBoundary: 'local',
      requiresNetworkConsent: false,
      requiresApiKey: false,
      runtimeAvailability: 'runtime-check',
    });
    expect(getProviderDescriptor('ollama')).toMatchObject({
      privacyBoundary: 'local',
      requiresNetworkConsent: false,
    });
    expect(getProviderDescriptor(services.custom, 'http://localhost:11434/v1/chat/completions'))
      .toMatchObject({privacyBoundary: 'local'});
  });

  it('marks Google and Microsoft as unstable free network providers', () => {
    for (const provider of [services.microsoft, services.google]) {
      expect(getProviderDescriptor(provider)).toMatchObject({
        privacyBoundary: 'network-free',
        unstable: true,
        requiresNetworkConsent: true,
      });
    }
    expect(getNetworkFreeProviderIds()).toEqual([services.microsoft, services.google]);
    expect(getProviderDescriptor(services.microsoft).supportsBatch).toBe(true);
    expect(getProviderDescriptor(services.google).supportsBatch).toBe(false);
  });

  it('keeps DeepLX experimental and off the default path', () => {
    expect(getProviderDescriptor(services.deeplx)).toMatchObject({
      privacyBoundary: 'network-free',
      unstable: true,
      experimental: true,
      runtimeAvailability: 'requires-configuration',
    });
  });

  it('marks credentialed services as BYOK, including remote OpenAI-compatible endpoints', () => {
    for (const provider of [services.deepseek, services.gemini, services.openai, services.newapi]) {
      expect(getProviderDescriptor(provider)).toMatchObject({
        privacyBoundary: 'byok',
        requiresNetworkConsent: false,
        requiresApiKey: true,
      });
    }
    expect(getProviderDescriptor(services.custom, 'https://gateway.example/v1/chat/completions'))
      .toMatchObject({privacyBoundary: 'byok'});
  });
});
