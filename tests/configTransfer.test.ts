import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { defaultOption } from '@/entrypoints/utils/option'
import {
  SETTINGS_TRANSFER_SCHEMA_VERSION,
  SettingsTransferValidationError,
  configContainsSecrets,
  createSettingsTransferEnvelope,
  isConfigImportValid,
  isSettingsTransferValid,
  parseSettingsTransfer,
  sanitizeConfigForExport,
} from '@/entrypoints/utils/config-transfer'

const validConfig = {
  on: true,
  service: 'openai',
  display: 1,
  from: 'auto',
  to: 'zh-Hans',
}

describe('configuration transfer helpers', () => {
  it('clears a rendered export whenever the secret-inclusion choice changes', () => {
    const settingsUi = readFileSync(new URL('../components/Main.vue', import.meta.url), 'utf8')

    expect(settingsUi).toMatch(/watch\(includeExportSecrets,[\s\S]*?exportData\.value = ''[\s\S]*?showExportBox\.value = false/)
  })

  it('accepts the minimum import shape and rejects malformed values', () => {
    expect(isConfigImportValid(validConfig)).toBe(true)
    expect(isConfigImportValid({ ...validConfig, service: 42 })).toBe(false)
    expect(isConfigImportValid({ ...validConfig, customBody: { openai: '{}' } })).toBe(true)
    expect(isConfigImportValid({ ...validConfig, customBody: { openai: null } })).toBe(false)
    expect(isConfigImportValid({ ...validConfig, to: undefined })).toBe(true)
    expect(isConfigImportValid({ service: 'openai' })).toBe(false)
    expect(isConfigImportValid(null)).toBe(false)
  })

  it('removes default-only fields without mutating the source', () => {
    const source = {
      ...validConfig,
      system_role: {
        openai: defaultOption.system_role,
        deepseek: 'Translate with a concise tone.',
      },
      user_role: {
        openai: defaultOption.user_role,
      },
      customBody: {
        openai: '   ',
        deepseek: '{"thinking":{"type":"disabled"}}',
      },
      custom: 'http://localhost:11434',
      proxy: { openai: 'https://proxy.invalid' },
    }

    const sanitized = sanitizeConfigForExport(source)

    expect(sanitized).toEqual({
      ...validConfig,
      system_role: { deepseek: 'Translate with a concise tone.' },
    })
    expect(source.system_role).toHaveProperty('openai')
    expect(source.user_role).toHaveProperty('openai')
    expect(source.customBody).toHaveProperty('openai')
    expect(source.proxy).toHaveProperty('openai')
  })

  it('removes empty maps after cleaning their entries', () => {
    const sanitized = sanitizeConfigForExport({
      ...validConfig,
      system_role: { openai: defaultOption.system_role },
      user_role: { openai: defaultOption.user_role },
      customBody: { openai: '' },
    })

    expect(sanitized).toEqual(validConfig)
  })

  it('creates a versioned transfer envelope that excludes credentials by default', () => {
    const source = {
      ...validConfig,
      token: { openai: 'not-a-real-token' },
      sk: 'not-a-real-secret',
      extra: { zhipu: { secret: 'short-lived-placeholder' } },
    }

    const envelope = createSettingsTransferEnvelope(source, '0.1.1', false, '2026-08-20T00:00:00.000Z')

    expect(envelope).toEqual({
      appVersion: '0.1.1',
      schemaVersion: SETTINGS_TRANSFER_SCHEMA_VERSION,
      exportedAt: '2026-08-20T00:00:00.000Z',
      config: validConfig,
      secretsIncluded: false,
    })
    expect(configContainsSecrets(envelope.config)).toBe(false)
    expect(source.token.openai).toBe('not-a-real-token')
  })

  it('includes credentials only after explicitly requested', () => {
    const source = {
      ...validConfig,
      token: { openai: 'not-a-real-token' },
      tencentSecretKey: 'not-a-real-secret',
    }

    const envelope = createSettingsTransferEnvelope(source, '0.1.1', true, '2026-08-20T00:00:00.000Z')

    expect(envelope.secretsIncluded).toBe(true)
    expect(envelope.config).toMatchObject({
      token: { openai: 'not-a-real-token' },
      tencentSecretKey: 'not-a-real-secret',
    })
    expect(configContainsSecrets(envelope.config)).toBe(true)
  })

  it('omits arbitrary request bodies and endpoint values in safe exports', () => {
    const safeExport = sanitizeConfigForExport({
      ...validConfig,
      customBody: { openai: '{"api_key":"not-a-real-token"}' },
      proxy: { openai: 'https://name:not-a-real-secret@proxy.invalid' },
      deeplx: 'https://deeplx.invalid/translate?token=not-a-real-token',
      custom: 'http://name:not-a-real-secret@localhost:11434',
      newApiUrl: 'https://api.invalid?key=not-a-real-token',
      azureOpenaiEndpoint: 'https://api.invalid/chat?key=not-a-real-token',
    })

    expect(safeExport).toEqual(validConfig)
    expect(isSettingsTransferValid({
      appVersion: '0.1.1',
      schemaVersion: 1,
      exportedAt: '2026-08-20T00:00:00.000Z',
      config: { ...validConfig, custom: 'http://localhost:11434' },
      secretsIncluded: false,
    })).toBe(false)
    expect(parseSettingsTransfer({
      ...validConfig,
      customBody: { openai: '{"api_key":"not-a-real-token"}' },
    }).secretsIncluded).toBe(true)
  })

  it('previews valid v1 transfers and recognizes legacy exports', () => {
    const envelope = createSettingsTransferEnvelope(validConfig, '0.1.1', false, '2026-08-20T00:00:00.000Z')

    expect(parseSettingsTransfer(envelope)).toMatchObject({
      appVersion: '0.1.1',
      schemaVersion: 1,
      exportedAt: '2026-08-20T00:00:00.000Z',
      config: validConfig,
      secretsIncluded: false,
      legacy: false,
    })
    expect(parseSettingsTransfer(validConfig)).toMatchObject({
      appVersion: null,
      schemaVersion: null,
      secretsIncluded: false,
      legacy: true,
      config: validConfig,
    })
  })

  it('rejects malformed transfers, unknown schemas, and secret declaration mismatches', () => {
    const unsupported = {
      appVersion: '0.1.1',
      schemaVersion: 2,
      exportedAt: '2026-08-20T00:00:00.000Z',
      config: validConfig,
      secretsIncluded: false,
    }
    const mismatchedSecrets = {
      appVersion: '0.1.1',
      schemaVersion: 1,
      exportedAt: '2026-08-20T00:00:00.000Z',
      config: { ...validConfig, token: { openai: 'not-a-real-token' } },
      secretsIncluded: false,
    }

    expect(() => parseSettingsTransfer(unsupported)).toThrow(SettingsTransferValidationError)
    try {
      parseSettingsTransfer(unsupported)
    } catch (error) {
      expect(error).toMatchObject({ code: 'unsupported-schema' })
    }
    expect(isSettingsTransferValid(unsupported)).toBe(false)
    expect(isSettingsTransferValid(mismatchedSecrets)).toBe(false)
    expect(isSettingsTransferValid({ schemaVersion: 1 })).toBe(false)
  })
})
