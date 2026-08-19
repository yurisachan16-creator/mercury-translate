<template>
  <section v-show="props.activeSection === 'settings-general'" id="settings-general" class="settings-section">
  <!-- 开关 -->
  <el-row class="margin-bottom margin-left-2em settings-status-row">
    <el-col :span="18" class="lightblue rounded-corner">
      <div class="settings-status-copy">
        <span class="settings-status-kicker">{{ config.on ? t('main.statusWorking') : t('main.statusPaused') }}</span>
        <strong>{{ t('main.pluginStatus') }}</strong>
        <small>{{ config.on ? t('main.statusEnabledDetail') : t('main.statusPausedDetail') }}</small>
      </div>
    </el-col>

    <el-col :span="6" class="flex-end settings-status-control">
      <span class="settings-status-badge" :class="{ active: config.on }"><i />{{ config.on ? t('main.enabled') : t('main.paused') }}</span>
      <el-switch class="settings-switch" v-model="config.on" :aria-label="t('main.pluginStatus')" size="large" @change="handlePluginStateChange" />
    </el-col>
  </el-row>

  <!-- 占位符 -->
  <div v-if="!config.on">
    <el-empty :description="t('main.pluginDisabled')" />
  </div>

  <div v-show="config.on">
    <!--    翻译模式-->
    <el-row class="margin-bottom margin-left-2em settings-preference-row">
      <el-col :span="12" class="lightblue rounded-corner">
        <span class="popup-text popup-vertical-left">{{ t('main.displayMode') }}</span>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.display" :aria-label="t('main.displayMode')" :placeholder="t('main.selectDisplayMode')">
          <el-option class="select-left" v-for="item in localizedOptions.display" :key="item.value" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 默认目标语言 -->
    <el-row class="margin-bottom margin-left-2em settings-preference-row">
      <el-col :span="12" class="lightblue rounded-corner">
        <span class="popup-text popup-vertical-left">{{ t('main.defaultTargetLanguage') }}</span>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.to" :aria-label="t('main.defaultTargetLanguage')" :placeholder="t('main.selectTargetLanguage')">
          <el-option class="select-left" v-for="item in translationTargetOptions" :key="item.value" :label="item.label"
            :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 文本与视频使用独立的翻译服务 -->
    <el-row class="margin-bottom margin-left-2em settings-preference-row">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.textServiceTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('main.textTranslationService') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.service" :aria-label="t('main.textTranslationService')" :placeholder="t('main.selectTextService')" @change="ensureTextProviderPermission">
          <el-option class="select-left" v-for="item in visibleServiceOptions" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
        </el-select>
      </el-col>
    </el-row>

    <el-row class="margin-bottom margin-left-2em settings-preference-row">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.videoServiceTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('main.videoTranslationService') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.videoService" :aria-label="t('main.videoTranslationService')" :placeholder="t('main.selectVideoService')" @change="ensureVideoProviderPermission">
          <el-option class="select-left" v-for="item in videoServiceOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
    </el-row>

    <!--    译文样式选择器-->
    <el-row v-show="config.display === 1" class="margin-bottom margin-left-2em settings-preference-row">
      <el-col :span="12" class="lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.translationStyleTip')" placement="top-start"
          :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('main.translationStyle') }}<el-icon class="icon-margin">
              <InfoFilled />
            </el-icon></span>
        </el-tooltip>
      </el-col>
      <el-col :span="12">
        <el-select v-model="config.style" :aria-label="t('main.translationStyle')" :placeholder="t('main.selectTranslationStyle')">
          <el-option-group v-for="group in styleGroups" :key="group.value" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"
              :class="item.class" />
          </el-option-group>
        </el-select>
      </el-col>
    </el-row>

    <section v-show="config.display === 1" class="style-preview-card" aria-live="polite">
      <div class="style-preview-heading">
        <div><span>{{ t('main.livePreview') }}</span><strong>{{ t('main.translationStyle') }}</strong></div>
      </div>
      <div class="style-preview-example">
        <p class="style-preview-source">{{ t('main.stylePreviewSource') }}</p>
        <p :key="config.style" class="style-preview-text" :class="currentStyleClass">{{ t('main.stylePreviewText') }}</p>
      </div>
      <small class="style-preview-note">{{ t('main.stylePreviewNote') }}</small>
    </section>
  </div>
  </section>

  <div v-if="!config.on && !['settings-general', 'settings-image-translation'].includes(props.activeSection)" class="disabled-section">
    <strong>{{ t('main.pluginCurrentlyOff') }}</strong>
    <p>{{ t('main.enableInGeneralFirst') }}</p>
  </div>

  <div v-show="config.on" class="settings-main-sections">

    <!-- 翻译服务 -->
    <section v-show="props.activeSection === 'settings-services'" id="settings-services" class="settings-section">
      <ServiceCatalog
        :service="selectedConfigurationService"
        :default-service="config.service"
        :selected-model="config.model[selectedConfigurationService]"
        :services="configurationCompute.filteredServices"
        :model-options="configurationCompute.model"
        :show-model="configurationCompute.showModel"
        @update:service="setConfigurationService"
        @update:model="config.model[selectedConfigurationService] = $event"
      >
        <template #configuration>
          <ServiceConfiguration
            :config="config"
            :service="selectedConfigurationService"
            :compute="configurationCompute"
            :options="localizedOptions"
            :is-valid-azure-endpoint="isValidAzureEndpoint"
          />
        </template>
      </ServiceCatalog>

    </section>

    <!-- 图片翻译与 OCR 语言包 -->
    <section v-show="props.activeSection === 'settings-image-translation'" id="settings-image-translation" class="settings-section image-ocr-section">
      <div class="image-ocr-heading">
        <div>
          <span class="image-ocr-kicker">{{ t('main.betaTest') }}</span>
          <h2>{{ t('main.imageOcrTitle') }}</h2>
          <p>{{ t('main.imageOcrDescription') }}</p>
        </div>
        <span class="image-ocr-runtime-badge">{{ t('main.downloadOnDemand') }}</span>
      </div>

      <div class="image-ocr-recommendation">
        <div>
          <strong>{{ t('main.imageOcrRecommendedTitle') }}</strong>
          <p>{{ t('main.imageOcrRecommendedDescription') }}</p>
        </div>
        <button
          type="button"
          class="image-ocr-primary-action"
          :disabled="imageOcrRecommendedReady || imageOcrRecommendedDownloading"
          @click="downloadImageOcrLanguages(imageOcrRecommendedCodes)"
        >
          {{ imageOcrRecommendedReady ? t('main.recommendedReady') : imageOcrRecommendedDownloading ? t('main.downloading') : t('main.downloadRecommended') }}
        </button>
      </div>

      <div class="image-ocr-pack-list">
        <article v-for="pack in imageOcrLanguagePacks" :key="pack.code" class="image-ocr-pack-card">
          <div class="image-ocr-pack-icon">{{ ocrPackIcon(pack.code) }}</div>
          <div class="image-ocr-pack-copy">
            <div class="image-ocr-pack-title">
              <strong>{{ pack.label }}</strong>
              <span v-if="pack.recommended" class="image-ocr-recommended">{{ t('main.recommended') }}</span>
            </div>
            <small>{{ pack.description }} · {{ pack.size }}</small>
          </div>
          <div class="image-ocr-pack-action">
            <span :class="['image-ocr-pack-status', { ready: imageOcrDownloadedCodes.includes(pack.code) }]">
              {{ imageOcrDownloadedCodes.includes(pack.code) ? t('main.downloaded') : t('main.notDownloaded') }}
            </span>
            <button
              type="button"
              class="image-ocr-download-button"
              :disabled="imageOcrDownloadedCodes.includes(pack.code) || imageOcrDownloadingCodes.includes(pack.code)"
              @click="downloadImageOcrLanguages([pack.code])"
            >
              {{ imageOcrDownloadedCodes.includes(pack.code) ? t('main.ready') : imageOcrDownloadingCodes.includes(pack.code) ? t('main.downloading') : t('main.download') }}
            </button>
          </div>
        </article>
      </div>

      <p v-if="imageOcrDownloadError" class="image-ocr-error">{{ imageOcrDownloadError }}</p>
      <div class="image-ocr-footnote-row">
        <p class="image-ocr-footnote">{{ t('main.imageOcrFootnote') }}</p>
        <button
          type="button"
          class="image-ocr-clear-button"
          :disabled="imageOcrDownloadedCodes.length === 0 || imageOcrClearing"
          @click="clearImageOcrLanguages"
        >
          {{ imageOcrClearing ? t('main.clearing') : t('main.clearDownloadedModels') }}
        </button>
      </div>
    </section>

    <!-- 视频字幕 Beta -->
    <section v-show="props.activeSection === 'settings-video'" id="settings-video" class="settings-section">
      <div class="video-settings-hero">
        <div><span class="eyebrow">{{ t('main.betaFeature') }}</span><h2>{{ t('main.youtubeSubtitles') }}</h2><p>{{ t('main.videoHeroDescription') }}</p></div>
        <el-switch v-model="config.videoTranslationEnabled" class="settings-switch" :aria-label="t('main.videoSubtitleTranslation')" />
      </div>

      <el-row class="settings-control-row">
        <el-col :span="12" class="settings-control-label lightblue rounded-corner">
          <el-tooltip class="box-item" effect="dark" :content="t('main.videoServiceAdvancedTip')" placement="top-start" :show-after="500">
            <span class="popup-text popup-vertical-left">{{ t('main.videoTranslationService') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
          </el-tooltip>
        </el-col>
        <el-col :span="12" class="settings-control-field">
          <el-select v-model="config.videoService" :aria-label="t('main.videoSubtitleService')" :disabled="!config.videoTranslationEnabled" :placeholder="t('main.selectService')" @change="ensureVideoProviderPermission">
            <el-option class="select-left" v-for="item in videoServiceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-col>
      </el-row>

      <el-row class="settings-control-row">
        <el-col :span="12" class="settings-control-label lightblue rounded-corner">
          <el-tooltip class="box-item" effect="dark" :content="t('main.subtitleFontSizeTip')" placement="top-start" :show-after="500">
            <span class="popup-text popup-vertical-left">{{ t('main.subtitleFontSize') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
          </el-tooltip>
        </el-col>
        <el-col :span="12" class="settings-control-field">
          <el-select v-model="config.videoSubtitleFontSize" :aria-label="t('main.videoSubtitleFontSize')" :disabled="!config.videoTranslationEnabled" :placeholder="t('main.selectFontSize')">
            <el-option class="select-left" v-for="size in videoSubtitleFontSizeOptions" :key="size" :label="size === 100 ? t('main.defaultLabel') : `${size}%`" :value="size" />
          </el-select>
        </el-col>
      </el-row>

      <div class="video-settings-note">
        <strong>{{ t('main.usage') }}</strong>
        <p>{{ t('main.videoUsageDescription') }}</p>
      </div>
    </section>



    <!-- 鼠标悬浮快捷键 -->
    <section v-show="props.activeSection === 'settings-shortcuts'" id="settings-shortcuts" class="settings-section">
    <el-row class="settings-control-row" :class="{ 'custom-hotkey-row': config.hotkey === 'custom' }">
      <el-col :span="14" class="settings-control-label lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.mouseHoverHotkeyTip')" placement="top-start" :show-after="500">
        <span class="popup-text popup-vertical-left">
          {{ t('main.mouseHoverHotkey') }}
          <el-icon class="icon-margin">
            <InfoFilled />
          </el-icon>
        </span>
        </el-tooltip>
      </el-col>
      <el-col :span="10" class="settings-control-field flex-end">
        <div class="hotkey-config">
          <el-select 
            v-model="config.hotkey" 
            :aria-label="t('main.mouseHoverHotkey')"
            :placeholder="t('main.selectHotkey')"
            size="small" 
            style="width: 100%"
            @change="handleMouseHotkeyChange"
          >
            <el-option v-for="item in localizedOptions.keys" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" :class="{ 'select-divider': item.disabled }" />
          </el-select>
          
          <!-- 自定义快捷键显示（选择自定义时总是显示） -->
          <div v-if="config.hotkey === 'custom'" class="custom-hotkey-display">
            <span class="hotkey-text" v-if="config.customHotkey">
              {{ getCustomMouseHotkeyDisplayName() }}
            </span>
            <span class="hotkey-text placeholder-text" v-else>
              {{ t('main.clickSetCustomHotkey') }}
            </span>
            <el-button size="small" type="text" @click="openCustomMouseHotkeyDialog" class="edit-button">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 全文翻译快捷键选择 -->
    <el-row v-if="config.on" class="settings-control-row" :class="{ 'custom-hotkey-row': config.floatingBallHotkey === 'custom' }">
      <el-col :span="14" class="settings-control-label lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.fullPageHotkeyTip')" placement="top-start" :show-after="500">
        <span class="popup-text popup-vertical-left">
          {{ t('main.fullPageHotkey') }}
          <el-icon class="icon-margin">
            <InfoFilled />
          </el-icon>
        </span>
        </el-tooltip>
      </el-col>
      <el-col :span="10" class="settings-control-field flex-end">
        <div class="hotkey-config">
          <el-select 
            v-model="config.floatingBallHotkey" 
            :aria-label="t('main.fullPageHotkey')"
            :placeholder="t('main.selectHotkey')"
            size="small" 
            style="width: 100%"
            @change="handleHotkeyChange"
          >
            <el-option v-for="item in localizedOptions.floatingBallHotkeys" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          
          <!-- 自定义快捷键显示（选择自定义时总是显示） -->
          <div v-if="config.floatingBallHotkey === 'custom'" class="custom-hotkey-display">
            <span class="hotkey-text" v-if="config.customFloatingBallHotkey">
              {{ getCustomHotkeyDisplayName() }}
            </span>
            <span class="hotkey-text placeholder-text" v-else>
              {{ t('main.clickSetCustomHotkey') }}
            </span>
            <el-button size="small" type="text" @click="openCustomHotkeyDialog" class="edit-button">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 右键全文翻译开关 -->
    <el-row v-if="config.on" class="settings-control-row">
      <el-col :span="20" class="settings-control-label lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.contextMenuTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">
            {{ t('main.contextMenuTranslate') }}
            <el-icon class="icon-margin">
              <InfoFilled />
            </el-icon>
          </span>
        </el-tooltip>
      </el-col>
      <el-col :span="4" class="settings-control-field flex-end">
        <el-switch v-model="config.contextMenuEnabled" class="settings-toggle" :aria-label="t('main.contextMenuTranslate')" />
      </el-col>
    </el-row>


    <!-- 划词翻译模式选择 -->
    <el-row v-if="config.on" class="settings-control-row">
      <el-col :span="14" class="settings-control-label lightblue rounded-corner">
        <el-tooltip class="box-item" effect="dark" :content="t('main.selectionTranslatorTip')" placement="top-start" :show-after="500">
      <span class="popup-text popup-vertical-left">
        {{ t('main.selectionTranslator') }}
        <el-icon class="icon-margin">
          <InfoFilled />
        </el-icon>
      </span>
        </el-tooltip>
      </el-col>
      <el-col :span="10" class="settings-control-field flex-end">
        <el-select v-model="config.selectionTranslatorMode" :aria-label="t('main.selectionTranslatorMode')" :placeholder="t('main.selectMode')" size="small" style="width: 100%">
          <el-option :label="t('main.off')" value="disabled" />
          <el-option :label="t('main.bilingualDisplay')" value="bilingual" />
          <el-option :label="t('main.translationOnly')" value="translation-only" />
        </el-select>
      </el-col>
    </el-row>
    <el-row v-if="config.on && config.selectionTranslatorMode !== 'disabled'" class="settings-control-row">
      <el-col :span="14" class="settings-control-label lightblue rounded-corner">
        <span class="popup-text popup-vertical-left">{{ t('main.selectionTrigger') }}</span>
      </el-col>
      <el-col :span="10" class="settings-control-field flex-end">
        <el-select v-model="config.selectionTranslatorTrigger" :aria-label="t('main.selectionTrigger')" :placeholder="t('main.selectTrigger')" size="small" style="width: 100%">
          <el-option :label="t('main.directPopup')" value="direct" />
          <el-option :label="t('main.showIcon')" value="icon" />
          <el-option :label="t('main.showDot')" value="dot" />
        </el-select>
      </el-col>
    </el-row>
    </section>

    <!-- token -->
    <!-- 高级选项-->
    <section v-show="props.activeSection === 'settings-advanced'" id="settings-advanced" class="settings-section">

        <!-- 主题设置 -->
        <el-row class="settings-control-row">
          <el-col :span="12" class="settings-control-label lightblue rounded-corner">
            <span class="popup-text popup-vertical-left">{{ t('main.themeSettings') }}</span>
          </el-col>
          <el-col :span="12" class="settings-control-field">
            <el-select v-model="config.theme" :placeholder="t('main.selectThemeMode')">
              <el-option class="select-left" v-for="item in localizedOptions.theme" :key="item.value" :label="item.label"
                         :value="item.value" />
            </el-select>
          </el-col>
        </el-row>

        <!-- 缓存开关 -->
        <el-row class="settings-control-row">
          <el-col :span="20" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark" :content="t('main.cacheTip')" placement="top-start" :show-after="500">
        <span class="popup-text popup-vertical-left">{{ t('main.cacheTranslations') }}<el-icon class="icon-margin">
            <InfoFilled />
          </el-icon></span>
            </el-tooltip>
          </el-col>

          <el-col :span="4" class="settings-control-field flex-end">
            <el-switch v-model="config.useCache" class="settings-toggle" :aria-label="t('main.cacheTranslations')" />
          </el-col>
        </el-row>

        <!-- AI 智能上下文 -->
        <el-row class="settings-control-row">
          <el-col :span="20" class="settings-control-label ai-context-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark"
                        :content="t('main.aiContextTip')"
                        placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.aiContext') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
            <small class="settings-control-hint">{{ t('main.aiContextHint') }}</small>
          </el-col>

          <el-col :span="4" class="settings-control-field flex-end">
            <el-switch v-model="config.enableAIContext" :disabled="!canUseAIContext" class="settings-toggle" :aria-label="t('main.aiContext')" />
          </el-col>
        </el-row>

        <el-row class="settings-control-row">
          <el-col :span="20" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark"
                        :content="t('main.deeplxExperimentalTip')"
                        placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.deeplxExperimentalService') }}<el-icon class="icon-margin"><InfoFilled /></el-icon></span>
            </el-tooltip>
            <small class="settings-control-hint">{{ t('main.deeplxExperimentalHint') }}</small>
          </el-col>
          <el-col :span="4" class="settings-control-field flex-end">
            <el-switch v-model="config.enableDeepLXExperimental" class="settings-toggle" :aria-label="t('main.enableDeeplxExperimental')" />
          </el-col>
        </el-row>

        <!-- 悬浮球开关 -->
      <el-row v-if="config.on" class="settings-control-row">
        <el-col :span="20" class="settings-control-label lightblue rounded-corner">
          <el-tooltip class="box-item" effect="dark" :content="t('main.floatingBallTip')" placement="top-start" :show-after="500">
          <span class="popup-text popup-vertical-left">
            {{ t('main.floatingBall') }}
            <el-icon class="icon-margin">
              <InfoFilled />
            </el-icon>
          </span>
          </el-tooltip>
        </el-col>

        <el-col :span="4" class="settings-control-field flex-end">
          <el-switch v-model="floatingBallEnabled" class="settings-toggle" :aria-label="t('main.floatingBall')" />
        </el-col>
      </el-row>


        <!-- 禁用动画设置 -->
        <el-row class="settings-control-row">
          <el-col :span="20" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark"
                        :content="t('main.animationsTip')"
                        placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.animations') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="4" class="settings-control-field flex-end">
            <el-switch v-model="config.animations" class="settings-toggle" :aria-label="t('main.animations')" />
          </el-col>
        </el-row>

        <!-- 输入框翻译功能 -->
        <el-row class="settings-control-row">
          <el-col :span="12" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark"
                        :content="t('main.inputBoxTranslationTip')"
                        placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.inputBoxTranslation') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="12" class="settings-control-field">
            <el-select v-model="config.inputBoxTranslationTrigger" :placeholder="t('main.selectTrigger')">
              <el-option class="select-left" v-for="item in localizedOptions.inputBoxTranslationTrigger" :key="item.value"
                         :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
        </el-row>

        <!-- 输入框翻译目标语言 -->
        <el-row v-if="config.inputBoxTranslationTrigger !== 'disabled'" class="settings-control-row">
          <el-col :span="12" class="settings-control-label lightblue rounded-corner">
            <span class="popup-text popup-vertical-left">{{ t('main.translationTargetLanguage') }}</span>
          </el-col>
          <el-col :span="12" class="settings-control-field">
            <el-select v-model="config.inputBoxTranslationTarget" :placeholder="t('main.selectTargetLanguage')">
              <el-option class="select-left" v-for="item in options.inputBoxTranslationTarget" :key="item.value" 
                         :label="item.label" :value="item.value" />
            </el-select>
          </el-col>
        </el-row>

        <!-- 翻译并发数 -->
        <el-row class="settings-control-row">
          <el-col :span="12" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark" :content="t('main.concurrentTip')" placement="top-start"
                        :show-after="500">
          <span class="popup-text popup-vertical-left">{{ t('main.concurrentTranslations') }}<el-icon class="icon-margin">
              <InfoFilled />
            </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="12" class="settings-control-field">
            <el-input-number
                v-model="config.maxConcurrentTranslations"
                :min="1"
                :max="100"
                :step="1"
                style="width: 100%"
                @change="handleConcurrentChange"
                controls-position="right"
            />
          </el-col>
        </el-row>

        <!-- 使用代理转发 -->
        <el-row v-show="compute.showProxy" class="settings-control-row">
          <el-col :span="8" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark" :content="t('main.proxyTip')" placement="top-start"
                        :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.proxyAddress') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="16" class="settings-control-field">
            <el-input v-model="config.proxy[config.service]" :placeholder="t('main.noProxyByDefault')" @change="ensureTextProviderPermission(config.service)" />
          </el-col>
        </el-row>

        <!-- 角色和模板 -->
        <el-row v-show="compute.showAI" class="settings-control-row">
          <el-col :span="8" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark" :content="t('main.systemRoleTip')"
              placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.systemRole') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="16" class="settings-control-field">
            <el-input type="textarea" v-model="config.system_role[config.service]" maxlength="8192"
              :placeholder="t('main.systemRolePlaceholder')" />
          </el-col>
        </el-row>
        <el-row v-show="compute.showAI" class="settings-control-row">
          <el-col :span="8" class="settings-control-label lightblue rounded-corner">
            <el-tooltip class="box-item" effect="dark"
              :content="t('main.userRoleTip')"
              placement="top-start" :show-after="500">
              <span class="popup-text popup-vertical-left">{{ t('main.userRole') }}<el-icon class="icon-margin">
                  <InfoFilled />
                </el-icon></span>
            </el-tooltip>
          </el-col>
          <el-col :span="16" class="settings-control-field">
            <el-input type="textarea" v-model="config.user_role[config.service]" maxlength="8192"
              :placeholder="t('main.userRolePlaceholder')" />
          </el-col>
        </el-row>
        <!-- 恢夏默认模板按钮 -->
        <el-row v-show="compute.showAI" class="margin-bottom margin-left-2em">
          <el-col :span="24" style="text-align: right;">
            <el-button type="primary" link @click="resetTemplate">
              <el-icon>
                <Refresh />
              </el-icon>
              {{ t('main.restoreDefaultTemplate') }}
            </el-button>
          </el-col>
        </el-row>

    </section>

    <section v-show="props.activeSection === 'settings-data'" id="settings-data" class="settings-section data-section">
        <!-- 配置导入导出 -->
        <el-row class="margin-bottom margin-left-2em">
          <el-col :span="24">
            <el-divider content-position="center">{{ t('main.configManagement') }}</el-divider>
          </el-col>
        </el-row>

        <section class="config-history-panel" :aria-label="t('main.recentConfigs')">
          <div class="config-history-heading">
            <div>
              <span class="config-history-kicker">{{ t('main.configVersion') }}</span>
              <h3>{{ t('main.recentFiveConfigs') }}</h3>
              <p>{{ t('main.configHistoryDescription') }}</p>
            </div>
            <div class="config-history-actions">
              <el-button
                size="small"
                :disabled="historyBusy || !canUndo"
                :aria-label="t('main.undoConfigRestore')"
                @click="runHistoryAction('undo')"
              >{{ t('main.undo') }}</el-button>
              <el-button
                size="small"
                :disabled="historyBusy || !canRedo"
                :aria-label="t('main.redoConfigRestore')"
                @click="runHistoryAction('redo')"
              >{{ t('main.redo') }}</el-button>
            </div>
          </div>

          <div v-if="historyEntries.length" class="config-history-list">
            <article
              v-for="entry in historyEntries"
              :key="entry.version"
              class="config-history-entry"
              :class="{ current: entry.version === currentHistoryVersion }"
            >
              <div class="config-history-version"><b>v{{ entry.version }}</b><span v-if="entry.version === currentHistoryVersion">{{ t('main.current') }}</span></div>
              <div class="config-history-detail">
                <strong>{{ historySummary(entry) }}</strong>
                <small>{{ formatHistoryTime(entry.savedAt) }}</small>
              </div>
              <el-button
                size="small"
                text
                type="primary"
                :disabled="historyBusy || entry.version === currentHistoryVersion"
                :aria-label="`${t('main.restoreConfigVersion')} v${entry.version}`"
                @click="runHistoryAction('restore', entry.version)"
              >{{ t('main.restore') }}</el-button>
            </article>
          </div>
          <div v-else class="config-history-empty">{{ t('main.noRestorableConfigs') }}</div>
        </section>

        <el-row class="margin-bottom margin-left-2em">
          <el-col :span="12">
            <el-button type="primary" @click="handleExport">
              <el-icon>
                <Download />
              </el-icon>
              {{ t('main.exportConfig') }}
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="success" @click="handleImport">
              <el-icon>
                <Upload />
              </el-icon>
              {{ t('main.importConfig') }}
            </el-button>
          </el-col>
        </el-row>

        <!-- 导出配置 -->
        <el-row v-if="showExportBox" class="margin-bottom margin-left-2em">
          <el-col :span="24">
            <el-input v-model="exportData" type="textarea" :rows="8" readonly />
          </el-col>
        </el-row>

        <!-- 导入配置 -->
        <el-row v-if="showImportBox" class="margin-bottom margin-left-2em">
          <el-col :span="24">
            <el-input v-model="importData" type="textarea" :rows="8" :placeholder="t('main.pasteJsonConfig')" />
            <div style="margin-top: 10px; text-align: right;">
              <el-button @click="saveImport">{{ t('main.save') }}</el-button>
            </div>
          </el-col>
        </el-row>
    </section>
    <!--    -->
  </div>

  <!-- 自定义快捷键对话框 -->
  <CustomHotkeyInput
    v-model="showCustomHotkeyDialog"
    :current-value="config.customFloatingBallHotkey"
    @confirm="handleCustomHotkeyConfirm"
    @cancel="handleCustomHotkeyCancel"
  />

  <!-- 自定义鼠标悬浮快捷键对话框 -->
  <CustomHotkeyInput
    v-model="showCustomMouseHotkeyDialog"
    :current-value="config.customHotkey"
    @confirm="handleCustomMouseHotkeyConfirm"
    @cancel="handleCustomMouseHotkeyCancel"
  />



</template>

<script lang="ts" setup>

// Main 处理配置信息
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {useI18n} from 'vue-i18n';
import { customModelString, getLocalizedOptions, models, options, resolveConfiguredModel, services, servicesType, defaultOption } from "../entrypoints/utils/option";
import { Config, normalizeConfig, VIDEO_SUBTITLE_FONT_SIZE_OPTIONS } from "@/entrypoints/utils/model";
import { InfoFilled, Refresh, Edit, Upload, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import browser from 'webextension-polyfill';
import { defineAsyncComponent } from 'vue';
const CustomHotkeyInput = defineAsyncComponent(() => import('@/components/CustomHotkeyInput.vue'));
import ServiceCatalog from '@/components/ServiceCatalog.vue';
import ServiceConfiguration from '@/components/ServiceConfiguration.vue';
import { parseHotkey } from '@/entrypoints/utils/hotkey';
import { isConfigImportValid, sanitizeConfigForExport } from '@/entrypoints/utils/config-transfer';
import { getApiKeyRequirementKey, getMissingCredentialMessage, isApiKeyRequired } from '@/entrypoints/utils/configValidation';
import {
  IMAGE_OCR_LANGUAGE_PACKS,
  IMAGE_OCR_LANGUAGE_STATE_KEY,
  IMAGE_OCR_RECOMMENDED_LANGUAGES,
  getLocalizedImageOcrLanguagePacks,
  normalizeImageOcrLanguageCodes,
  type ImageOcrLanguageCode,
} from '@/entrypoints/utils/imageOcrLanguages';
import {OCR_LANGUAGE_ASSET_BASE_URL} from '@/entrypoints/utils/ocrLanguageAssets';
import {requestProviderHostPermission, requestUrlHostPermission} from '@/entrypoints/utils/providerPermissions';
import {
  config as runtimeConfig,
  configHistoryReady,
  configReady,
  getConfigHistorySnapshot,
  requestConfigHistoryAction,
  saveConfig,
  requestConfigSave,
  subscribeConfigHistory,
  subscribeConfig,
  type ConfigHistoryAction,
  type ConfigHistoryEntry,
  type ConfigHistoryState,
} from '@/entrypoints/utils/config';
import {getTranslationTargetOptionsForProvider} from '@/entrypoints/utils/languageRegistry';

const props = withDefaults(defineProps<{
  activeSection?: string
}>(), {
  activeSection: 'settings-general',
})
const {t} = useI18n({useScope: 'global'});

// 初始化深色模式媒体查询
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// 更新主题函数
function updateTheme(theme: string) {
  if (theme === 'auto') {
    // 自动模式下，直接使用系统主题
    document.documentElement.classList.toggle('dark', darkModeMediaQuery.matches);
  } else {
    // 手动模式下，使用选择的主题
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

// 配置信息
const config = ref(new Config());
const translationTargetOptions = computed(() => getTranslationTargetOptionsForProvider(config.value.service));
const localizedOptions = computed(() => getLocalizedOptions(t));
const persistConfig = (value: unknown) => requestConfigSave(value, browser.runtime.sendMessage.bind(browser.runtime));
let lastSerialized = '';
const imageOcrLanguagePacks = computed(() => getLocalizedImageOcrLanguagePacks(t));
const imageOcrRecommendedCodes = IMAGE_OCR_RECOMMENDED_LANGUAGES;
const imageOcrDownloadedCodes = ref<ImageOcrLanguageCode[]>([]);
const imageOcrDownloadingCodes = ref<ImageOcrLanguageCode[]>([]);
const imageOcrDownloadError = ref('');
const imageOcrClearing = ref(false);

const imageOcrRecommendedReady = computed(() =>
  imageOcrRecommendedCodes.every(code => imageOcrDownloadedCodes.value.includes(code)),
);
const imageOcrRecommendedDownloading = computed(() =>
  imageOcrRecommendedCodes.some(code => imageOcrDownloadingCodes.value.includes(code)),
);

async function refreshImageOcrLanguageState() {
  const stored = await browser.storage.local.get(IMAGE_OCR_LANGUAGE_STATE_KEY);
  imageOcrDownloadedCodes.value = normalizeImageOcrLanguageCodes(stored[IMAGE_OCR_LANGUAGE_STATE_KEY]);
}

async function downloadImageOcrLanguages(languages: ImageOcrLanguageCode[]) {
  const pending = languages.filter(code => !imageOcrDownloadedCodes.value.includes(code));
  if (pending.length === 0) return;

  imageOcrDownloadError.value = '';
  imageOcrDownloadingCodes.value = [...new Set([...imageOcrDownloadingCodes.value, ...pending])];
  try {
    if (!await requestUrlHostPermission(OCR_LANGUAGE_ASSET_BASE_URL)) {
      throw new Error(t('main.ocrPermissionDenied'));
    }
    const response = await browser.runtime.sendMessage({
      type: 'fluentReadImageOcrDownload',
      languages: pending,
    }) as { success?: boolean; languages?: unknown; error?: string } | undefined;
    if (!response?.success) throw new Error(response?.error || t('main.languagePackDownloadFailed'));
    imageOcrDownloadedCodes.value = normalizeImageOcrLanguageCodes(response.languages);
  } catch (error) {
    imageOcrDownloadError.value = error instanceof Error
      ? `${error.message}${t('main.checkNetworkRetrySuffix')}`
      : t('main.languagePackDownloadFailedRetry');
  } finally {
    imageOcrDownloadingCodes.value = imageOcrDownloadingCodes.value.filter(code => !pending.includes(code));
  }
}

function ocrPackIcon(code: ImageOcrLanguageCode): string {
  return ({chi_sim: '中', chi_tra: '繁', eng: 'A', jpn: '日', kor: '한'} as Record<ImageOcrLanguageCode, string>)[code];
}

async function clearImageOcrLanguages() {
  try {
    await ElMessageBox.confirm(
      t('main.clearOcrModelsMessage'),
      t('main.clearOcrModelsTitle'),
      {confirmButtonText: t('main.clear'), cancelButtonText: t('main.cancel'), type: 'warning'},
    );
  } catch {
    return;
  }

  imageOcrClearing.value = true;
  imageOcrDownloadError.value = '';
  try {
    const response = await browser.runtime.sendMessage({type: 'mercuryImageOcrClear'}) as {
      success?: boolean;
      error?: string;
    } | undefined;
    if (!response?.success) throw new Error(response?.error || t('main.ocrModelClearFailed'));
    imageOcrDownloadedCodes.value = [];
    imageOcrDownloadingCodes.value = [];
    ElMessage.success(t('main.ocrModelsCleared'));
  } catch (error) {
    imageOcrDownloadError.value = error instanceof Error ? error.message : t('main.ocrModelClearFailed');
  } finally {
    imageOcrClearing.value = false;
  }
}

async function ensureVideoProviderPermission(service: string) {
  try {
    if (await requestProviderHostPermission(service, config.value)) return;
    config.value.videoService = services.chromeTranslator;
    ElMessage.error(t('main.subtitleProviderPermissionDenied'));
  } catch (error) {
    config.value.videoService = services.chromeTranslator;
    ElMessage.error(error instanceof Error ? error.message : t('main.subtitleProviderPermissionFailed'));
  }
}

async function ensureTextProviderPermission(service: string) {
  try {
    if (await requestProviderHostPermission(service, config.value)) return;
    config.value.service = services.chromeTranslator;
    ElMessage.error(t('main.textProviderPermissionDenied'));
  } catch (error) {
    config.value.service = services.chromeTranslator;
    ElMessage.error(error instanceof Error ? error.message : t('main.textProviderPermissionFailed'));
  }
}

let hydrated = false;
let applyingExternalConfig = false;
let pageExitSaveStarted = false;
const unsubscribeConfig = subscribeConfig((nextConfig) => {
  const serialized = JSON.stringify(nextConfig);
  if (serialized === lastSerialized) return;
  lastSerialized = serialized;
  applyingExternalConfig = true;
  try {
    Object.assign(config.value, nextConfig);
  } finally {
    applyingExternalConfig = false;
  }
});

void configReady
  .then(() => {
    Object.assign(config.value, runtimeConfig);
    lastSerialized = JSON.stringify(config.value);
    hydrated = true;
    updateTheme(config.value.theme || 'auto');
  })
  .catch((error) => console.warn('[Mercury Translate] 无法读取本地配置', error));

watch(config, (newValue) => {
  if (!hydrated || applyingExternalConfig) return;
  const serialized = JSON.stringify(newValue);
  if (serialized === lastSerialized) return;
  lastSerialized = serialized;
  void persistConfig(newValue).catch((error) => console.warn('[Mercury Translate] 保存设置失败', error));
}, { deep: true, flush: 'sync' });

// 设置页关闭前提交最新快照，避免 Firefox 销毁页面时丢失最后一次修改。
// pagehide 和 unmounted 可能连续触发，只提交一次，避免重复写入和重复历史。
function persistOnPageExit() {
  if (!hydrated || pageExitSaveStarted) return;
  pageExitSaveStarted = true;
  void saveConfig(config.value).catch((error) => console.warn('[Mercury Translate] 设置页关闭前本地保存失败', error));
  void persistConfig(config.value).catch((error) => console.warn('[Mercury Translate] 设置页关闭前后台保存失败', error));
}

onUnmounted(() => {
  persistOnPageExit();
  window.removeEventListener('pagehide', saveOnPageHide);
});

function saveOnPageHide() {
  persistOnPageExit();
}
window.addEventListener('pagehide', saveOnPageHide);

onMounted(() => {
  void refreshImageOcrLanguageState().catch(() => undefined);
});

// 设置页左侧列表只切换正在编辑的服务，不改变网页翻译实际使用的默认服务。
const configurationService = ref<string | null>(null);
const selectedConfigurationService = computed(
  () => configurationService.value ?? config.value.service,
);

const setConfigurationService = (value: string) => {
  configurationService.value = value;
};

type ServiceSource = { value: string };

const actualService = computed(() => config.value.service);
const aiContextModel = computed(() => resolveConfiguredModel(
  config.value.model[config.value.service],
  config.value.customModel[config.value.service],
));
const canUseAIContext = computed(() => servicesType.isUseAIContext(config.value.service, aiContextModel.value));
const visibleServiceOptions = computed(() => localizedOptions.value.services.filter((item: any) =>
  item.value !== services.deeplx || config.value.enableDeepLXExperimental,
));
const videoServiceOptions = computed(() => visibleServiceOptions.value.filter((item: any) => !item.disabled));
const videoSubtitleFontSizeOptions = VIDEO_SUBTITLE_FONT_SIZE_OPTIONS;
const filteredServices = computed(() =>
  visibleServiceOptions.value.filter((item: any) =>
    !([item.google].includes(item.value) && config.value.display !== 1),
  ),
);

// 两个页面都需要相同的服务能力判断，但数据源不同：实际翻译使用默认服务，
// 设置页右侧表单使用正在配置的服务。统一从这里生成，避免两套逻辑继续漂移。
const createServiceCompute = (serviceSource: ServiceSource) => ({
  showAI: computed(() => servicesType.isAI(serviceSource.value)),
  showMachine: computed(() => servicesType.isMachine(serviceSource.value)),
  showProxy: computed(() => servicesType.isUseProxy(serviceSource.value)),
  showModel: computed(() => servicesType.isUseModel(serviceSource.value)),
  showCustomBody: computed(() => servicesType.isUseCustomBody(serviceSource.value)),
  showToken: computed(() => servicesType.isUseToken(serviceSource.value)),
  requireApiKey: computed({
    get: () => isApiKeyRequired(serviceSource.value, config.value),
    set: (value: boolean) => {
      config.value.requireApiKey[getApiKeyRequirementKey(serviceSource.value, config.value)] = value;
    },
  }),
  credentialWarning: computed(() => getMissingCredentialMessage(serviceSource.value, config.value)),
  showAkSk: computed(() => servicesType.isUseAkSk(serviceSource.value)),
  showYoudao: computed(() => servicesType.isYoudao(serviceSource.value)),
  showTencent: computed(() => servicesType.isTencent(serviceSource.value)),
  model: computed(() => models.get(serviceSource.value) || []),
  showCustom: computed(() => servicesType.isCustom(serviceSource.value)),
  showDeepLX: computed(() => serviceSource.value === 'deeplx'),
  showMiniMaxRegion: computed(() => serviceSource.value === services.minimax),
  showCustomModel: computed(
    () =>
      servicesType.isAI(serviceSource.value) &&
      config.value.model[serviceSource.value] === customModelString,
  ),
  filteredServices,
  showRobotId: computed(() => servicesType.isCoze(serviceSource.value)),
  showNewAPI: computed(() => servicesType.isNewApi(serviceSource.value)),
  showAzureOpenaiEndpoint: computed(() => servicesType.isAzureOpenai(serviceSource.value)),
  showDeepseekApiType: computed(() => serviceSource.value === 'deepseek'),
  showDeepseekThinkingMode: computed(
    () => serviceSource.value === 'deepseek' && config.value.deepseekApiType !== 'responses',
  ),
});

const compute = ref(createServiceCompute(actualService));
// config.service 仍表示实际默认翻译服务；这里仅用于设置页正在编辑的服务。
const configurationCompute = ref(createServiceCompute(selectedConfigurationService));

// 监听主题变化
watch(() => config.value.theme, (newTheme) => {
  updateTheme(newTheme || 'auto');
});

watch(() => config.value.enableDeepLXExperimental, (enabled) => {
  if (enabled) return;
  if (config.value.service === services.deeplx) config.value.service = services.chromeTranslator;
  if (config.value.videoService === services.deeplx) config.value.videoService = services.chromeTranslator;
});

// 使用 onchange 监听系统主题变化
darkModeMediaQuery.onchange = () => {
  if (config.value.theme === 'auto') {
    updateTheme('auto');
  }
};

// 组件卸载时清理
onUnmounted(() => {
  darkModeMediaQuery.onchange = null;
  unsubscribeConfig();
  unsubscribeHistory();
});

// 计算样式分组
const styleGroups = computed(() => {
  const groups = localizedOptions.value.styles.filter(item => item.disabled);
  return groups.map(group => ({
    ...group,
    options: localizedOptions.value.styles.filter(item => !item.disabled && item.group === group.value)
  }));
});

const currentStyleClass = computed(() =>
  localizedOptions.value.styles.find(item => item.value === config.value.style && !item.disabled)?.class || 'fluent-display-default'
);

// 恢复默认模板
const resetTemplate = () => {
  ElMessageBox.confirm(
    t('main.restoreTemplateConfirmMessage'),
    t('main.restoreDefaultTemplate'),
    {
      confirmButtonText: t('main.confirm'),
      cancelButtonText: t('main.cancel'),
      type: 'warning',
    }
  ).then(() => {
    config.value.system_role[config.value.service] = defaultOption.system_role;
    config.value.user_role[config.value.service] = defaultOption.user_role;
    ElMessage({
      message: t('main.restoreTemplateSuccess'),
      type: 'success',
      duration: 2000
    });
  }).catch(() => {
    // 用户取消操作，不做任何处理
  });
};

// 悬浮球开关的计算属性
const floatingBallEnabled = computed({
  get: () => !config.value.disableFloatingBall && config.value.on,
  set: (value) => {
    config.value.disableFloatingBall = !value;
    // 向所有激活的标签页发送消息
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, { 
            type: 'toggleFloatingBall',
            isEnabled: value 
          }).catch(() => {
            // 忽略发送失败的错误（可能是页面未加载内容脚本）
          });
        }
      });
    });
  }
});

// 监听划词翻译模式变化
watch(() => config.value.selectionTranslatorMode, (newMode) => {
  config.value.disableSelectionTranslator = newMode === 'disabled';
  // 向所有激活的标签页发送消息
  browser.tabs.query({}).then(tabs => {
    tabs.forEach(tab => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, { 
          type: 'updateSelectionTranslatorMode',
          mode: newMode 
        }).catch(() => {
          // 忽略发送失败的错误（可能是页面未加载内容脚本）
        });
      }
    });
  });
});

// 处理插件状态变化
const handlePluginStateChange = (val: boolean) => {
  // 总开关只控制当前运行状态，不覆盖用户对悬浮球和划词翻译的偏好。
  browser.tabs.query({}).then(tabs => {
    tabs.forEach(tab => {
      if (!tab.id) return;
      browser.tabs.sendMessage(tab.id, {
        type: 'toggleFloatingBall',
        isEnabled: val && !config.value.disableFloatingBall,
      }).catch(() => {
        // 忽略发送失败的错误（可能是页面未加载内容脚本）
      });
      browser.tabs.sendMessage(tab.id, {
        type: 'updateSelectionTranslatorMode',
        mode: val ? config.value.selectionTranslatorMode : 'disabled',
      }).catch(() => {
        // 忽略发送失败的错误（可能是页面未加载内容脚本）
      });
      browser.tabs.sendMessage(tab.id, {
        type: 'toggleSelectionAreaTranslator',
        isEnabled: val && config.value.selectionAreaEnabled,
      }).catch(() => {
        // 忽略发送失败的错误（可能是页面未加载内容脚本）
      });
    });
  });
};

// 自定义快捷键相关
const showCustomHotkeyDialog = ref(false);
const showCustomMouseHotkeyDialog = ref(false);

// 处理快捷键选择变化
const handleHotkeyChange = (value: string) => {
  if (value === 'custom') {
    // 选择自定义后，如果没有设置过自定义快捷键，自动打开设置对话框
    if (!config.value.customFloatingBallHotkey) {
      // 延迟一下，让选择框先完成状态更新
      setTimeout(() => {
        openCustomHotkeyDialog();
      }, 100);
    }
  }
};

// 打开自定义快捷键对话框
const openCustomHotkeyDialog = () => {
  showCustomHotkeyDialog.value = true;
};

// 确认自定义快捷键
const handleCustomHotkeyConfirm = (hotkey: string) => {
  config.value.customFloatingBallHotkey = hotkey;
  config.value.floatingBallHotkey = 'custom';
  
  ElMessage({
    message: hotkey === 'none' ? t('main.hotkeyDisabled') : `${t('main.hotkeySetPrefix')} ${getCustomHotkeyDisplayName()}`,
    type: 'success',
    duration: 2000
  });
};

// 取消自定义快捷键
const handleCustomHotkeyCancel = () => {
  // 如果没有自定义快捷键，回退到默认选项
  if (!config.value.customFloatingBallHotkey) {
    config.value.floatingBallHotkey = 'Alt+T';
  }
};

// 获取自定义快捷键显示名称
const getCustomHotkeyDisplayName = () => {
  if (!config.value.customFloatingBallHotkey) return '';
  
  if (config.value.customFloatingBallHotkey === 'none') {
    return t('main.disabled');
  }
  
  const parsed = parseHotkey(config.value.customFloatingBallHotkey);
  return parsed.isValid ? parsed.displayName : config.value.customFloatingBallHotkey;
};

// 处理鼠标悬浮快捷键选择变化
const handleMouseHotkeyChange = (value: string) => {
  if (value === 'custom') {
    // 选择自定义后，如果没有设置过自定义快捷键，自动打开设置对话框
    if (!config.value.customHotkey) {
      // 延迟一下，让选择框先完成状态更新
      setTimeout(() => {
        openCustomMouseHotkeyDialog();
      }, 100);
    }
  }
};

// 打开自定义鼠标悬浮快捷键对话框
const openCustomMouseHotkeyDialog = () => {
  showCustomMouseHotkeyDialog.value = true;
};

// 确认自定义鼠标悬浮快捷键
const handleCustomMouseHotkeyConfirm = (hotkey: string) => {
  config.value.customHotkey = hotkey;
  config.value.hotkey = 'custom';
  
  ElMessage({
    message: hotkey === 'none' ? t('main.hotkeyDisabled') : `${t('main.hotkeySetPrefix')} ${getCustomMouseHotkeyDisplayName()}`,
    type: 'success',
    duration: 2000
  });
};

// 取消自定义鼠标悬浮快捷键
const handleCustomMouseHotkeyCancel = () => {
  // 如果没有自定义快捷键，回退到默认选项
  if (!config.value.customHotkey) {
    config.value.hotkey = 'Control';
  }
};

// 获取自定义鼠标悬浮快捷键显示名称
const getCustomMouseHotkeyDisplayName = () => {
  if (!config.value.customHotkey) return '';
  
  if (config.value.customHotkey === 'none') {
    return t('main.disabled');
  }
  
  const parsed = parseHotkey(config.value.customHotkey);
  return parsed.isValid ? parsed.displayName : config.value.customHotkey;
};

// 处理并发数量变化
const handleConcurrentChange = (currentValue: number | undefined) => {
  // 验证并发数量的有效性
  if (currentValue === undefined || currentValue < 1 || currentValue > 100) {
    ElMessage({
      message: t('main.concurrentRangeError'),
      type: 'warning',
      duration: 2000
    });
    // 恢复默认值
    config.value.maxConcurrentTranslations = 6;
    return;
  }
  
  ElMessage({
    message: `${t('main.concurrentUpdatedPrefix')} ${currentValue}`,
    type: 'success',
    duration: 2000
  });
};

const showExportBox = ref(false);
const exportData = ref('');
const showImportBox = ref(false);
const importData = ref('');
const configHistory = ref<ConfigHistoryState>(getConfigHistorySnapshot());
const historyBusy = ref(false);
const historyEntries = computed(() => [...configHistory.value.entries].reverse());
const currentHistoryVersion = computed(() => configHistory.value.entries[configHistory.value.cursor]?.version ?? null);
const canUndo = computed(() => configHistory.value.cursor > 0);
const canRedo = computed(() => configHistory.value.cursor >= 0 && configHistory.value.cursor < configHistory.value.entries.length - 1);

const formatHistoryTime = (savedAt: string): string => {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return t('main.unknownTime');
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const historySummary = (entry: ConfigHistoryEntry): string => {
  const target = getTranslationTargetOptionsForProvider(entry.config.service)
    .find(item => item.value === entry.config.to)?.label || entry.config.to;
  const service = localizedOptions.value.services.find((item: any) => item.value === entry.config.service)?.label || entry.config.service;
  return `${target} · ${service}`;
};

void configHistoryReady.then(() => {
  configHistory.value = getConfigHistorySnapshot();
});
const unsubscribeHistory = subscribeConfigHistory((nextHistory) => {
  configHistory.value = nextHistory;
});

const runHistoryAction = async (action: ConfigHistoryAction, version?: number) => {
  if (historyBusy.value) return;
  historyBusy.value = true;
  try {
    const nextHistory = await requestConfigHistoryAction(
      action,
      version,
      browser.runtime.sendMessage.bind(browser.runtime),
    );
    configHistory.value = nextHistory;
    ElMessage({
      message: action === 'restore' ? `${t('main.restoredConfigVersion')} v${version}` : action === 'undo' ? t('main.undoConfigRestoreSuccess') : t('main.redoConfigRestoreSuccess'),
      type: 'success',
      duration: 1600,
    });
  } catch (error) {
    ElMessage({
      message: `${t('main.configHistoryFailedPrefix')}${error instanceof Error ? error.message : t('main.tryAgainLater')}`,
      type: 'error',
    });
  } finally {
    historyBusy.value = false;
  }
};

// Azure OpenAI 端点地址验证函数
const isValidAzureEndpoint = (endpoint: string) => {
  if (!endpoint || endpoint.trim() === '') {
    return false;
  }

  // 检查是否包含必要的组件
  const hasAzureDomain = endpoint.includes('openai.azure.com');
  const hasChatCompletions = endpoint.includes('/chat/completions');
  const hasHttps = endpoint.startsWith('https://');

  return hasHttps && hasAzureDomain && hasChatCompletions;
};

const handleExport = async () => {
  try {
    await configReady;
    exportData.value = JSON.stringify(
      sanitizeConfigForExport(runtimeConfig),
      null,
      2,
    );
    showExportBox.value = !showExportBox.value;
    showImportBox.value = false;
  } catch (error) {
    ElMessage({
      message: `${t('main.exportConfigFailedPrefix')}${error instanceof Error ? error.message : t('main.invalidConfigFormat')}`,
      type: 'error',
    });
  }
};

const handleImport = () => {
  showImportBox.value = !showImportBox.value;
  showExportBox.value = false;
};

const saveImport = async () => {
  try {
    const parsedConfig = JSON.parse(importData.value);
    if (!isConfigImportValid(parsedConfig)) {
      ElMessage({
        message: t('main.invalidConfig'),
        type: 'error',
      });
      return;
    }
    await persistConfig(normalizeConfig(parsedConfig));
    ElMessage({
      message: t('main.importConfigSuccess'),
      type: 'success',
    });
    showImportBox.value = false;
    importData.value = '';
    // Optionally, reload the extension or relevant parts
  } catch (e) {
    ElMessage({
      message: t('main.invalidConfigFormatCheck'),
      type: 'error',
    });
  }
};

</script>

<style scoped>

.settings-section {
  min-width: 0;
}

.config-history-panel {
  margin: 0 0 18px;
  padding: 18px;
  border: 1px solid #f0d2dc;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff8fa, #fff);
}
.config-history-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.config-history-kicker { display: block; margin-bottom: 4px; color: var(--brand-strong); font-size: 10px; font-weight: 800; letter-spacing: .1em; }
.config-history-heading h3 { margin: 0 0 5px; color: var(--ink); font-size: 16px; }
.config-history-heading p { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.55; }
.config-history-actions { display: flex; flex: 0 0 auto; gap: 6px; }
.config-history-list { display: grid; gap: 7px; margin-top: 15px; }
.config-history-entry { display: grid; grid-template-columns: 62px minmax(0, 1fr) auto; align-items: center; gap: 10px; min-height: 52px; padding: 8px 10px; border: 1px solid #eceef4; border-radius: 13px; background: rgba(255, 255, 255, .82); }
.config-history-entry.current { border-color: #efb4c4; background: #fff; box-shadow: 0 5px 16px rgba(239, 71, 118, .08); }
.config-history-version { display: flex; align-items: center; gap: 5px; }
.config-history-version b { color: var(--brand-strong); font-size: 12px; }
.config-history-version span { padding: 2px 5px; border-radius: 999px; color: var(--brand-strong); background: var(--brand-soft); font-size: 9px; font-weight: 750; }
.config-history-detail { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.config-history-detail strong { overflow: hidden; color: var(--ink); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.config-history-detail small { color: var(--muted); font-size: 10px; }
.config-history-empty { margin-top: 14px; padding: 15px; border: 1px dashed #e3e6ee; border-radius: 12px; color: var(--muted); font-size: 11px; text-align: center; }
.image-ocr-section {
  display: grid;
  gap: 16px;
}

.image-ocr-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin: 0 12px 4px;
}

.image-ocr-kicker {
  display: block;
  margin-bottom: 7px;
  color: #dc315f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .1em;
}

.image-ocr-heading h2 {
  margin: 0 0 7px;
  color: #172033;
  font-size: 22px;
}

.image-ocr-heading p {
  margin: 0;
  color: #737c8f;
  font-size: 12px;
  line-height: 1.6;
}

.image-ocr-runtime-badge,
.image-ocr-recommended {
  display: inline-flex;
  align-items: center;
  flex: none;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  white-space: nowrap;
}

.image-ocr-runtime-badge {
  padding: 7px 10px;
  border: 1px solid #ccebdd;
  color: #18835d;
  background: #effbf6;
}

.image-ocr-recommendation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 0 12px;
  padding: 18px 20px;
  border: 1px solid #f3cfda;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff6f8, #fff);
}

.image-ocr-recommendation strong { color: #172033; font-size: 14px; }
.image-ocr-recommendation p { margin: 6px 0 0; color: #737c8f; font-size: 11px; line-height: 1.5; }
.image-ocr-primary-action,
.image-ocr-download-button {
  flex: none;
  border: 0;
  border-radius: 10px;
  color: #fff;
  background: #ef4776;
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}
.image-ocr-primary-action { min-height: 38px; padding: 0 14px; }
.image-ocr-primary-action:disabled { cursor: default; opacity: .55; }

.image-ocr-pack-list { display: grid; gap: 10px; margin: 0 12px; }
.image-ocr-pack-card {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 76px;
  padding: 12px 14px;
  border: 1px solid #e5e8ef;
  border-radius: 16px;
  background: #fbfcfe;
}
.image-ocr-pack-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 12px;
  color: #2678c9;
  background: #eaf4ff;
  font-size: 16px;
  font-weight: 800;
}
.image-ocr-pack-card:nth-child(1) .image-ocr-pack-icon { color: #e73a6c; background: #fff0f4; }
.image-ocr-pack-card:nth-child(3) .image-ocr-pack-icon { color: #6f55d9; background: #f1edff; }
.image-ocr-pack-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 5px; }
.image-ocr-pack-title { display: flex; align-items: center; gap: 7px; }
.image-ocr-pack-title strong { color: #172033; font-size: 13px; }
.image-ocr-pack-copy small { overflow: hidden; color: #737c8f; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.image-ocr-recommended { padding: 3px 6px; color: #dc315f; background: #fff0f4; font-size: 8px; }
.image-ocr-pack-action { display: flex; align-items: center; gap: 10px; flex: none; }
.image-ocr-pack-status { color: #9aa2b1; font-size: 10px; }
.image-ocr-pack-status.ready { color: #18835d; }
.image-ocr-download-button { min-width: 58px; min-height: 30px; padding: 0 10px; }
.image-ocr-download-button:disabled { color: #18835d; background: #effbf6; cursor: default; }
.image-ocr-error { margin: 0 12px; color: #d9345e; font-size: 11px; line-height: 1.5; }
.image-ocr-footnote-row { display: flex; align-items: center; gap: 14px; margin: 0 12px; }
.image-ocr-footnote { flex: 1; margin: 0; color: #8b93a4; font-size: 10px; line-height: 1.5; }
.image-ocr-clear-button {
  flex: none;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  color: #687083;
  background: transparent;
  cursor: pointer;
  font-size: 10px;
}
.image-ocr-clear-button:disabled { cursor: default; opacity: .45; }

:root.dark .image-ocr-heading h2,
:root.dark .image-ocr-recommendation strong,
:root.dark .image-ocr-pack-title strong { color: #f4f5f8; }
:root.dark .image-ocr-heading p,
:root.dark .image-ocr-recommendation p,
:root.dark .image-ocr-pack-copy small { color: #a7adba; }
:root.dark .image-ocr-recommendation,
:root.dark .image-ocr-pack-card { border-color: #30333c; background: #252830; }
:root.dark .image-ocr-recommendation { background: linear-gradient(135deg, rgba(239, 71, 118, .12), #252830); }
:root.dark .image-ocr-clear-button { border-color: #40444f; color: #b6bdca; }

.settings-status-row {
  align-items: center;
  min-height: 92px !important;
  padding: 18px 20px !important;
  border: 1px solid #e4e8f0;
  border-radius: 18px;
  background: linear-gradient(135deg, #fff8fa, #fff);
}

.video-settings-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 0 12px 20px;
  padding: 20px;
  border: 1px solid #cceee9;
  border-radius: 18px;
  background: linear-gradient(135deg, #f1fbf9, #fff);
}
.video-settings-hero h2 { margin: 5px 0 6px; color: #172033; font-size: 21px; }
.video-settings-hero p { margin: 0; color: #737c8f; font-size: 11px; }
.video-settings-note { margin: 18px 12px; padding: 16px 18px; border: 1px dashed #cfe7e5; border-radius: 14px; color: #6d788b; background: #f8fcfc; font-size: 11px; line-height: 1.6; }
.video-settings-note strong { color: #087f80; }
.video-settings-note p { margin: 6px 0 0; }

.settings-status-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-status-kicker {
  color: #dc315f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
}

.settings-status-copy strong { color: #172033; font-size: 16px; }
.settings-status-copy small { color: #737c8f; font-size: 11px; }
.ai-context-label { flex-direction: column; align-items: flex-start !important; gap: 4px; }
.ai-context-label small { color: #8b93a4; font-size: 10px; line-height: 1.45; }
.settings-status-control { align-items: center; gap: 13px; }
.settings-status-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border: 1px solid #e1e5ed;
  border-radius: 999px; color: #7b8496; background: #f7f8fb; font-size: 10px; font-weight: 750;
}
.settings-status-badge i { width: 7px; height: 7px; border-radius: 50%; background: #aab2c0; }
.settings-status-badge.active { border-color: #bfead9; color: #18835d; background: #effbf6; }
.settings-status-badge.active i { background: #25aa78; box-shadow: 0 0 0 4px rgba(37, 170, 120, .12); }
.settings-switch { --el-switch-on-color: #ef4776; --el-switch-off-color: #cfd5df; }

.style-preview-card {
  margin: 6px 12px 24px;
  padding: 18px;
  border: 1px solid #e3e7ef;
  border-radius: 18px;
  background: linear-gradient(145deg, #fbfcff, #fff8fa);
}
.style-preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.style-preview-heading div { display: flex; flex-direction: column; gap: 4px; }
.style-preview-heading span { color: #dc315f; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.style-preview-heading strong { color: #172033; font-size: 14px; }
.style-preview-example { margin-top: 14px; padding: 14px 16px; border: 1px solid #e5e8ef; border-radius: 14px; background: #fff; }
.style-preview-source { margin: 0 0 8px; color: #7f889b; font-size: 11px; }
.style-preview-text { margin: 0; color: #172033; font-size: 15px; line-height: 1.7; transition: all 160ms ease; }
.style-preview-note { display: block; margin-top: 10px; color: #8b93a4; font-size: 10px; }
.style-preview-text.fluent-display-default { color: #273247; }
.style-preview-text.fluent-display-bold { font-weight: 800; }
.style-preview-text.fluent-display-italic { font-style: italic; }
.style-preview-text.fluent-display-text-shadow { text-shadow: 1px 2px 3px rgba(23, 32, 51, .22); }
.style-preview-text.fluent-display-solid-underline { text-decoration: underline; text-decoration-color: #4d8eea; text-decoration-thickness: 2px; text-underline-offset: 4px; }
.style-preview-text.fluent-display-dot-underline { text-decoration: underline dotted #4d8eea 2px; text-underline-offset: 4px; }
.style-preview-text.fluent-display-wavy { text-decoration: underline wavy #ef4776 2px; text-underline-offset: 4px; }
.style-preview-text.fluent-display-card-mode { padding: 8px 10px; border-radius: 8px; background: #f4f6fb; }
.style-preview-text.fluent-display-modern-card { padding: 8px 10px; border-radius: 8px; background: linear-gradient(90deg, #fff0f4, #f1f4ff); }
.style-preview-text.fluent-display-paper { padding: 8px 10px; border: 1px solid #eadfca; background: #fffaf0; }
.style-preview-text.fluent-display-learning-mode { padding: 2px 6px; background: #fff1a8; }
.style-preview-text.fluent-display-marker { padding: 2px 6px; background: #d6f5b7; }
.style-preview-text.fluent-display-highlight-fade { padding: 2px 6px; background: linear-gradient(90deg, #fff0b8, transparent); }
.style-preview-text.fluent-display-lightyellow { padding: 4px 8px; background: #fff7db; }
.style-preview-text.fluent-display-lightblue { padding: 4px 8px; background: #eaf4ff; }
.style-preview-text.fluent-display-lightgray { padding: 4px 8px; background: #f1f3f5; }
.style-preview-text.fluent-display-quote { padding-left: 10px; border-left: 3px solid #ef4776; }
.style-preview-text.fluent-display-border { padding: 6px 9px; border: 1px solid #bfc8d8; border-radius: 6px; }
.style-preview-text.fluent-display-focus { padding: 5px 8px; border-radius: 6px; box-shadow: 0 0 0 3px rgba(239, 71, 118, .12); }
.style-preview-text.fluent-display-clean { border-bottom: 2px solid #ef4776; }
.style-preview-text.fluent-display-tech { padding: 5px 8px; border-radius: 5px; color: #245070; background: #edf6fb; font-family: ui-monospace, SFMono-Regular, monospace; }
.style-preview-text.fluent-display-elegant { font-family: Georgia, "Songti SC", serif; letter-spacing: .04em; }
.style-preview-text.fluent-display-dimmed { opacity: .62; }
.style-preview-text.fluent-display-transparent-mode { opacity: .82; }

.disabled-section {
  margin: 18px 12px 8px;
  padding: 28px;
  border: 1px dashed #d8dce6;
  border-radius: 16px;
  color: #677084;
  background: #f8f9fb;
  text-align: center;
}

.disabled-section strong {
  color: #263044;
  font-size: 15px;
}

.disabled-section p {
  margin: 7px 0 0;
  font-size: 11px;
}

.service-connection-section {
  margin-top: 22px;
  padding-top: 22px;
  border-top: 1px solid #e8eaf0;
}

.subsection-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin: 0 12px 16px;
}

.subsection-heading > div {
  display: flex;
  flex-direction: column;
}

.subsection-heading span {
  color: #dc315f;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
}

.subsection-heading strong {
  margin-top: 4px;
  color: #172033;
  font-size: 17px;
}

.subsection-heading p {
  margin: 0;
  color: #7c8495;
  font-size: 10px;
}

.data-section {
  min-height: 260px;
}

.select-left {
  text-align: left;
}

.flex-end {
  display: flex;
  justify-content: flex-end;
}

.select-divider {
  background: #f2f6fc;
  color: #409eff;
  font-size: 12px;
  padding: 4px 12px;
  cursor: default;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid #e4e7ed;
  margin: 4px 0;
  pointer-events: none;
  opacity: 0.9;
}

.icon-margin {
  margin-left: 0.25em;
}

/* 添加自适应样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-input) {
  width: 100%;
}

.margin-bottom {
  margin-bottom: 10px;
}

.margin-left-2em {
  margin-left: 1em;
  margin-right: 1em;
}

/* 设置滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

/* 自定义快捷键相关样式 */
.hotkey-config {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.custom-hotkey-display {
  display: flex;
  align-items: center;
  padding: 6px 6px 6px 10px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
  font-size: 12px;
  height: 32px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.hotkey-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 13px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: calc(100% - 32px);
}

.edit-button {
  padding: 2px 4px;
  margin-left: 4px;
  color: var(--el-color-primary);
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button:hover {
  background: var(--el-color-primary-light-8);
}

.edit-button .el-icon {
  font-size: 12px;
}

.placeholder-text {
  color: var(--el-text-color-placeholder) !important;
  font-style: italic;
  font-family: inherit !important;
  font-weight: normal !important;
}

/* 自定义快捷键行样式 */
.custom-hotkey-row {
  border-color: #f2c2d0;
  background: var(--brand-soft);
}

.custom-hotkey-row:hover {
  border-color: #ef9ab1;
  background: #fff;
  transform: none;
  box-shadow: 0 8px 22px rgba(239, 71, 118, .08);
}

.custom-hotkey-row::before,
.custom-hotkey-row::after { display: none; }

/* 自定义标识徽章 */
.custom-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: var(--el-color-primary);
  color: white;
  font-size: 10px;
  border-radius: 10px;
  font-weight: 500;
  margin-left: 6px;
  line-height: 1;
}

/* 错误样式 */
.input-error {
  border-color: var(--el-color-danger) !important;
}

.input-error:focus {
  border-color: var(--el-color-danger) !important;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2) !important;
}

.error-text {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
}

.deeplx-hint {
  color: var(--fr-secondary-text-color, #909399);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

.deeplx-presets {
  margin-top: 6px;
  width: 100%;
}

.free-translation-order {
  display: flex;
  align-items: center;
  color: var(--el-color-primary);
  font-weight: 600;
}

@media (max-width: 480px) {
  .config-history-heading { align-items: stretch; flex-direction: column; }
  .config-history-actions { justify-content: flex-start; }
  .config-history-entry { grid-template-columns: 54px minmax(0, 1fr) auto; gap: 7px; padding-right: 7px; padding-left: 8px; }
}

@media (max-width: 700px) {
  .image-ocr-heading,
  .image-ocr-recommendation { align-items: flex-start; flex-direction: column; }
  .image-ocr-recommendation { gap: 12px; }
  .image-ocr-primary-action { width: 100%; }
  .image-ocr-pack-card { align-items: flex-start; flex-wrap: wrap; }
  .image-ocr-pack-copy { min-width: calc(100% - 54px); }
  .image-ocr-pack-action { width: 100%; justify-content: flex-end; }
  .image-ocr-footnote-row { align-items: flex-start; flex-direction: column; }
}
</style>
