import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vitest'
import {messages, SUPPORTED_UI_LOCALES} from '@/entrypoints/i18n/messages'
import {options, services} from '@/entrypoints/utils/option'

const readSource = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

describe('Mercury identity and Sub2API UX', () => {
  it('renames the newapi service without changing its internal id', () => {
    expect(services.newapi).toBe('newapi')
    expect(options.services.find((item) => item.value === services.newapi)?.label).toBe('OpenAI-compatible / Sub2API')
  })

  it('keeps daily popup/options/footer UI free of prominent FluentRead branding', () => {
    const dailyUi = [
      'entrypoints/popup/App.vue',
      'entrypoints/options/App.vue',
      'components/Footer.vue',
    ].map(readSource).join('\n')

    expect(dailyUi).not.toMatch(/Bistutu\/FluentRead|FluentRead upstream|FluentRead 上游|基于 FluentRead|Based on FluentRead/)
  })

  it('renders model discovery through provider.listModels without carrying endpoint or key', () => {
    const source = readSource('components/ServiceConfiguration.vue')

    expect(source).toContain("type: 'provider.listModels'")
    expect(source).toContain(`providerId: services.newapi`)
    expect(source).toContain(`status: 'manual'`)
    expect(source).toContain('sub2apiManualFallback')
    expect(source).not.toMatch(/provider\.listModels[\s\S]{0,160}(token|newApiUrl|endpoint|apiKey)/)
  })

  it('has complete three-locale labels for Sub2API and popup privacy state', () => {
    for (const locale of SUPPORTED_UI_LOCALES) {
      const message = messages[locale]
      expect(message.serviceConfig.newApiEndpoint).toMatch(/Sub2API/)
      expect(message.serviceConfig.sub2apiDiscoveryHint).toBeTruthy()
      expect(message.serviceConfig.sub2apiFetchModels).toBeTruthy()
      expect(message.serviceConfig.sub2apiErrors['openai-compatible-sse-unsupported']).toBeTruthy()
      expect(message.serviceConfig.missingNewApiEndpoint).toBeTruthy()
      expect(message.option.openAiCompatibleSub2Api).toMatch(/Sub2API/)
      expect(message.popup.privacyBoundary.local).toBeTruthy()
      expect(message.popup.privacyBoundary['network-free']).toBeTruthy()
      expect(message.popup.privacyBoundary.byok).toBeTruthy()
    }
  })
})
