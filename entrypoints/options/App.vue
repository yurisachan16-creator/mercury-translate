<template>
  <div class="settings-app">
    <aside class="sidebar">
      <div class="brand">
        <img src="/icon/128.png" alt="" />
        <div><strong>{{ t('brand.productName') }}</strong><small>{{ t('brand.productSubtitle') }} · V{{ version }}</small></div>
      </div>

      <nav :aria-label="t('shell.settingsNavLabel')">
        <section v-for="group in navigationGroups" :key="group.label" class="nav-group">
          <span class="nav-group-label">{{ group.label }}</span>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :class="{ active: activeSection === item.id }"
            :aria-current="activeSection === item.id ? 'page' : undefined"
            @click="selectSection(item.id)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
          </button>
        </section>
      </nav>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div>
          <span class="eyebrow">{{ activeItem.group }}</span>
          <h1>{{ activeItem.heading }}</h1>
          <p>{{ activeItem.summary }}</p>
        </div>
        <div class="topbar-actions">
          <label class="locale-box">
            <span>{{ t('locale.label') }}</span>
            <select v-model="uiLocalePreference" @change="changeUiLocale">
              <option v-for="item in uiLocaleOptions" :key="item.value" :value="item.value">{{ t(item.labelKey) }}</option>
            </select>
          </label>
          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input v-model.trim="query" type="search" :placeholder="t('shell.settingsSearchPlaceholder')" />
          </label>
        </div>
      </header>

      <div v-if="query && filteredResults.length" class="search-results">
        <button v-for="result in filteredResults" :key="result.id" type="button" @click="selectResult(result.id)">
          <span><strong>{{ result.label }}</strong><small>{{ result.searchDescription }}</small></span><b>{{ t('shell.openResult') }}</b>
        </button>
      </div>
      <div v-else-if="query" class="search-empty">{{ t('shell.searchEmpty', { query }) }}</div>

      <section class="settings-card" :class="{ 'services-view': activeSection === 'settings-services' }" :aria-label="activeItem.heading">
        <div v-if="!['settings-services', 'settings-about'].includes(activeSection)" class="card-intro">
          <span class="eyebrow">{{ activeItem.kicker }}</span>
          <h2>{{ activeItem.title }}</h2>
          <p>{{ activeItem.detail }}</p>
        </div>
        <section v-if="activeSection === 'settings-about'" id="settings-about" class="about-page" aria-labelledby="about-title">
          <div class="about-hero">
            <img class="about-logo" src="/icon/128.png" :alt="t('brand.iconAlt')" />
            <div>
              <span class="eyebrow">{{ t('brand.aboutLabel') }}</span>
              <h3 id="about-title">{{ t('shell.readingTagline') }}</h3>
              <p>{{ t('shell.aboutDescription') }}</p>
              <span class="about-version">{{ t('brand.versionPrefix') }} · V{{ version }}</span>
            </div>
          </div>

          <div class="about-grid">
            <article class="about-panel">
              <span class="about-panel-kicker">{{ t('shell.coreExperience') }}</span>
              <h3>{{ t('shell.builtForReading') }}</h3>
              <p>{{ t('shell.builtForReadingDetail') }}</p>
              <div class="about-feature-list">
                <span><b>译</b>{{ t('shell.featureWebReading') }}</span>
                <span><b>⌘</b>{{ t('shell.featureTools') }}</span>
                <span><b>AI</b>{{ t('shell.featureServices') }}</span>
              </div>
            </article>

            <article class="about-panel about-links-panel">
              <span class="about-panel-kicker">{{ t('shell.learnMore') }}</span>
              <h3>{{ t('shell.improveTogether') }}</h3>
              <p>{{ t('shell.learnMoreDetail') }}</p>
              <div class="about-links">
                <a href="https://github.com/yurisachan16-creator/mercury-translate" target="_blank" rel="noreferrer">{{ t('brand.openSourceProject') }} <span>↗</span></a>
              </div>
            </article>
          </div>

          <p class="about-footer">{{ t('brand.thanks') }}</p>
        </section>
        <Main v-else :active-section="activeSection" />
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Main from '@/components/Main.vue'
import { createNavigationGroups, createNavigationItems } from './navigation'
import {
  getStoredUiLocalePreference,
  resolveUiLocalePreference,
  saveUiLocalePreference,
  UI_LOCALE_OPTIONS,
  watchStoredUiLocalePreference,
  type UiLocalePreference,
} from '@/entrypoints/i18n/preferences'

const version = process.env.VUE_APP_VERSION
const { locale, t } = useI18n({ useScope: 'global' })
const query = ref('')
const activeSection = ref('settings-general')
const uiLocalePreference = ref<UiLocalePreference>('auto')
const uiLocaleOptions = UI_LOCALE_OPTIONS

const navigationGroups = computed(() => createNavigationGroups((key) => t(key)))
const navigation = computed(() => createNavigationItems((key) => t(key)))
const activeItem = computed(() => navigation.value.find((item) => item.id === activeSection.value) || navigation.value[0])
const stopLocalePreferenceSync = watchStoredUiLocalePreference((nextLocale, preference) => {
  uiLocalePreference.value = preference
  locale.value = nextLocale
})

const filteredResults = computed(() => {
  if (!query.value) return []
  const keyword = query.value.toLocaleLowerCase()
  return navigation.value.filter((item) =>
    `${item.label}${item.description}${item.heading}${item.summary}${item.searchDescription}`
      .toLocaleLowerCase()
      .includes(keyword),
  )
})

function selectSection(id: string) {
  if (!navigation.value.some((item) => item.id === id)) return
  activeSection.value = id
  query.value = ''
  history.replaceState(null, '', `#${id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function selectResult(id: string) {
  selectSection(id)
}

async function changeUiLocale() {
  await saveUiLocalePreference(uiLocalePreference.value)
  locale.value = resolveUiLocalePreference(uiLocalePreference.value)
}

onMounted(async () => {
  uiLocalePreference.value = await getStoredUiLocalePreference()
  locale.value = resolveUiLocalePreference(uiLocalePreference.value)
  const requestedSection = window.location.hash.slice(1)
  if (navigation.value.some((item) => item.id === requestedSection)) {
    activeSection.value = requestedSection
  }
})

onUnmounted(() => {
  stopLocalePreferenceSync()
})
</script>
