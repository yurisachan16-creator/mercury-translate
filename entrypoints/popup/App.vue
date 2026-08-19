<template>
  <main class="popup-shell">
    <header class="popup-header">
      <div class="brand">
        <img src="/icon/128.png" alt="" />
        <div>
          <strong>{{ t('brand.productName') }}</strong>
          <small>{{ t('brand.productSubtitle') }} · V{{ version }}</small>
        </div>
      </div>
      <div class="header-actions">
        <button class="settings-button" type="button" :title="t('popup.fullSettings')" :aria-label="t('popup.openFullSettings')" @click="openOptions()">
          <Setting />
          <span>{{ t('popup.settings') }}</span>
        </button>
      </div>
    </header>

    <section class="hero-card">
      <div class="hero-heading">
        <div>
          <span class="eyebrow">{{ t('popup.webTranslation') }}</span>
          <h1>{{ config.on ? t('popup.heroOn') : t('popup.heroOff') }}</h1>
        </div>
        <button class="switch" type="button" role="switch" :aria-checked="config.on" :aria-label="config.on ? t('popup.pauseExtension') : t('popup.enableExtension')" @click="setPluginEnabled(!config.on)"><i /></button>
      </div>

      <div class="language-pair">
        <label>
          <span>{{ t('popup.sourceLanguage') }}</span>
          <select v-model="config.from" :disabled="!config.on">
            <option v-for="item in localizedOptions.form" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <span class="arrow">→</span>
        <label>
          <span>{{ t('popup.targetLanguage') }}</span>
          <select v-model="config.to" :disabled="!config.on">
            <option v-for="item in targetLanguageOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
      </div>

      <div ref="servicePicker" class="service-picker">
        <button
          class="service-field"
          type="button"
          :disabled="!config.on"
          aria-haspopup="listbox"
          :aria-expanded="servicePickerOpen"
          :aria-label="servicePickerAriaLabel"
          :data-selected-model="serviceModelLabel || undefined"
          @click="toggleServicePicker"
        >
          <ServiceIcon :service="config.service" :label="serviceLabel" />
          <span class="service-copy">
            <small>{{ t('popup.translationService') }}</small>
            <span class="service-value">
              <strong>{{ serviceLabel }}</strong>
              <em v-if="serviceModelLabel" class="service-model" :title="serviceModelLabel">{{ serviceModelLabel }}</em>
            </span>
          </span>
          <span class="chevron" :class="{ open: servicePickerOpen }">⌄</span>
        </button>

        <div v-if="servicePickerOpen" class="service-picker-panel" role="listbox" :aria-label="t('popup.serviceList')">
          <div class="service-picker-heading">
            <div><strong>{{ t('popup.chooseTranslationService') }}</strong><small>{{ t('popup.servicePickerHint') }}</small></div>
            <span>{{ serviceOptions.length }}</span>
          </div>

          <div class="service-group">
            <span class="service-group-label">{{ t('popup.popularServices') }}</span>
            <button
              v-for="item in popularServiceOptions"
              :key="item.value"
              class="service-option"
              type="button"
              role="option"
              :data-service-value="item.value"
              :aria-selected="config.service === item.value"
              @click="selectService(item.value)"
            >
              <ServiceIcon :service="item.value" :label="item.label" size="small" />
              <span>{{ item.label }}</span>
              <span v-if="config.service === item.value" class="service-option-check">✓</span>
            </button>
          </div>

          <button class="service-more-toggle" type="button" :aria-expanded="moreServicesOpen" @click="moreServicesOpen = !moreServicesOpen">
            <span>{{ t('popup.moreServices') }}</span>
            <span class="service-more-meta">{{ t('popup.serviceCount', { count: moreServiceOptions.length }) }} <b :class="{ open: moreServicesOpen }">⌄</b></span>
          </button>

          <div v-if="moreServicesOpen" class="service-group service-group-more">
            <button
              v-for="item in moreServiceOptions"
              :key="item.value"
              class="service-option"
              type="button"
              role="option"
              :data-service-value="item.value"
              :aria-selected="config.service === item.value"
              @click="selectService(item.value)"
            >
              <ServiceIcon :service="item.value" :label="item.label" size="small" />
              <span>{{ item.label }}</span>
              <span v-if="config.service === item.value" class="service-option-check">✓</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="credentialWarning" class="credential-warning" role="alert">
        <span><strong>{{ t('popup.configurationReminder') }}</strong>{{ credentialWarning }}</span>
        <button type="button" @click="openOptions('settings-services')">{{ t('popup.goToSettings') }}</button>
      </div>

      <div class="translate-action">
        <button
          class="translate-button"
          :class="{ translated: pageTranslated }"
          type="button"
          :disabled="!config.on || translating"
          :aria-pressed="pageTranslated"
          @click="togglePageTranslation"
        >
          <span v-if="translating" class="spinner" />
          <span v-else class="translate-glyph">{{ t('popup.translateGlyph') }}</span>
          <span class="translate-label">{{ pageTranslated ? t('popup.restoreCurrentPage') : t('popup.translateCurrentPage') }}</span>
          <kbd class="translate-hotkey" :class="{ disabled: fullPageHotkey === t('popup.notSet') }">{{ fullPageHotkey }}</kbd>
        </button>
        <button
          v-if="canUseAIContext"
          class="ai-context-toggle"
          type="button"
          :aria-pressed="config.enableAIContext"
          :aria-label="config.enableAIContext ? t('popup.disableAiRefinement') : t('popup.enableAiRefinement')"
          :title="config.enableAIContext ? t('popup.disableAiRefinement') : t('popup.enableAiRefinement')"
          :disabled="!config.on || translating"
          @click="toggleAIContext"
        >
          <span class="ai-context-copy">{{ t('popup.aiRefinement') }}</span>
          <span class="ai-context-indicator" aria-hidden="true" />
        </button>
      </div>
      <p v-if="notice" class="notice" :class="noticeType">{{ notice }}</p>
    </section>

    <section class="features">
      <span class="eyebrow features-eyebrow">{{ t('popup.quickFeatures') }}</span>
      <div class="feature-grid">
        <button class="feature-card" type="button" :disabled="!config.on" @click="openDrawer('hover')">
          <span class="feature-icon rose">↖</span>
          <span><strong>{{ t('popup.hoverTranslation') }}</strong><small>{{ hoverSummary }}</small></span>
          <i :class="{ active: config.hotkey !== 'none' }" />
        </button>
        <button class="feature-card" type="button" :disabled="!config.on" @click="openDrawer('selection')">
          <span class="feature-icon violet">I</span>
          <span><strong>{{ t('popup.selectionTranslation') }}</strong><small>{{ selectionSummary }}</small></span>
          <i :class="{ active: config.selectionTranslatorMode !== 'disabled' || config.selectionAreaEnabled }" />
        </button>
        <button class="feature-card" type="button" :disabled="!config.on" @click="openDrawer('floating')">
          <span class="feature-icon blue">◉</span>
          <span><strong>{{ t('popup.fullPageFloatingBall') }}</strong><small>{{ config.disableFloatingBall ? t('popup.off') : floatingSummary }}</small></span>
          <i :class="{ active: !config.disableFloatingBall }" />
        </button>
        <button class="feature-card" type="button" :disabled="!config.on" @click="openDrawer('appearance')">
          <span class="feature-icon amber">Aa</span>
          <span><strong>{{ t('popup.translationDisplay') }}</strong><small>{{ displaySummary }}</small></span>
          <b>›</b>
        </button>
        <button class="feature-card" type="button" :disabled="!config.on" @click="openDrawer('image')">
          <span class="feature-icon teal">▧</span>
          <span class="feature-copy">
            <span class="feature-title"><strong>{{ t('popup.imageTranslation') }}</strong><em class="beta-badge">{{ t('popup.betaTest') }}</em></span>
            <small>{{ imageTranslationSummary }}</small>
          </span>
          <i :class="{ active: !config.disableImageTranslator }" />
        </button>
        <button
          class="feature-card video-feature-card"
          :class="{ 'needs-enable': !config.videoTranslationEnabled }"
          data-feature="video-subtitle"
          type="button"
          :disabled="!config.on"
          :aria-label="config.videoTranslationEnabled ? t('popup.openVideoSettingsEnabled') : t('popup.openVideoSettingsDisabled')"
          @click="openDrawer('video')"
        >
          <span class="feature-icon teal">CC</span>
          <span class="feature-copy">
            <span class="feature-title"><strong>{{ t('popup.videoSubtitles') }}</strong><em class="beta-badge">{{ t('popup.betaTest') }}</em></span>
            <small>{{ videoSummary }}</small>
          </span>
          <i :class="{ active: config.videoTranslationEnabled }" />
        </button>
      </div>
    </section>

    <footer>
      <span>{{ t('popup.translationCount', { count: config.count }) }}</span>
      <a
        class="opensource-link"
        href="https://github.com/Bistutu/FluentRead"
        target="_blank"
        rel="noreferrer"
        :aria-label="t('popup.openUpstreamOnGithub')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.26c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.62-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3" />
        </svg>
        <span>{{ t('shell.upstreamProject') }}</span>
        <span class="external-mark" aria-hidden="true">↗</span>
      </a>
      <button type="button" :disabled="clearingCache" @click="clearCache">{{ clearingCache ? t('popup.clearing') : t('popup.clearCache') }}</button>
    </footer>

    <el-drawer
      v-model="drawerVisible"
      direction="btt"
      size="auto"
      :with-header="false"
      :append-to-body="true"
      modal-class="popup-drawer-modal"
      class="popup-drawer"
    >
      <div class="drawer-handle" />
      <header class="drawer-header">
        <div><span class="eyebrow">{{ t('popup.quickSettings') }}</span><h2>{{ drawerTitle }}</h2><p>{{ drawerDescription }}</p></div>
        <button type="button" :aria-label="t('popup.close')" @click="drawerVisible = false">×</button>
      </header>

      <div v-if="activeDrawer === 'hover'" class="drawer-content">
        <div class="interaction-preview"><span class="cursor">↖</span><span>＋</span><kbd>{{ hoverKey }}</kbd><span>＝</span><strong>{{ t('popup.instantTranslation') }}</strong></div>
        <div class="setting-row">
          <span><strong>{{ t('popup.enableHoverTranslation') }}</strong><small>{{ t('popup.hoverInstruction') }}</small></span>
          <button class="switch compact" type="button" role="switch" :aria-checked="config.hotkey !== 'none'" :aria-label="t('popup.toggleHoverTranslation')" @click="toggleHover"><i /></button>
        </div>
        <div class="choice-block">
          <label>{{ t('popup.triggerHotkey') }}</label>
          <div class="chips two">
            <button v-for="item in hoverChoices" :key="item.value" type="button" :class="{ selected: config.hotkey === item.value }" @click="setHoverHotkey(item.value)">{{ item.label }}</button>
          </div>
          <button v-if="config.hotkey === 'custom'" class="secondary-action" type="button" @click="showCustomMouseHotkeyDialog = true">
            {{ config.customHotkey ? t('popup.currentHotkey', { hotkey: config.customHotkey }) : t('popup.recordCustomHotkey') }}
          </button>
        </div>
      </div>

      <div v-else-if="activeDrawer === 'selection'" class="drawer-content">
        <div class="selection-mode-tabs" role="tablist" :aria-label="t('popup.translationMethod')">
          <button class="selection-mode-tab" :class="{ selected: selectionDrawerTab === 'text' }" type="button" role="tab" :aria-selected="selectionDrawerTab === 'text'" aria-controls="selection-text-panel" @click="selectionDrawerTab = 'text'">{{ t('popup.selectionTranslation') }}</button>
          <button class="selection-mode-tab" :class="{ selected: selectionDrawerTab === 'area' }" type="button" role="tab" :aria-selected="selectionDrawerTab === 'area'" aria-controls="selection-area-panel" @click="selectionDrawerTab = 'area'">{{ t('popup.areaTranslation') }}</button>
        </div>

        <div v-if="selectionDrawerTab === 'text'" id="selection-text-panel" role="tabpanel">
          <div class="interaction-preview"><span class="selection-box">{{ t('popup.selectText') }}</span><span>＋</span><i class="pink-dot" /><span>＝</span><strong>{{ t('popup.translateSelection') }}</strong></div>
          <div class="setting-row">
            <span><strong>{{ t('popup.enableSelectionTranslation') }}</strong><small>{{ t('popup.selectionInstruction') }}</small></span>
            <button class="switch compact" type="button" role="switch" :aria-checked="config.selectionTranslatorMode !== 'disabled'" :aria-label="t('popup.toggleSelectionTranslation')" @click="setSelectionMode(config.selectionTranslatorMode === 'disabled' ? 'bilingual' : 'disabled')"><i /></button>
          </div>
          <div class="choice-block">
            <label>{{ t('popup.displayMode') }}</label>
            <div class="chips two">
              <button v-for="item in selectionModes" :key="item.value" type="button" :class="{ selected: config.selectionTranslatorMode === item.value }" @click="setSelectionMode(item.value)">{{ item.label }}</button>
            </div>
          </div>
          <div class="choice-block">
            <label>{{ t('popup.triggerMode') }}</label>
            <div class="chips three">
              <button v-for="item in selectionTriggers" :key="item.value" type="button" :class="{ selected: config.selectionTranslatorTrigger === item.value }" @click="setSelectionTrigger(item.value)">{{ item.label }}</button>
            </div>
            <small class="drawer-hint">{{ t('popup.selectionTriggerHint') }}</small>
          </div>
        </div>

        <div v-else id="selection-area-panel" class="selection-area-panel" role="tabpanel">
          <div class="area-translation-block">
            <div class="area-translation-heading">
              <div>
                <strong>{{ t('popup.enableAreaTranslation') }}</strong>
                <small>{{ t('popup.areaInstruction') }}</small>
              </div>
              <button class="switch compact" type="button" role="switch" :aria-checked="config.selectionAreaEnabled" :aria-label="t('popup.toggleAreaTranslation')" @click="setAreaEnabled(!config.selectionAreaEnabled)"><i /></button>
            </div>
            <div class="area-translation-preview" aria-keyshortcuts="Shift+Z"><div class="area-hotkey"><kbd>Shift</kbd><kbd>Z</kbd></div><span>＋</span><i class="area-ring" /><span>＝</span><strong>{{ t('popup.translateSelectedArea') }}</strong></div>
            <small class="drawer-hint">{{ t('popup.areaHint') }}</small>
          </div>
        </div>
      </div>

      <div v-else-if="activeDrawer === 'floating'" class="drawer-content">
        <div class="setting-row">
          <span><strong>{{ t('popup.enableFloatingBall') }}</strong><small>{{ t('popup.floatingInstruction') }}</small></span>
          <button class="switch compact" type="button" role="switch" :aria-checked="!config.disableFloatingBall" :aria-label="t('popup.toggleFloatingBall')" @click="setFloatingEnabled(config.disableFloatingBall)"><i /></button>
        </div>
        <div class="choice-block">
          <label>{{ t('popup.floatingPosition') }}</label>
          <div class="chips two">
            <button type="button" :class="{ selected: config.floatingBallPosition === 'left' }" @click="config.floatingBallPosition = 'left'">{{ t('popup.pageLeft') }}</button>
            <button type="button" :class="{ selected: config.floatingBallPosition === 'right' }" @click="config.floatingBallPosition = 'right'">{{ t('popup.pageRight') }}</button>
          </div>
        </div>
        <label class="select-row">
          <span><strong>{{ t('popup.fullPageHotkey') }}</strong><small>{{ t('popup.fullPageHotkeyHint') }}</small></span>
          <select v-model="config.floatingBallHotkey" @change="handleFloatingHotkeyChange">
            <option v-for="item in localizedOptions.floatingBallHotkeys" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <button v-if="config.floatingBallHotkey === 'custom'" class="secondary-action" type="button" @click="showCustomHotkeyDialog = true">
          {{ config.customFloatingBallHotkey ? t('popup.currentHotkey', { hotkey: config.customFloatingBallHotkey }) : t('popup.recordCustomHotkey') }}
        </button>
      </div>

      <div v-else-if="activeDrawer === 'image'" class="drawer-content">
        <div class="image-translation-preview">
          <div class="image-translation-preview-art"><span>{{ t('popup.imagePreviewText') }}</span><b>{{ t('popup.imagePreviewBadge') }}</b></div>
          <div>
            <span class="feature-title"><strong>{{ t('popup.imageEntryTitle') }}</strong><em class="beta-badge">{{ t('popup.betaTest') }}</em></span>
            <small>{{ t('popup.imageEntryHint') }}</small>
          </div>
        </div>
        <div class="setting-row">
          <span><strong>{{ t('popup.enableImageTranslation') }}</strong><small>{{ t('popup.imageInstruction') }}</small></span>
          <button class="switch compact" type="button" role="switch" :aria-checked="!config.disableImageTranslator" :aria-label="t('popup.toggleImageTranslation')" @click="setImageTranslatorEnabled(config.disableImageTranslator)"><i /></button>
        </div>
      </div>

      <div v-else-if="activeDrawer === 'video'" class="drawer-content">
        <div class="video-beta-banner"><span class="feature-icon teal">CC</span><span><strong>{{ t('popup.videoBannerTitle') }}</strong><small>{{ t('popup.videoBannerHint') }}</small></span></div>
        <div class="setting-row video-enable-row" :class="{ 'needs-enable': !config.videoTranslationEnabled }">
          <span><strong>{{ config.videoTranslationEnabled ? t('popup.videoEnabledTitle') : t('popup.videoDisabledTitle') }}</strong><small>{{ config.videoTranslationEnabled ? t('popup.videoEnabledHint') : t('popup.videoDisabledHint') }}</small></span>
          <button class="switch compact" type="button" role="switch" :aria-checked="config.videoTranslationEnabled" :aria-label="t('popup.toggleVideoSubtitles')" @click="setVideoTranslationEnabled(!config.videoTranslationEnabled)"><i /></button>
        </div>
        <label class="select-row">
          <span><strong>{{ t('popup.videoTranslationService') }}</strong><small>{{ t('popup.videoServiceHint') }}</small></span>
          <select v-model="config.videoService" :disabled="!config.videoTranslationEnabled" @change="ensureVideoProviderPermission">
            <option v-for="item in videoServiceOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>
        <label class="select-row">
          <span><strong>{{ t('popup.subtitleFontSize') }}</strong><small>{{ t('popup.subtitleFontSizeHint') }}</small></span>
          <select v-model.number="config.videoSubtitleFontSize" :aria-label="t('popup.videoSubtitleFontSize')" :disabled="!config.videoTranslationEnabled">
            <option v-for="size in videoSubtitleFontSizeOptions" :key="size" :value="size">{{ size === 100 ? t('popup.defaultLabel') : `${size}%` }}</option>
          </select>
        </label>
        <small class="drawer-hint">{{ t('popup.videoDrawerHint') }}</small>
      </div>

      <div v-else class="drawer-content">
        <div class="choice-block">
          <label>{{ t('popup.translationMode') }}</label>
          <div class="chips two">
            <button v-for="item in localizedOptions.display" :key="item.value" type="button" :class="{ selected: config.display === item.value }" @click="config.display = item.value">{{ item.label }}</button>
          </div>
        </div>
        <label v-if="config.display === 1" class="select-row">
          <span><strong>{{ t('popup.translationStyle') }}</strong><small>{{ t('popup.translationStyleHint') }}</small></span>
          <select v-model.number="config.style"><option v-for="item in styleOptions" :key="item.value" :value="item.value">{{ item.label }}</option></select>
        </label>
        <label class="select-row">
          <span><strong>{{ t('popup.interfaceTheme') }}</strong><small>{{ t('popup.interfaceThemeHint') }}</small></span>
          <select v-model="config.theme"><option v-for="item in localizedOptions.theme" :key="item.value" :value="item.value">{{ item.label }}</option></select>
        </label>
      </div>

      <button v-if="activeDrawer !== 'image'" class="drawer-settings-link" type="button" @click="openOptions(drawerSettingsSection[activeDrawer])">{{ t('popup.viewAllOptions') }} ↗</button>
    </el-drawer>

    <CustomHotkeyInput v-model="showCustomHotkeyDialog" :current-value="config.customFloatingBallHotkey" @confirm="confirmFloatingHotkey" @cancel="cancelFloatingHotkey" />
    <CustomHotkeyInput v-model="showCustomMouseHotkeyDialog" :current-value="config.customHotkey" @confirm="confirmMouseHotkey" @cancel="cancelMouseHotkey" />
  </main>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import browser from 'webextension-polyfill';
import {
  config as runtimeConfig,
  configReady,
  saveConfig,
  requestConfigSave,
  subscribeConfig,
} from '@/entrypoints/utils/config';
import { Setting } from '@element-plus/icons-vue';
import { Config, VIDEO_SUBTITLE_FONT_SIZE_OPTIONS } from '@/entrypoints/utils/model';
import { getLocalizedOptions, resolveConfiguredModel, services, servicesType } from '@/entrypoints/utils/option';
import { getMissingCredentialMessage } from '@/entrypoints/utils/configValidation';
import { getSelectedModelLabel } from '@/entrypoints/utils/serviceCatalog';
import {requestProviderHostPermission} from '@/entrypoints/utils/providerPermissions';
import {getTranslationTargetOptionsForProvider} from '@/entrypoints/utils/languageRegistry';
import ServiceIcon from '@/components/ServiceIcon.vue';

type DrawerName = 'hover' | 'selection' | 'floating' | 'appearance' | 'image' | 'video';
type SettingsSection = 'settings-general' | 'settings-shortcuts' | 'settings-services' | 'settings-video';
const CustomHotkeyInput = defineAsyncComponent(() => import('@/components/CustomHotkeyInput.vue'));
const version = process.env.VUE_APP_VERSION;
const { t } = useI18n({ useScope: 'global' });
const localizedOptions = computed(() => getLocalizedOptions(t));
const config = ref(new Config());
const drawerVisible = ref(false);
const activeDrawer = ref<DrawerName>('hover');
const selectionDrawerTab = ref<'text' | 'area'>('text');
const translating = ref(false);
const pageTranslated = ref(false);
const clearingCache = ref(false);
const notice = ref('');
const noticeType = ref<'success' | 'error'>('success');
const showCustomHotkeyDialog = ref(false);
const showCustomMouseHotkeyDialog = ref(false);
const servicePicker = ref<HTMLElement | null>(null);
const servicePickerOpen = ref(false);
const moreServicesOpen = ref(false);
const hydrated = ref(false);
let lastSerialized = '';
let applyingExternalConfig = false;
let pageExitSaveStarted = false;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
const drawerSettingsSection: Record<DrawerName, SettingsSection> = {
  hover: 'settings-shortcuts',
  selection: 'settings-shortcuts',
  floating: 'settings-shortcuts',
  appearance: 'settings-general',
  image: 'settings-general',
  video: 'settings-video',
};
const persistConfig = (value: unknown) => requestConfigSave(value, browser.runtime.sendMessage.bind(browser.runtime));

const serviceOptions = computed(() => localizedOptions.value.services.filter((item: any) =>
  !item.disabled && (item.value !== services.deeplx || config.value.enableDeepLXExperimental),
));
const videoServiceOptions = computed(() => serviceOptions.value);
const videoSubtitleFontSizeOptions = VIDEO_SUBTITLE_FONT_SIZE_OPTIONS;
const popularServiceValues = ['freeTranslation', 'microsoft', 'google', 'deepL', 'deeplx', 'deepseek', 'openai', 'gemini', 'claude'];
const popularServiceOptions = computed(() => popularServiceValues
  .map(value => serviceOptions.value.find((item: any) => item.value === value))
  .filter((item): item is any => Boolean(item)));
const moreServiceOptions = computed(() => serviceOptions.value.filter((item: any) => !popularServiceValues.includes(item.value)));
const styleOptions = computed(() => localizedOptions.value.styles.filter((item: any) => !item.disabled));
const serviceLabel = computed(() => serviceOptions.value.find((item: any) => item.value === config.value.service)?.label || config.value.service);
const serviceModelLabel = computed(() => getSelectedModelLabel(config.value.service, config.value.model, config.value.customModel, t));
const aiContextModel = computed(() => resolveConfiguredModel(
  config.value.model[config.value.service],
  config.value.customModel[config.value.service],
));
const canUseAIContext = computed(() => servicesType.isUseAIContext(config.value.service, aiContextModel.value));
const servicePickerAriaLabel = computed(() => serviceModelLabel.value
  ? t('popup.serviceAriaWithModel', { service: serviceLabel.value, model: serviceModelLabel.value })
  : t('popup.serviceAria', { service: serviceLabel.value }));
const credentialWarning = computed(() => getMissingCredentialMessage(config.value.service, config.value));
const targetLanguageOptions = computed(() => getTranslationTargetOptionsForProvider(config.value.service));
const videoServiceLabel = computed(() => videoServiceOptions.value.find((item: any) => item.value === config.value.videoService)?.label || config.value.videoService);
const styleLabel = computed(() => styleOptions.value.find((item: any) => item.value === config.value.style)?.label || t('popup.defaultStyle'));
const hoverKey = computed(() => config.value.hotkey === 'custom' ? (config.value.customHotkey || t('popup.custom')) : config.value.hotkey);
const hoverSummary = computed(() => config.value.hotkey === 'none' ? t('popup.off') : t('popup.hoverSummary', { hotkey: hoverKey.value }));
const fullPageHotkey = computed(() => {
  const hotkey = config.value.floatingBallHotkey === 'custom'
    ? config.value.customFloatingBallHotkey
    : config.value.floatingBallHotkey;
  return hotkey && hotkey !== 'none' ? hotkey : t('popup.notSet');
});
const selectionSummary = computed(() => {
  const textSummary = ({
    disabled: t('popup.off'),
    bilingual: t('popup.bilingualDisplay'),
    'translation-only': t('popup.translationOnlyDisplay'),
  }[config.value.selectionTranslatorMode] || t('popup.bilingualDisplay'));
  if (!config.value.selectionAreaEnabled) return textSummary;
  return textSummary === t('popup.off')
    ? t('popup.areaEnabledSummary')
    : t('popup.selectionWithAreaSummary', { mode: textSummary });
});
const floatingSummary = computed(() => t('popup.floatingSummary', {
  position: config.value.floatingBallPosition === 'left' ? t('popup.pageLeft') : t('popup.pageRight'),
  hotkey: fullPageHotkey.value,
}));
const displaySummary = computed(() => config.value.display === 1
  ? t('popup.bilingualStyleSummary', { style: styleLabel.value })
  : t('popup.translationOnlyDisplay'));
const imageTranslationSummary = computed(() => config.value.disableImageTranslator ? t('popup.off') : t('popup.hoverImages'));
const videoSummary = computed(() => config.value.videoTranslationEnabled
  ? t('popup.videoEnabledSummary', { service: videoServiceLabel.value })
  : t('popup.videoDisabledSummary'));
const drawerTitle = computed(() => ({
  hover: t('popup.hoverDrawerTitle'),
  selection: t('popup.selectionDrawerTitle'),
  floating: t('popup.floatingDrawerTitle'),
  appearance: t('popup.appearanceDrawerTitle'),
  image: t('popup.imageDrawerTitle'),
  video: t('popup.videoDrawerTitle'),
}[activeDrawer.value]));
const drawerDescription = computed(() => ({
  hover: t('popup.hoverDrawerDescription'),
  selection: t('popup.selectionDrawerDescription'),
  floating: t('popup.floatingDrawerDescription'),
  appearance: t('popup.appearanceDrawerDescription'),
  image: t('popup.imageDrawerDescription'),
  video: t('popup.videoDrawerDescription'),
}[activeDrawer.value]));
const hoverChoices = computed(() => [
  { value: 'Control', label: 'Ctrl' },
  { value: 'Alt', label: 'Alt / Option' },
  { value: 'Shift', label: 'Shift' },
  { value: 'custom', label: t('popup.custom') },
]);
const selectionModes = computed(() => [
  { value: 'bilingual', label: t('popup.bilingualDisplay') },
  { value: 'translation-only', label: t('popup.translationOnlyShort') },
]);
const selectionTriggers = computed(() => [
  { value: 'direct', label: t('popup.directPopup') },
  { value: 'icon', label: t('popup.showIcon') },
  { value: 'dot', label: t('popup.showDot') },
]);

function applyTheme(theme: string) {
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'auto' && darkMode.matches));
}

async function hydrate() {
  await configReady;
  Object.assign(config.value, runtimeConfig);
  lastSerialized = JSON.stringify(config.value);
  hydrated.value = true;
  applyTheme(config.value.theme || 'auto');
}
void hydrate();

const unsubscribeConfig = subscribeConfig((value) => {
  const serialized = JSON.stringify(value);
  if (serialized === lastSerialized) return;
  lastSerialized = serialized;
  applyingExternalConfig = true;
  try {
    Object.assign(config.value, value);
  } finally {
    applyingExternalConfig = false;
  }
});

watch(config, async value => {
  if (!hydrated.value || applyingExternalConfig) return;
  const serialized = JSON.stringify(value);
  if (serialized === lastSerialized) return;
  lastSerialized = serialized;
  await persistConfig(value).catch((error) => console.warn('[Mercury Translate] failed to save popup settings', error));
}, { deep: true, flush: 'sync' });
watch(() => config.value.theme, theme => applyTheme(theme || 'auto'));
darkMode.onchange = () => { if (config.value.theme === 'auto') applyTheme('auto'); };

function closeServicePicker(event?: Event) {
  if (event && servicePicker.value?.contains(event.target as Node)) return;
  servicePickerOpen.value = false;
}
function handleServicePickerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeServicePicker();
}
function toggleServicePicker() {
  if (!config.value.on) return;
  servicePickerOpen.value = !servicePickerOpen.value;
  if (servicePickerOpen.value) moreServicesOpen.value = !popularServiceValues.includes(config.value.service);
}
async function selectService(value: string) {
  try {
    const granted = await requestProviderHostPermission(value, config.value);
    if (!granted) {
      showNotice(t('popup.servicePermissionDenied'), 'error');
      return;
    }
  } catch (error) {
    showNotice(error instanceof Error ? error.message : t('popup.servicePermissionFailed'), 'error');
    return;
  }
  config.value.service = value;
  servicePickerOpen.value = false;
}

async function ensureVideoProviderPermission(): Promise<void> {
  try {
    if (await requestProviderHostPermission(config.value.videoService, config.value)) return;
    config.value.videoService = 'chromeTranslator';
    showNotice(t('popup.videoServicePermissionDenied'), 'error');
  } catch (error) {
    config.value.videoService = 'chromeTranslator';
    showNotice(error instanceof Error ? error.message : t('popup.videoServicePermissionFailed'), 'error');
  }
}
function toggleAIContext() {
  if (!canUseAIContext.value || !config.value.on || translating.value) return;
  config.value.enableAIContext = !config.value.enableAIContext;
}
onMounted(() => {
  document.addEventListener('pointerdown', closeServicePicker);
  document.addEventListener('keydown', handleServicePickerKeydown);
});
onUnmounted(() => {
  persistOnPageExit();
  window.removeEventListener('pagehide', saveOnPageHide);
  unsubscribeConfig();
  document.removeEventListener('pointerdown', closeServicePicker);
  document.removeEventListener('keydown', handleServicePickerKeydown);
  darkMode.onchange = null;
  if (noticeTimer) clearTimeout(noticeTimer);
});

function saveOnPageHide() {
  persistOnPageExit();
}
window.addEventListener('pagehide', saveOnPageHide);

// Firefox can trigger both pagehide and unmounted; persist only the latest snapshot once.
function persistOnPageExit() {
  if (!hydrated.value || pageExitSaveStarted) return;
  pageExitSaveStarted = true;
  void saveConfig(config.value).catch((error) => console.warn('[Mercury Translate] failed to save popup settings before close', error));
  void persistConfig(config.value).catch((error) => console.warn('[Mercury Translate] failed to persist popup settings before close', error));
}

function showNotice(message: string, type: 'success' | 'error' = 'success') {
  notice.value = message;
  noticeType.value = type;
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.value = ''; }, 2200);
}

async function broadcast(message: Record<string, unknown>) {
  const tabs = await browser.tabs.query({});
  await Promise.allSettled(tabs.filter(tab => tab.id).map(tab => browser.tabs.sendMessage(tab.id!, message)));
}

function setPluginEnabled(enabled: boolean) {
  config.value.on = enabled;
  if (!enabled) {
    void broadcast({ type: 'toggleFloatingBall', isEnabled: false });
    void broadcast({ type: 'updateSelectionTranslatorMode', mode: 'disabled' });
    void broadcast({ type: 'toggleSelectionAreaTranslator', isEnabled: false });
    void broadcast({ type: 'toggleImageTranslator', isEnabled: false });
    return;
  }

  void broadcast({ type: 'toggleFloatingBall', isEnabled: !config.value.disableFloatingBall });
  void broadcast({ type: 'updateSelectionTranslatorMode', mode: config.value.selectionTranslatorMode });
  void broadcast({ type: 'toggleSelectionAreaTranslator', isEnabled: config.value.selectionAreaEnabled });
  void broadcast({ type: 'toggleImageTranslator', isEnabled: !config.value.disableImageTranslator });
}

function openDrawer(name: DrawerName) { activeDrawer.value = name; drawerVisible.value = true; }
async function openOptions(section?: SettingsSection) {
  if (section) {
    await browser.tabs.create({ url: `${browser.runtime.getURL('options.html')}#${section}` });
  } else {
    await browser.runtime.openOptionsPage();
  }
  window.close();
}

async function togglePageTranslation() {
  if (credentialWarning.value) {
    showNotice(credentialWarning.value, 'error');
    return;
  }

  translating.value = true;
  const action = pageTranslated.value ? 'restore' : 'fullPage';
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    const response = await browser.tabs.sendMessage(tab.id, { type: 'contextMenuTranslate', action }) as { status?: string } | undefined;
    if (response?.status !== 'success') throw new Error(response?.status === 'disabled' ? 'Plugin disabled' : 'Translation failed');
    pageTranslated.value = action === 'fullPage';
    showNotice(pageTranslated.value ? t('popup.translatingCurrentPageNotice') : t('popup.restoredOriginalNotice'));
  } catch (error) {
    console.error(error);
    showNotice(t('popup.currentPageUnsupported'), 'error');
  } finally { translating.value = false; }
}

async function clearCache() {
  clearingCache.value = true;
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    await browser.tabs.sendMessage(tab.id, { message: 'clearCache' });
    showNotice(t('popup.cacheCleared'));
  } catch (error) {
    console.error(error);
    showNotice(t('popup.cacheClearFailed'), 'error');
  } finally { clearingCache.value = false; }
}

function toggleHover() { config.value.hotkey = config.value.hotkey === 'none' ? 'Control' : 'none'; }
function setHoverHotkey(value: string) {
  config.value.hotkey = value;
  if (value === 'custom' && !config.value.customHotkey) showCustomMouseHotkeyDialog.value = true;
}
function setSelectionMode(mode: string) {
  config.value.selectionTranslatorMode = mode;
  config.value.disableSelectionTranslator = mode === 'disabled';
  void broadcast({ type: 'updateSelectionTranslatorMode', mode });
}
function setSelectionTrigger(trigger: string) {
  config.value.selectionTranslatorTrigger = trigger;
}
function setAreaEnabled(enabled: boolean) {
  config.value.selectionAreaEnabled = enabled;
  void broadcast({ type: 'toggleSelectionAreaTranslator', isEnabled: enabled });
}
function setFloatingEnabled(enabled: boolean) {
  config.value.disableFloatingBall = !enabled;
  void broadcast({ type: 'toggleFloatingBall', isEnabled: enabled });
}
function setImageTranslatorEnabled(enabled: boolean) {
  config.value.disableImageTranslator = !enabled;
  void broadcast({ type: 'toggleImageTranslator', isEnabled: enabled });
}
function setVideoTranslationEnabled(enabled: boolean) {
  config.value.videoTranslationEnabled = enabled;
}
function handleFloatingHotkeyChange() {
  if (config.value.floatingBallHotkey === 'custom' && !config.value.customFloatingBallHotkey) showCustomHotkeyDialog.value = true;
}
function confirmFloatingHotkey(hotkey: string) { config.value.customFloatingBallHotkey = hotkey; config.value.floatingBallHotkey = 'custom'; }
function cancelFloatingHotkey() { if (!config.value.customFloatingBallHotkey) config.value.floatingBallHotkey = 'Alt+T'; }
function confirmMouseHotkey(hotkey: string) { config.value.customHotkey = hotkey; config.value.hotkey = 'custom'; }
function cancelMouseHotkey() { if (!config.value.customHotkey) config.value.hotkey = 'Control'; }
</script>
