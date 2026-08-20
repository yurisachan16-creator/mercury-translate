<template>
  <section class="settings-section service-connection-section">
    <div v-if="service === services.chromeTranslator" class="local-provider-status" role="status" aria-live="polite">
      <div>
        <strong>{{ t('serviceConfig.chromeLocalTranslator') }}</strong>
        <p>{{ chromeAvailabilityLabel }}</p>
      </div>
      <button type="button" :disabled="chromeAvailabilityBusy" @click="checkChromeAvailability">
        {{ chromeAvailabilityBusy ? t('serviceConfig.checking') : t('serviceConfig.recheck') }}
      </button>
    </div>
    <div v-if="compute.credentialWarning" class="credential-warning" role="alert">
      <strong>{{ t('serviceConfig.configurationReminder') }}</strong>
      <span>{{ compute.credentialWarning }}</span>
    </div>
    <div v-if="networkConsentRequired" class="network-consent" role="status" aria-live="polite">
      <div>
        <strong>{{ t('serviceConfig.networkConsentTitle') }}</strong>
        <p>{{ t('serviceConfig.networkConsentPrefix') }} {{ serviceLabel }}{{ t('serviceConfig.networkConsentSuffix') }}</p>
      </div>
      <div class="network-consent-actions">
        <button type="button" :disabled="networkConsentBusy" @click="grantNetworkConsent('once')">
          {{ t('serviceConfig.useOnce') }}
        </button>
        <button type="button" class="is-primary" :disabled="networkConsentBusy" @click="grantNetworkConsent('remember-default')">
          {{ networkConsentBusy ? t('serviceConfig.saving') : t('serviceConfig.rememberAsDefault') }}
        </button>
      </div>
      <small v-if="networkConsentMessage">{{ networkConsentMessage }}</small>
    </div>
    <div class="subsection-heading">
      <div>
        <strong>{{ t('serviceConfig.connectionParameters') }}</strong>
        <small class="connection-test-hint">
          {{ compute.showNewAPI ? t('serviceConfig.sub2apiDiscoveryHint') : t('serviceConfig.connectionTestHint') }}
        </small>
      </div>
    </div>

    <Teleport defer to=".detail-hero">
      <button
        v-if="!compute.showNewAPI"
        type="button"
        class="connection-test-button"
        data-connection-test-button
        :disabled="connectionTestBusy"
        @click="testConnection"
      >
        {{ connectionTestBusy ? t('serviceConfig.checking') : t('serviceConfig.checkConnection') }}
      </button>
    </Teleport>

    <div
      v-if="connectionTestMessage"
      class="connection-test-result"
      :class="`is-${connectionTestState}`"
      data-connection-test-status
      role="status"
      aria-live="polite"
    >
      <strong>{{ connectionTestState === 'testing' ? t('serviceConfig.checkingShort') : connectionTestState === 'success' ? t('serviceConfig.connectionOk') : t('serviceConfig.connectionFailed') }}</strong>
      <span>{{ connectionTestMessage }}</span>
    </div>

    <div v-show="compute.showAI && compute.showToken && !compute.showNewAPI" class="api-key-policy">
      <div class="api-key-policy-copy">
        <div class="api-key-policy-title">
          <strong>{{ t('serviceConfig.apiKeyAuth') }}</strong>
          <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.apiKeyAuthTip')" placement="top-start" :show-after="500">
            <el-icon :aria-label="t('serviceConfig.apiKeyAuthHelp')"><InfoFilled /></el-icon>
          </el-tooltip>
          <span class="api-key-policy-status" :class="{ 'is-off': !compute.requireApiKey }">
            {{ compute.requireApiKey ? t('serviceConfig.required') : t('serviceConfig.keyless') }}
          </span>
        </div>
        <small class="api-key-policy-model">{{ config.model[service] || t('serviceConfig.notSelected') }}</small>
      </div>
      <el-switch v-model="compute.requireApiKey" :aria-label="t('serviceConfig.apiKeyRequiredAria')" size="small" />
    </div>

    <el-row v-show="compute.showToken && !compute.showNewAPI" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.accessTokenTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('serviceConfig.accessToken') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12"><el-input v-model="config.token[service]" type="password" show-password :placeholder="t('serviceConfig.accessTokenPlaceholder')" /></el-col>
    </el-row>
    <p v-if="compute.showMiniMaxRegion && minimaxKeyMismatch" class="minimax-key-note is-warning">
      {{ minimaxKeyMismatch }}
    </p>

    <el-row v-show="compute.showMiniMaxRegion" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.minimaxBillingTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('serviceConfig.minimaxBillingPlan') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.minimaxBillingPlan" :aria-label="t('serviceConfig.minimaxBillingPlan')" :placeholder="t('serviceConfig.selectMinimaxBillingPlan')">
          <el-option class="select-left" v-for="item in options.minimaxBillingPlan" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <el-row v-show="compute.showMiniMaxRegion" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.minimaxRegionTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('serviceConfig.minimaxRegion') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.minimaxRegion" :aria-label="t('serviceConfig.minimaxApiRegion')" :placeholder="t('serviceConfig.selectMinimaxApiRegion')">
          <el-option class="select-left" v-for="item in options.minimaxRegion" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <div v-show="compute.showMiniMaxRegion" class="minimax-endpoint" data-minimax-endpoint>
      <span>{{ t('serviceConfig.currentApiEndpoint') }}</span>
      <code>{{ minimaxEndpoint }}</code>
    </div>

    <el-row v-show="compute.showAzureOpenaiEndpoint" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.azureEndpointTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('serviceConfig.azureEndpoint') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-input v-model="config.azureOpenaiEndpoint" placeholder="https://your-resource.openai.azure.com/openai/deployments/your-model/chat/completions?api-version=2024-02-15-preview" :class="{ 'input-error': config.azureOpenaiEndpoint && !isValidAzureEndpoint(config.azureOpenaiEndpoint) }" @change="ensureConfiguredProviderPermission" />
        <div v-if="config.azureOpenaiEndpoint && !isValidAzureEndpoint(config.azureOpenaiEndpoint)" class="error-text">{{ t('serviceConfig.azureEndpointInvalid') }}</div>
      </el-col>
    </el-row>

    <el-row v-show="compute.showDeepLX" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('serviceConfig.deeplxEndpointTip')" placement="top-start" :show-after="500"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.serviceEndpoint') }}</span></el-tooltip>
      </el-col>
      <el-col :span="12"><el-input v-model="config.deeplx" placeholder="http://localhost:1188/translate" @change="ensureConfiguredProviderPermission" /></el-col>
    </el-row>

    <el-row v-show="compute.showAkSk" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.apiKeyTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">API Key<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.ak" :placeholder="t('serviceConfig.accessKeyPlaceholder')" /></el-col>
    </el-row>
    <el-row v-show="compute.showAkSk" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.secretKeyTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">Secret Key<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.sk" type="password" :placeholder="t('serviceConfig.secretKeyPlaceholder')" /></el-col>
    </el-row>

    <el-row v-show="compute.showYoudao" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.youdaoAppKeyTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">App Key<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.youdaoAppKey" :placeholder="t('serviceConfig.youdaoAppKeyPlaceholder')" /></el-col>
    </el-row>
    <el-row v-show="compute.showYoudao" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.youdaoAppSecretTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">App Secret<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.youdaoAppSecret" type="password" show-password :placeholder="t('serviceConfig.youdaoAppSecretPlaceholder')" /></el-col>
    </el-row>

    <el-row v-show="compute.showTencent" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.tencentSecretIdTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">Secret ID<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.tencentSecretId" :placeholder="t('serviceConfig.tencentSecretIdPlaceholder')" /></el-col>
    </el-row>
    <el-row v-show="compute.showTencent" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.tencentSecretKeyTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">Secret Key<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.tencentSecretKey" type="password" show-password :placeholder="t('serviceConfig.tencentSecretKeyPlaceholder')" /></el-col>
    </el-row>

    <el-row v-show="compute.showRobotId" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.robotIdTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.robotId') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.robot_id[service]" :placeholder="t('serviceConfig.cozeRobotIdPlaceholder')" /></el-col>
    </el-row>

    <el-row v-show="compute.showCustom" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.customEndpointTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.customEndpoint') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.custom" :placeholder="t('serviceConfig.customEndpointPlaceholder')" @change="ensureConfiguredProviderPermission" /></el-col>
    </el-row>
    <div v-show="compute.showNewAPI" class="sub2api-setup" data-sub2api-setup>
      <div class="sub2api-step">
        <span class="sub2api-step-index">1</span>
        <label>
          <strong>{{ t('serviceConfig.sub2apiEndpointStep') }}</strong>
          <el-input v-model="config.newApiUrl" :placeholder="t('serviceConfig.sub2apiEndpointPlaceholder')" @change="ensureConfiguredProviderPermission" />
          <small>{{ t('serviceConfig.sub2apiEndpointHelp') }}</small>
        </label>
      </div>

      <div class="sub2api-step">
        <span class="sub2api-step-index">2</span>
        <label>
          <strong>{{ t('serviceConfig.sub2apiKeyStep') }}</strong>
          <el-input v-model="config.token[service]" type="password" show-password :placeholder="t('serviceConfig.accessTokenPlaceholder')" />
          <small>{{ t('serviceConfig.sub2apiKeyHelp') }}</small>
        </label>
      </div>

      <div class="sub2api-step">
        <span class="sub2api-step-index">3</span>
        <div class="sub2api-models">
          <div class="sub2api-models-heading">
            <div>
              <strong>{{ t('serviceConfig.sub2apiModelStep') }}</strong>
              <small>{{ t('serviceConfig.sub2apiModelHelp') }}</small>
            </div>
            <button type="button" :disabled="modelListBusy || !config.newApiUrl || !config.token[service]" @click="fetchNewApiModels">
              {{ modelListBusy ? t('serviceConfig.checking') : t('serviceConfig.sub2apiFetchModels') }}
            </button>
          </div>

          <el-select
            v-if="discoveredModels.length"
            v-model="selectedDiscoveredModel"
            filterable
            :placeholder="t('serviceConfig.sub2apiSelectModel')"
            @change="selectDiscoveredModel"
          >
            <el-option v-for="model in discoveredModels" :key="model.id" :label="formatModelOption(model)" :value="model.id" />
          </el-select>

          <el-input v-model="config.customModel[service]" :placeholder="t('serviceConfig.sub2apiManualModelPlaceholder')" @input="setManualModel" />
          <p v-if="modelListMessage" class="sub2api-model-message" :class="`is-${modelListState}`" role="status" aria-live="polite">{{ modelListMessage }}</p>
        </div>
      </div>

      <div class="sub2api-step">
        <span class="sub2api-step-index">4</span>
        <p class="sub2api-save-note">{{ t('serviceConfig.sub2apiSaveHelp') }}</p>
      </div>
    </div>

    <el-row v-show="compute.showCustomModel && !compute.showNewAPI" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.customModelTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ service === 'doubao' ? t('serviceConfig.endpoint') : t('serviceConfig.customModel') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-input v-model="config.customModel[service]" :placeholder="t('serviceConfig.customModelPlaceholder')" /></el-col>
    </el-row>

    <el-row v-show="compute.showDeepseekApiType" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.deepseekApiTypeTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.apiFormat') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-select v-model="config.deepseekApiType" :placeholder="t('serviceConfig.selectApiFormat')"><el-option class="select-left" v-for="item in options.deepseekApiType" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-col>
    </el-row>
    <el-row v-show="compute.showDeepseekThinkingMode" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.deepseekThinkingModeTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.thinkingMode') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12"><el-select v-model="config.deepseekThinkingMode" :placeholder="t('serviceConfig.selectThinkingMode')"><el-option class="select-left" v-for="item in options.deepseekThinkingMode" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-col>
    </el-row>

    <el-row v-show="compute.showCustomBody" class="margin-bottom margin-left-2em">
      <el-col :span="12" class="lightblue rounded-corner"><el-tooltip effect="dark" :content="t('serviceConfig.customBodyTip')" placement="top-start" :show-after="300"><span class="popup-text popup-vertical-left">{{ t('serviceConfig.customBody') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span></el-tooltip></el-col>
      <el-col :span="12">
        <el-input v-model="config.customBody[service]" :class="{ 'input-error': !isValidCustomBody(config.customBody[service]) }" :placeholder="t('serviceConfig.customBodyPlaceholder')" />
        <div v-if="!isValidCustomBody(config.customBody[service])" class="error-text">{{ t('serviceConfig.customBodyInvalid') }}</div>
      </el-col>
    </el-row>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import type { Config } from '@/entrypoints/utils/model'
import { customModelString, options as optionConfig, services } from '@/entrypoints/utils/option'
import { isValidCustomBody } from '@/entrypoints/utils/custom-body'
import browser from 'webextension-polyfill'
import { requestConfigSave } from '@/entrypoints/utils/config'
import { CONNECTION_TEST_MESSAGE, MINIMAX_ENDPOINTS } from '@/entrypoints/utils/constant'
import { PROVIDER_NETWORK_CONSENT_MESSAGE, getNetworkConsentScopeId, type NetworkConsentMode } from '@/entrypoints/utils/providerConsent'
import { getProviderDescriptor } from '@/entrypoints/utils/providerCapabilities'
import {requestProviderHostPermission} from '@/entrypoints/utils/providerPermissions'
import {useI18n} from 'vue-i18n'

const props = defineProps<{
  config: Config
  service: string
  compute: Record<string, any>
  options: typeof optionConfig
  isValidAzureEndpoint: (endpoint: string) => boolean
}>()

const config = toRef(props, 'config')
const service = toRef(props, 'service')
const compute = toRef(props, 'compute')
const options = toRef(props, 'options')
const isValidAzureEndpoint = toRef(props, 'isValidAzureEndpoint')
const networkConsentBusy = ref(false)
const networkConsentMessage = ref('')
const {t} = useI18n({useScope: 'global'})
type ChromeAvailability = 'idle' | 'checking' | 'ready' | 'downloadable' | 'downloading' | 'unsupported' | 'after-detection'
const chromeAvailability = ref<ChromeAvailability>('idle')
const chromeAvailabilityBusy = computed(() => chromeAvailability.value === 'checking')
const chromeAvailabilityLabel = computed(() => ({
  idle: t('serviceConfig.chromeAvailabilityIdle'),
  checking: t('serviceConfig.chromeAvailabilityChecking'),
  ready: t('serviceConfig.chromeAvailabilityReady'),
  downloadable: t('serviceConfig.chromeAvailabilityDownloadable'),
  downloading: t('serviceConfig.chromeAvailabilityDownloading'),
  unsupported: t('serviceConfig.chromeAvailabilityUnsupported'),
  'after-detection': t('serviceConfig.chromeAvailabilityAfterDetection'),
} as Record<ChromeAvailability, string>)[chromeAvailability.value])
let chromeAvailabilityRequest = 0

async function checkChromeAvailability(): Promise<void> {
  if (service.value !== services.chromeTranslator) return
  const requestId = ++chromeAvailabilityRequest
  chromeAvailability.value = 'checking'
  try {
    const response = await browser.runtime.sendMessage({
      type: 'provider.checkAvailability',
      providerId: services.chromeTranslator,
      from: config.value.from,
      to: config.value.to,
    }) as {success?: boolean; availability?: ChromeAvailability} | undefined
    if (requestId !== chromeAvailabilityRequest) return
    chromeAvailability.value = response?.success && response.availability
      ? response.availability
      : 'unsupported'
  } catch {
    if (requestId === chromeAvailabilityRequest) chromeAvailability.value = 'unsupported'
  }
}

const providerDescriptor = computed(() => getProviderDescriptor(
  service.value,
  service.value === 'custom' ? config.value.custom : undefined,
))
const networkConsentRequired = computed(() => providerDescriptor.value.requiresNetworkConsent)
const serviceLabel = computed(() => {
  const serviceOption = options.value.services.find((item) => item.value === service.value)
  return serviceOption?.label || service.value
})

const minimaxKeyKind = computed(() => {
  const token = config.value.token[service.value]?.trim() || ''
  return token.startsWith('sk-cp-') ? 'token-plan' : token ? 'other' : 'empty'
})

const minimaxKeyMismatch = computed(() => {
  if (minimaxKeyKind.value === 'empty') return ''
  if (config.value.minimaxBillingPlan === 'token-plan' && minimaxKeyKind.value !== 'token-plan') {
    return t('serviceConfig.minimaxTokenPlanMismatch')
  }
  if (config.value.minimaxBillingPlan === 'payg' && minimaxKeyKind.value === 'token-plan') {
    return t('serviceConfig.minimaxPaygMismatch')
  }
  return config.value.minimaxBillingPlan === 'token-plan'
    ? t('serviceConfig.minimaxTokenPlanNote')
    : ''
})

const minimaxEndpoint = computed(() => {
  const plan = config.value.minimaxBillingPlan === 'token-plan' ? 'token-plan' : 'payg'
  const region = config.value.minimaxRegion === 'cn' ? 'cn' : 'global'
  return MINIMAX_ENDPOINTS[plan][region]
})

type ConnectionTestState = 'idle' | 'testing' | 'success' | 'error'
type ModelListState = 'idle' | 'success' | 'manual' | 'error'
type ProviderModelListResponse =
  | { success: true; status: 'available'; models: Array<{id: string; ownedBy?: string}> }
  | { success: true; status: 'manual'; reason?: string }
  | { success: false; code?: string; details?: {status?: number} }

const connectionTestBusy = ref(false)
const connectionTestState = ref<ConnectionTestState>('idle')
const connectionTestMessage = ref('')
const modelListBusy = ref(false)
const modelListState = ref<ModelListState>('idle')
const modelListMessage = ref('')
const discoveredModels = ref<Array<{id: string; ownedBy?: string}>>([])
const selectedDiscoveredModel = ref('')

function resetConnectionTest(): void {
  connectionTestState.value = 'idle'
  connectionTestMessage.value = ''
}

async function ensureConfiguredProviderPermission(): Promise<void> {
  try {
    const permissionGranted = await requestProviderHostPermission(service.value, config.value)
    if (permissionGranted) return
    connectionTestState.value = 'error'
    connectionTestMessage.value = t('serviceConfig.providerPermissionDenied')
  } catch (error) {
    connectionTestState.value = 'error'
    connectionTestMessage.value = error instanceof Error ? error.message : t('serviceConfig.providerPermissionDenied')
  }
}

async function testConnection(): Promise<void> {
  if (connectionTestBusy.value || service.value === services.newapi) return

  connectionTestBusy.value = true
  connectionTestState.value = 'testing'
  connectionTestMessage.value = t('serviceConfig.connectionTestSaving')

  try {
    const permissionGranted = await requestProviderHostPermission(service.value, config.value)
    if (!permissionGranted) throw new Error(t('serviceConfig.providerPermissionDenied'))
    await requestConfigSave(config.value, browser.runtime.sendMessage.bind(browser.runtime))
    const response = await browser.runtime.sendMessage({
      type: CONNECTION_TEST_MESSAGE,
      service: service.value,
    }) as {success?: boolean; durationMs?: number; error?: string} | undefined

    if (!response?.success) {
      throw new Error(response?.error || t('serviceConfig.connectionTestFailed'))
    }

    connectionTestState.value = 'success'
    connectionTestMessage.value = `${t('serviceConfig.connectionTestCompleted')}${typeof response.durationMs === 'number' ? ` (${response.durationMs} ms)` : ''}${t('serviceConfig.period')}`
  } catch (error) {
    connectionTestState.value = 'error'
    connectionTestMessage.value = error instanceof Error ? error.message : String(error)
  } finally {
    connectionTestBusy.value = false
  }
}

function setManualModel(): void {
  if (service.value !== services.newapi) return
  config.value.model[service.value] = customModelString
}

function selectDiscoveredModel(modelId: string): void {
  if (service.value !== services.newapi || !modelId) return
  config.value.model[service.value] = modelId
}

function formatModelOption(model: {id: string; ownedBy?: string}): string {
  return model.ownedBy ? `${model.id} · ${model.ownedBy}` : model.id
}

function formatModelListError(response: Extract<ProviderModelListResponse, {success: false}>): string {
  const key = response.code || 'openai-compatible-upstream-failure'
  const messageKey = `serviceConfig.sub2apiErrors.${key}`
  const status = response.details?.status
  const message = t(messageKey)
  return status ? `${message} (${status})` : message
}

async function fetchNewApiModels(): Promise<void> {
  if (modelListBusy.value || service.value !== services.newapi) return
  modelListBusy.value = true
  modelListState.value = 'idle'
  modelListMessage.value = t('serviceConfig.sub2apiFetchingModels')
  discoveredModels.value = []
  try {
    const permissionGranted = await requestProviderHostPermission(service.value, config.value)
    if (!permissionGranted) throw new Error(t('serviceConfig.providerPermissionDenied'))
    await requestConfigSave(config.value, browser.runtime.sendMessage.bind(browser.runtime))
    const response = await browser.runtime.sendMessage({
      type: 'provider.listModels',
      providerId: services.newapi,
    }) as ProviderModelListResponse | undefined

    if (!response) throw new Error(t('serviceConfig.sub2apiErrors.openai-compatible-invalid-response'))
    if (!response.success) {
      modelListState.value = 'error'
      modelListMessage.value = formatModelListError(response)
      return
    }
    if (response.status === 'manual') {
      modelListState.value = 'manual'
      modelListMessage.value = t('serviceConfig.sub2apiManualFallback')
      return
    }

    discoveredModels.value = response.models
    modelListState.value = 'success'
    modelListMessage.value = response.models.length
      ? t('serviceConfig.sub2apiModelsLoaded', { count: response.models.length })
      : t('serviceConfig.sub2apiNoModels')
  } catch (error) {
    modelListState.value = 'error'
    modelListMessage.value = error instanceof Error ? error.message : t('serviceConfig.sub2apiErrors.openai-compatible-upstream-failure')
  } finally {
    modelListBusy.value = false
  }
}

async function grantNetworkConsent(mode: NetworkConsentMode): Promise<void> {
  if (networkConsentBusy.value || !networkConsentRequired.value) return
  networkConsentBusy.value = true
  networkConsentMessage.value = ''
  try {
    const permissionGranted = await requestProviderHostPermission(service.value, config.value)
    if (!permissionGranted) throw new Error(t('serviceConfig.networkPermissionDenied'))
    const response = await browser.runtime.sendMessage({
      type: PROVIDER_NETWORK_CONSENT_MESSAGE,
      providerId: service.value,
      mode,
      consentScopeId: getNetworkConsentScopeId(),
    }) as {success?: boolean; error?: string} | undefined
    if (!response?.success) throw new Error(response?.error || t('serviceConfig.networkConsentFailed'))
    networkConsentMessage.value = mode === 'once'
      ? t('serviceConfig.networkConsentOnceGranted')
      : t('serviceConfig.networkConsentRemembered')
  } catch (error) {
    networkConsentMessage.value = error instanceof Error ? error.message : t('serviceConfig.networkConsentFailed')
  } finally {
    networkConsentBusy.value = false
  }
}

watch(service, () => {
  resetConnectionTest()
  networkConsentMessage.value = ''
  modelListState.value = 'idle'
  modelListMessage.value = ''
  discoveredModels.value = []
  selectedDiscoveredModel.value = ''
})

watch(
  () => [service.value, config.value.from, config.value.to],
  () => {
    if (service.value === services.chromeTranslator) void checkChromeAvailability()
  },
  {immediate: true},
)
</script>

<style scoped>
.credential-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 16px;
  padding: 11px 13px;
  border: 1px solid #f3d19e;
  border-radius: 10px;
  color: #8a5a00;
  background: #fdf6ec;
  font-size: 12px;
  line-height: 1.5;
  animation: credential-warning-breathe 2.8s ease-in-out infinite;
}

.local-provider-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 0 0 16px;
  padding: 12px 13px;
  border: 1px solid #b8e0cb;
  border-radius: 10px;
  color: #276b48;
  background: #effaf3;
  font-size: 12px;
  line-height: 1.5;
}
.local-provider-status p { margin: 3px 0 0; }
.local-provider-status button {
  flex: none;
  border: 1px solid #8fc8aa;
  border-radius: 7px;
  padding: 6px 9px;
  color: #276b48;
  background: #fff;
  cursor: pointer;
  font: inherit;
}
.local-provider-status button:disabled { cursor: wait; opacity: .65; }

.network-consent {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
  padding: 12px 13px;
  border: 1px solid #f3d19e;
  border-radius: 10px;
  color: #7a4c00;
  background: #fff8eb;
  font-size: 12px;
  line-height: 1.5;
}

.network-consent p { margin: 3px 0 0; }
.network-consent-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.network-consent-actions button {
  border: 1px solid #d9a441;
  border-radius: 7px;
  padding: 6px 9px;
  color: #7a4c00;
  background: #fff;
  font: inherit;
  cursor: pointer;
}
.network-consent-actions button.is-primary { color: #fff; background: #b87816; }
.network-consent-actions button:disabled { cursor: wait; opacity: .65; }
.network-consent small { color: #8a5a00; }

.subsection-heading {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}

.subsection-heading > div:first-child {
  display: flex;
  min-width: 0;
  align-items: baseline;
  gap: 9px;
}

.connection-test-hint {
  color: #9098a8;
  font-size: 11px;
  font-weight: 400;
}

.connection-test-button {
  flex: 0 0 auto;
  align-self: flex-start;
  margin-left: auto;
  padding: 8px 14px;
  border: 1px solid #ef4776;
  border-radius: 9px;
  color: #c52f58;
  background: #fff4f7;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 160ms ease;
}

.connection-test-button:hover:not(:disabled) {
  color: #fff;
  background: #ef4776;
  box-shadow: 0 6px 14px rgba(214, 50, 96, .18);
}

.connection-test-button:disabled {
  cursor: wait;
  opacity: .65;
}

.connection-test-result {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid #dfe3eb;
  border-radius: 10px;
  color: #667187;
  background: #f7f8fa;
  font-size: 12px;
  line-height: 1.5;
}

.connection-test-result.is-testing {
  border-color: #c9d9f3;
  color: #45628c;
  background: #f2f7ff;
}

.connection-test-result.is-success {
  border-color: #b8e0cb;
  color: #287447;
  background: #effaf3;
}

.connection-test-result.is-error {
  border-color: #f2c0ca;
  color: #a52c48;
  background: #fff1f4;
}

.minimax-key-note {
  margin: -8px 0 14px 2em;
  color: #6d7890;
  font-size: 11px;
  line-height: 1.5;
}

.minimax-key-note.is-warning {
  color: #a52c48;
}

.minimax-endpoint {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: -4px 0 14px 2em;
  color: #8993a5;
  font-size: 11px;
  line-height: 1.5;
}

.minimax-endpoint code {
  overflow-wrap: anywhere;
  color: #59657b;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

@media (max-width: 700px) {
  .subsection-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .subsection-heading > div:first-child {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .connection-test-button {
    width: 100%;
    margin-left: 0;
  }
}

.credential-warning strong {
  flex: 0 0 auto;
  font-weight: 750;
}

@keyframes credential-warning-breathe {
  0%, 100% { border-color: #f3d19e; box-shadow: 0 0 0 0 rgba(243, 209, 158, 0); }
  50% { border-color: #e8b468; box-shadow: 0 0 0 4px rgba(243, 209, 158, .2); }
}

@media (prefers-reduced-motion: reduce) {
  .credential-warning { animation: none; }
}

.api-key-policy {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 0 10px;
  padding: 12px 16px;
  border: 1px solid #edf0f5;
  border-radius: 16px;
  background: #fbfcfe;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}

.api-key-policy:hover {
  border-color: #e5b4c2;
  background: #fff;
  box-shadow: 0 8px 22px rgba(31, 40, 61, .04);
}

.api-key-policy-copy {
  min-width: 0;
}

.api-key-policy-title {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: #172033;
  font-size: 13px;
}

.api-key-policy-title strong {
  font-weight: 650;
}

.api-key-policy-title .el-icon {
  color: #8b93a4;
  font-size: 13px;
}

.api-key-policy-status {
  display: inline-flex;
  align-items: center;
  margin-left: 3px;
  padding: 2px 7px;
  border: 1px solid #f4c5d2;
  border-radius: 999px;
  color: #c52f58;
  background: #fff2f5;
  font-size: 10px;
  font-weight: 750;
  line-height: 1.3;
}

.api-key-policy-status.is-off {
  border-color: #dfe3eb;
  color: #687286;
  background: #f5f6f8;
}

.api-key-policy-model {
  display: block;
  max-width: 100%;
  margin-top: 4px;
  overflow: hidden;
  color: #909399;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-key-policy :deep(.el-switch) {
  flex: 0 0 auto;
  --el-switch-on-color: #ef4776;
  --el-switch-off-color: #cfd5df;
}

.sub2api-setup {
  display: grid;
  gap: 12px;
  margin: 0 0 14px;
  padding: 14px;
  border: 1px solid #e8ebf2;
  border-radius: 16px;
  background: #fbfcfe;
}

.sub2api-step {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.sub2api-step-index {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  color: #c52f58;
  background: #fff2f5;
  font-size: 11px;
  font-weight: 800;
}

.sub2api-step label,
.sub2api-models {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.sub2api-step strong {
  color: #172033;
  font-size: 12px;
  font-weight: 700;
}

.sub2api-step small,
.sub2api-save-note {
  margin: 0;
  color: #818a9d;
  font-size: 11px;
  line-height: 1.45;
}

.sub2api-models-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sub2api-models-heading > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.sub2api-models-heading button {
  flex: 0 0 auto;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #ef4776;
  border-radius: 8px;
  color: #c52f58;
  background: #fff4f7;
  font: inherit;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.sub2api-models-heading button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.sub2api-model-message {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
}

.sub2api-model-message.is-success {
  color: #287447;
}

.sub2api-model-message.is-manual {
  color: #7a5a00;
}

.sub2api-model-message.is-error {
  color: #a52c48;
}
</style>
