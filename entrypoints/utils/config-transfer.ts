import { isCustomBodyMapping } from './custom-body'
import { defaultOption } from './option'

type ConfigRecord = Record<string, any>

const requiredConfigFields = ['on', 'service', 'display', 'from', 'to'] as const
const secretConfigFields = [
  'token',
  'ak',
  'sk',
  'appid',
  'key',
  'custom',
  'customBody',
  'proxy',
  'deeplx',
  'newApiUrl',
  'azureOpenaiEndpoint',
  'youdaoAppKey',
  'youdaoAppSecret',
  'tencentSecretId',
  'tencentSecretKey',
  // Runtime credentials such as the short-lived Zhipu authorization are kept
  // in `extra`. Treat the complete map as sensitive instead of attempting to
  // distinguish individual provider-specific values.
  'extra',
] as const
const potentiallySecretConfigFields = [
  // These settings accept arbitrary user-controlled payloads or URLs. A
  // credential can be embedded in a JSON body, user-info URL, or query string,
  // so a safe export omits the whole value rather than making an incomplete
  // claim that a key-pattern scrubber caught every credential.
  'customBody',
  'proxy',
  'deeplx',
  'custom',
  'newApiUrl',
  'azureOpenaiEndpoint',
] as const

export const SETTINGS_TRANSFER_SCHEMA_VERSION = 1 as const

/**
 * Portable configuration format used when moving from the GitHub sideload to
 * the Chrome Web Store extension (which has a different extension ID).
 */
export interface SettingsTransferEnvelopeV1 {
  appVersion: string
  schemaVersion: typeof SETTINGS_TRANSFER_SCHEMA_VERSION
  exportedAt: string
  config: ConfigRecord
  secretsIncluded: boolean
}

export interface SettingsTransferPreview {
  appVersion: string | null
  schemaVersion: typeof SETTINGS_TRANSFER_SCHEMA_VERSION | null
  exportedAt: string | null
  config: ConfigRecord
  secretsIncluded: boolean
  legacy: boolean
}

export type SettingsTransferValidationCode = 'invalid-transfer' | 'unsupported-schema'

export class SettingsTransferValidationError extends Error {
  readonly code: SettingsTransferValidationCode

  constructor(code: SettingsTransferValidationCode) {
    super(code)
    this.name = 'SettingsTransferValidationError'
    this.code = code
  }
}

function isRecord(value: unknown): value is ConfigRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function cloneConfigRecord(value: ConfigRecord): ConfigRecord {
  return JSON.parse(JSON.stringify(value)) as ConfigRecord
}

function hasNonEmptyValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (isRecord(value)) return Object.keys(value).length > 0
  return value !== null && value !== undefined
}

/**
 * Settings transfer files normally omit credentials. This also covers the
 * provider-specific runtime credential cache in `extra`.
 */
export function configContainsSecrets(value: unknown): boolean {
  if (!isRecord(value)) return false
  return secretConfigFields.some((field) => hasNonEmptyValue(value[field]))
}

function configContainsSafeExportExclusions(value: unknown): boolean {
  if (!isRecord(value)) return false
  return [...secretConfigFields, ...potentiallySecretConfigFields]
    .some((field) => hasNonEmptyValue(value[field]))
}

export function isConfigImportValid(value: unknown): value is ConfigRecord {
  if (!isRecord(value)) return false
  if (!requiredConfigFields.every((field) => field in value)) return false
  if (typeof value.service !== 'string') return false
  return !('customBody' in value) || isCustomBodyMapping(value.customBody)
}

function removeDefaultEntries(target: ConfigRecord, key: 'system_role' | 'user_role', defaultValue: string) {
  const entries = target[key]
  if (!isRecord(entries)) return

  for (const [service, value] of Object.entries(entries)) {
    if (value === defaultValue) delete entries[service]
  }

  if (Object.keys(entries).length === 0) delete target[key]
}

function removeEmptyCustomBodies(target: ConfigRecord) {
  const entries = target.customBody
  if (!isRecord(entries)) return

  for (const [service, value] of Object.entries(entries)) {
    if (typeof value !== 'string' || !value.trim()) delete entries[service]
  }

  if (Object.keys(entries).length === 0) delete target.customBody
}

function removeSensitiveTransferFields(target: ConfigRecord) {
  ;[...secretConfigFields, ...potentiallySecretConfigFields].forEach((field) => delete target[field])
}

/**
 * Returns a compact, portable config. Credentials are removed unless the user
 * has explicitly opted into a plaintext-secret export.
 */
export function sanitizeConfigForExport(value: unknown, includeSecrets = false): ConfigRecord {
  if (!isRecord(value)) throw new Error('配置必须是 JSON 对象')

  const sanitized = cloneConfigRecord(value)
  removeDefaultEntries(sanitized, 'system_role', defaultOption.system_role)
  removeDefaultEntries(sanitized, 'user_role', defaultOption.user_role)
  removeEmptyCustomBodies(sanitized)
  if (!includeSecrets) removeSensitiveTransferFields(sanitized)
  return sanitized
}

/**
 * Create the v1 transfer payload. The caller supplies the runtime manifest
 * version so package.json remains the single version source during builds.
 */
export function createSettingsTransferEnvelope(
  value: unknown,
  appVersion: string,
  includeSecrets = false,
  exportedAt = new Date().toISOString(),
): SettingsTransferEnvelopeV1 {
  if (!appVersion.trim()) throw new Error('应用版本不能为空')
  if (Number.isNaN(Date.parse(exportedAt))) throw new Error('导出时间无效')

  return {
    appVersion,
    schemaVersion: SETTINGS_TRANSFER_SCHEMA_VERSION,
    exportedAt,
    config: sanitizeConfigForExport(value, includeSecrets),
    secretsIncluded: includeSecrets,
  }
}

function isTransferEnvelope(value: ConfigRecord): boolean {
  return ['schemaVersion', 'appVersion', 'exportedAt', 'config', 'secretsIncluded']
    .some((field) => field in value)
}

/**
 * Validate a transfer before writing anything to storage. Raw legacy config
 * objects remain importable so existing GitHub-release exports still work.
 */
export function parseSettingsTransfer(value: unknown): SettingsTransferPreview {
  if (!isRecord(value)) throw new SettingsTransferValidationError('invalid-transfer')

  if (!isTransferEnvelope(value)) {
    if (!isConfigImportValid(value)) throw new SettingsTransferValidationError('invalid-transfer')
    return {
      appVersion: null,
      schemaVersion: null,
      exportedAt: null,
      config: cloneConfigRecord(value),
      // Legacy raw exports predate the envelope flag. Treat arbitrary custom
      // request/endpoint settings as sensitive here too, so the UI cannot
      // promise a credential-free import when it cannot prove that claim.
      secretsIncluded: configContainsSafeExportExclusions(value),
      legacy: true,
    }
  }

  if (value.schemaVersion !== SETTINGS_TRANSFER_SCHEMA_VERSION) {
    throw new SettingsTransferValidationError('unsupported-schema')
  }
  if (typeof value.appVersion !== 'string' || !value.appVersion.trim()) {
    throw new SettingsTransferValidationError('invalid-transfer')
  }
  if (typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) {
    throw new SettingsTransferValidationError('invalid-transfer')
  }
  if (typeof value.secretsIncluded !== 'boolean' || !isConfigImportValid(value.config)) {
    throw new SettingsTransferValidationError('invalid-transfer')
  }
  if (!value.secretsIncluded && configContainsSafeExportExclusions(value.config)) {
    throw new SettingsTransferValidationError('invalid-transfer')
  }

  return {
    appVersion: value.appVersion,
    schemaVersion: SETTINGS_TRANSFER_SCHEMA_VERSION,
    exportedAt: value.exportedAt,
    config: cloneConfigRecord(value.config),
    secretsIncluded: value.secretsIncluded,
    legacy: false,
  }
}

export function isSettingsTransferValid(value: unknown): boolean {
  try {
    parseSettingsTransfer(value)
    return true
  } catch {
    return false
  }
}
