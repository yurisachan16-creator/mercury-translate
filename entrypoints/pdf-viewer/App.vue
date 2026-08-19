<template>
  <main class="mercury-pdf-viewer">
    <header class="pdf-toolbar">
      <div class="pdf-brand">
        <strong>Mercury Translate</strong>
        <span>{{ t('pdf.subtitle') }}</span>
      </div>

      <label>
        <span>{{ t('pdf.from') }}</span>
        <select v-model="sourceLanguage" :disabled="loading">
          <option v-for="language in translationLanguages" :key="language.value" :value="language.value">{{ language.label }}</option>
        </select>
      </label>
      <label>
        <span>{{ t('pdf.to') }}</span>
        <select v-model="targetLanguage" :disabled="loading">
          <option v-for="language in targetLanguages" :key="language.value" :value="language.value">{{ language.label }}</option>
        </select>
      </label>
      <label>
        <span>{{ t('pdf.service') }}</span>
        <select v-model="providerId" :disabled="loading" @focus="rememberProvider" @change="ensureProviderPermission">
          <option v-for="provider in providers" :key="provider.value" :value="provider.value">{{ provider.label }}</option>
        </select>
        <small v-if="providerPermissionMessage" class="pdf-provider-warning">{{ providerPermissionMessage }}</small>
      </label>
      <label>
        <span>{{ t('pdf.ocr') }}</span>
        <select v-model="ocrLanguage" :disabled="loading">
          <option v-for="language in ocrLanguages" :key="language.value" :value="language.value">{{ language.label }}</option>
        </select>
      </label>
      <label class="pdf-cache-toggle">
        <span>{{ t('pdf.cache') }}</span>
        <input v-model="cacheEnabled" type="checkbox" :disabled="loading" @change="saveCachePreference" />
      </label>

      <div class="pdf-toolbar-actions">
        <button type="button" :disabled="loading || !documentReady" @click="retryVisiblePage">{{ t('pdf.retryPage') }}</button>
        <button type="button" :disabled="loading || !documentReady" @click="cancelTranslation">{{ t('pdf.cancel') }}</button>
        <button type="button" :disabled="loading" @click="clearTranslationCache">{{ t('pdf.clearCache') }}</button>
        <button type="button" class="native-fallback" @click="fallbackToNative">{{ t('pdf.openChrome') }}</button>
      </div>
    </header>

    <section v-if="loading" class="pdf-state" aria-live="polite">
      <span class="pdf-spinner" aria-hidden="true" />
      <p>{{ loadingMessage }}</p>
    </section>

    <section v-else-if="fallback" class="pdf-state pdf-fallback" aria-live="polite">
      <h1>{{ t('pdf.openedNativeTitle') }}</h1>
      <p>{{ fallbackMessage }}</p>
      <button type="button" @click="fallbackToNative">{{ t('pdf.continue') }}</button>
    </section>

    <section v-else-if="errorMessage" class="pdf-state pdf-error" role="alert">
      <h1>{{ t('pdf.unavailableTitle') }}</h1>
      <p>{{ errorMessage }}</p>
      <button type="button" @click="fallbackToNative">{{ t('pdf.openChrome') }}</button>
    </section>

    <section v-else class="pdf-panes" :aria-label="t('pdf.documentLabel')">
      <div ref="leftPane" class="pdf-pane pdf-original-pane" :aria-label="t('pdf.originalPdf')" @scroll="syncScroll('left')">
        <article
          v-for="page in pages"
          :key="page.pageIndex"
          :ref="element => setPageElement('left', page.pageIndex, element)"
          class="pdf-page pdf-original-page"
          :data-page-index="page.pageIndex"
        >
          <header>{{ t('pdf.original') }} · {{ page.pageIndex + 1 }}</header>
          <div class="pdf-page-canvas-wrap">
            <canvas :ref="element => setCanvas(page.pageIndex, element)" />
            <button
              v-for="block in page.source?.blocks || []"
              :key="block.id"
              class="pdf-original-block"
              :class="{ highlighted: highlightedBlockId === block.id }"
              :style="getBlockStyle(page, block.id)"
              :ref="element => setOriginalBlockElement(block.id, element)"
              type="button"
              :aria-label="t('pdf.originalText', {text: block.text})"
              @click="focusOriginalBlock(page.pageIndex, block.id)"
            />
          </div>
          <p v-if="page.rendering" class="pdf-page-hint">{{ t('pdf.rendering') }}</p>
          <p v-else-if="page.kind === 'scanned'" class="pdf-page-hint">{{ t('pdf.scannedHint') }}</p>
        </article>
      </div>

      <div ref="rightPane" class="pdf-pane pdf-translation-pane" :aria-label="t('pdf.translatedPdf')" @scroll="syncScroll('right')">
        <section v-if="localProviderGateVisible" class="pdf-provider-state" aria-live="polite">
          <span v-if="localProviderChecking || localProviderPreparing" class="pdf-spinner" aria-hidden="true" />
          <h1>{{ localProviderTitle }}</h1>
          <p>{{ localProviderMessage }}</p>
          <button
            v-if="localProviderCanPrepare"
            type="button"
            :disabled="localProviderPreparing"
            @click="prepareLocalProviderAndTranslate"
          >
            {{ localProviderPreparing ? t('pdf.localProviderPreparing') : t('pdf.localProviderStart') }}
          </button>
          <button v-else type="button" :disabled="localProviderChecking" @click="refreshLocalProviderAvailability">
            {{ t('pdf.localProviderCheckAgain') }}
          </button>
        </section>
        <article
          v-for="page in pages"
          :key="page.pageIndex"
          :ref="element => setPageElement('right', page.pageIndex, element)"
          class="pdf-page pdf-translation-page"
          :data-page-index="page.pageIndex"
        >
          <header>
            <span>{{ t('pdf.translation') }} · {{ page.pageIndex + 1 }}</span>
            <span class="pdf-status" :class="`is-${page.status}`">{{ statusLabel(page.status) }}</span>
          </header>
          <div v-if="page.status === 'error'" class="pdf-page-error">
            <p>{{ page.error }}</p>
            <button type="button" @click="retryPage(page.pageIndex)">{{ t('pdf.retryPage') }}</button>
          </div>
          <button
            v-for="block in page.source?.blocks || []"
            :key="block.id"
            class="pdf-translation-block"
            type="button"
            @click="focusOriginalBlock(page.pageIndex, block.id)"
          >
            <small>{{ block.text }}</small>
            <strong>{{ page.translations[block.id] || (page.status === 'translating' ? t('pdf.translating') : '—') }}</strong>
          </button>
          <p v-if="!page.source && !page.error" class="pdf-page-hint">{{ t('pdf.scheduledHint') }}</p>
          <p v-else-if="page.source?.kind === 'scanned' && !ocrReady" class="pdf-page-hint">{{ t('pdf.chooseOcrHint') }}</p>
        </article>
      </div>
    </section>

    <section v-if="ocrPromptPage !== null" class="pdf-ocr-dialog" role="dialog" aria-modal="true" aria-labelledby="pdf-ocr-title">
      <div class="pdf-ocr-card">
        <h1 id="pdf-ocr-title">{{ t('pdf.scannedTitle') }}</h1>
        <p>{{ t('pdf.scannedMessage', {page: ocrPromptPage + 1}) }}</p>
        <label>
          <span>{{ t('pdf.ocrLanguage') }}</span>
          <select v-model="ocrLanguage">
            <option v-for="language in ocrLanguages" :key="language.value" :value="language.value">{{ language.label }}</option>
          </select>
        </label>
        <div>
          <button type="button" @click="dismissOcrPrompt">{{ t('pdf.skipPage') }}</button>
          <button type="button" class="primary" :disabled="ocrPreparing" @click="enableOcr">{{ ocrPreparing ? t('pdf.preparing') : t('pdf.useOcr') }}</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import browser from 'webextension-polyfill';

import type {PdfDocumentController as PdfDocumentControllerType} from '@/entrypoints/utils/pdfDocument';
import {PdfDocumentLoadError, PdfDocumentController} from '@/entrypoints/utils/pdfDocument';
import {createPdfOcrBlocks, renderPdfPageForOcr} from '@/entrypoints/utils/pdfOcr';
import {PDF_VISIBLE_PAGE_RADIUS, PdfPageScheduler} from '@/entrypoints/utils/pdfScheduler';
import {createChromePdfStreamAdapter, fetchPdfStreamBytes, PdfViewerFallbackError} from '@/entrypoints/utils/pdfStream';
import {
  buildPdfBlockCacheIdentity,
  buildPdfProviderConfigFingerprint,
  buildPdfTranslationCacheKey,
  pdfTranslationCache,
} from '@/entrypoints/utils/pdfTranslationCache';
import {config, configReady} from '@/entrypoints/utils/config';
import {getTranslationTargetOptionsForProvider} from '@/entrypoints/utils/languageRegistry';
import {resolveConfiguredModel} from '@/entrypoints/utils/option';
import {requestProviderHostPermission} from '@/entrypoints/utils/providerPermissions';
import {createPdfPageSource} from '@/entrypoints/utils/pdfText';
import {getPdfBlockFocusScrollPosition} from '@/entrypoints/utils/pdfBlockFocus';
import {createRuntimePdfViewerClient} from '@/entrypoints/utils/pdfViewerClient';
import {canPreparePdfLocalProvider, shouldGatePdfLocalProvider} from '@/entrypoints/pdf-viewer/localProviderGate';
import type {
  PdfOcrLanguageCode,
  PdfPageRenderer,
  PdfPageResult,
  PdfPageSource,
  PdfTextBlock,
  PdfTranslationStatus,
  ProviderRuntimeAvailability,
} from '@/entrypoints/types/pdf';
import {services} from '@/entrypoints/utils/option';

interface PdfPageView {
  pageIndex: number;
  source?: PdfPageSource;
  status: PdfTranslationStatus;
  translations: Record<string, string>;
  error?: string;
  rendering: boolean;
  kind?: PdfPageSource['kind'];
}

interface PdfPageMetrics {
  width: number;
  height: number;
}

const {t} = useI18n({useScope: 'global'});

const providers = computed(() => [
  {value: 'chromeTranslator', label: t('pdf.providerChrome')},
  {value: 'microsoft', label: t('pdf.providerMicrosoft')},
  {value: 'google', label: t('pdf.providerGoogle')},
  {value: 'deepseek', label: t('pdf.providerDeepSeek')},
  {value: 'gemini', label: t('pdf.providerGemini')},
  {value: 'openai', label: t('pdf.providerOpenAi')},
  {value: 'custom', label: t('pdf.providerCustom')},
]);
const ocrLanguages: Array<{value: PdfOcrLanguageCode; label: string}> = [
  {value: 'eng', label: 'English'},
  {value: 'chi_sim', label: '简体中文'},
  {value: 'chi_tra', label: '繁體中文'},
  {value: 'jpn', label: '日本語'},
  {value: 'kor', label: '한국어'},
];

const streamAdapter = createChromePdfStreamAdapter();
const client = createRuntimePdfViewerClient(undefined, {
  onProviderSelected(selectedProviderId) {
    providerId.value = selectedProviderId;
  },
});
let documentController: PdfDocumentControllerType | null = null;
let scheduler: PdfPageScheduler | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let highlightedTimer: ReturnType<typeof setTimeout> | null = null;
let scrollSynchronizing = false;
const rendererByPage = new Map<number, PdfPageRenderer>();
const canvasByPage = new Map<number, HTMLCanvasElement>();
const metricsByPage = new Map<number, PdfPageMetrics>();
const leftPageElements = new Map<number, HTMLElement>();
const rightPageElements = new Map<number, HTMLElement>();
const originalBlockElements = new Map<string, HTMLButtonElement>();

const leftPane = ref<HTMLElement | null>(null);
const rightPane = ref<HTMLElement | null>(null);
const pages = ref<PdfPageView[]>([]);
const documentReady = ref(false);
const loading = ref(true);
const loadingMessage = ref(t('pdf.opening'));
const fallback = ref(false);
const fallbackMessage = ref('');
const errorMessage = ref('');
const sourceLanguage = ref('auto');
const targetLanguage = ref('zh-Hans');
const providerId = ref('chromeTranslator');
const targetLanguages = computed(() => getTranslationTargetOptionsForProvider(providerId.value));
const translationLanguages = computed(() => [
  {value: 'auto', label: t('pdf.autoDetect')},
  ...targetLanguages.value,
]);
let previousProviderId = providerId.value;
const providerPermissionMessage = ref('');
const ocrLanguage = ref<PdfOcrLanguageCode>('eng');
const ocrReady = ref(false);
const ocrPreparing = ref(false);
const ocrPromptPage = ref<number | null>(null);
const visiblePageIndex = ref(0);
const highlightedBlockId = ref<string | null>(null);
const cacheEnabled = ref(true);
const localProviderAvailability = ref<ProviderRuntimeAvailability | null>(null);
const localProviderChecking = ref(false);
const localProviderPreparing = ref(false);
const localProviderGestureArmed = ref(false);
const PDF_CACHE_ENABLED_STORAGE_KEY = 'mercuryPdfTranslationCacheEnabled';

const localProviderGateVisible = computed(() => documentReady.value
  && shouldGatePdfLocalProvider(providerId.value, localProviderAvailability.value, localProviderGestureArmed.value));
const localProviderCanPrepare = computed(() => canPreparePdfLocalProvider(localProviderAvailability.value));
const localProviderTitle = computed(() => {
  if (localProviderChecking.value) return t('pdf.localProviderChecking');
  return ({
    ready: t('pdf.localProviderReady'),
    downloadable: t('pdf.localProviderDownloadable'),
    downloading: t('pdf.localProviderDownloading'),
    unsupported: t('pdf.localProviderUnsupported'),
    'after-detection': t('pdf.localProviderAfterDetection'),
    configured: t('pdf.localProviderReady'),
  } as Record<ProviderRuntimeAvailability, string>)[localProviderAvailability.value || 'unsupported'];
});
const localProviderMessage = computed(() => {
  if (localProviderChecking.value) return t('pdf.localProviderCheckingMessage');
  return ({
    ready: t('pdf.localProviderReadyMessage'),
    downloadable: t('pdf.localProviderDownloadableMessage'),
    downloading: t('pdf.localProviderDownloadingMessage'),
    unsupported: t('pdf.localProviderUnsupportedMessage'),
    'after-detection': t('pdf.localProviderAfterDetectionMessage'),
    configured: t('pdf.localProviderReadyMessage'),
  } as Record<ProviderRuntimeAvailability, string>)[localProviderAvailability.value || 'unsupported'];
});

function providerCacheOptions() {
  const service = providerId.value;
  const providerModel = resolveConfiguredModel(config.model[service], config.customModel[service]);
  return {
    providerModel,
    providerConfigFingerprint: buildPdfProviderConfigFingerprint({
      endpoint: config.proxy[service]
        || (service === 'custom' ? config.custom : '')
        || (service === 'newapi' ? config.newApiUrl : ''),
      model: providerModel,
      customBody: config.customBody[service] || '',
      systemRole: config.system_role[service] || '',
      userRole: config.user_role[service] || '',
      deepseekApiType: config.deepseekApiType,
      deepseekThinkingMode: config.deepseekThinkingMode,
    }),
  };
}

async function loadCachePreference(): Promise<void> {
  const stored = await browser.storage.local.get(PDF_CACHE_ENABLED_STORAGE_KEY);
  cacheEnabled.value = stored[PDF_CACHE_ENABLED_STORAGE_KEY] !== false;
}

async function saveCachePreference(): Promise<void> {
  await browser.storage.local.set({[PDF_CACHE_ENABLED_STORAGE_KEY]: cacheEnabled.value});
}

function rememberProvider(): void {
  previousProviderId = providerId.value;
}

async function ensureProviderPermission(): Promise<void> {
  const selected = providerId.value;
  providerPermissionMessage.value = '';
  try {
    if (!await requestProviderHostPermission(selected, config)) {
      providerId.value = previousProviderId;
      providerPermissionMessage.value = t('pdf.permissionDenied');
      return;
    }
    previousProviderId = selected;
    await refreshLocalProviderAvailability();
  } catch (error) {
    providerId.value = previousProviderId;
    providerPermissionMessage.value = error instanceof Error ? error.message : t('pdf.permissionError');
  }
}

async function refreshLocalProviderAvailability(): Promise<void> {
  localProviderGestureArmed.value = false;
  if (providerId.value !== services.chromeTranslator) {
    localProviderAvailability.value = 'configured';
    return;
  }
  localProviderChecking.value = true;
  try {
    localProviderAvailability.value = await client.checkProviderAvailability(
      providerId.value,
      sourceLanguage.value,
      targetLanguage.value,
    );
  } catch {
    localProviderAvailability.value = 'unsupported';
  } finally {
    localProviderChecking.value = false;
  }
}

async function prepareLocalProviderAndTranslate(): Promise<void> {
  localProviderPreparing.value = true;
  localProviderGestureArmed.value = true;
  try {
    scheduler?.updateVisiblePage(visiblePageIndex.value);
  } finally {
    localProviderPreparing.value = false;
  }
}

function setPageState(pageIndex: number, update: Partial<PdfPageView>): void {
  const page = pages.value[pageIndex];
  if (!page) return;
  pages.value.splice(pageIndex, 1, {...page, ...update});
}

function getPage(pageIndex: number): PdfPageView | undefined {
  return pages.value[pageIndex];
}

function setCanvas(pageIndex: number, element: unknown): void {
  if (element instanceof HTMLCanvasElement) {
    canvasByPage.set(pageIndex, element);
  } else {
    canvasByPage.delete(pageIndex);
  }
}

function setPageElement(side: 'left' | 'right', pageIndex: number, element: unknown): void {
  const collection = side === 'left' ? leftPageElements : rightPageElements;
  if (element instanceof HTMLElement) collection.set(pageIndex, element);
  else collection.delete(pageIndex);
}

function setOriginalBlockElement(blockId: string, element: unknown): void {
  if (element instanceof HTMLButtonElement) originalBlockElements.set(blockId, element);
  else originalBlockElements.delete(blockId);
}

async function getRenderer(pageIndex: number): Promise<PdfPageRenderer> {
  if (!documentController) throw new Error('PDF document is not ready.');
  const existing = rendererByPage.get(pageIndex);
  if (existing) return existing;
  const renderer = await documentController.getPageRenderer(pageIndex);
  rendererByPage.set(pageIndex, renderer);
  return renderer;
}

async function ensurePageSource(pageIndex: number): Promise<PdfPageSource> {
  const existing = getPage(pageIndex)?.source;
  if (existing) return existing;
  const renderer = await getRenderer(pageIndex);
  const content = await renderer.extractText();
  metricsByPage.set(pageIndex, {width: content.width, height: content.height});
  const source = createPdfPageSource(content);
  setPageState(pageIndex, {source, kind: source.kind});
  return source;
}

async function ensurePageRendered(pageIndex: number): Promise<void> {
  const canvas = canvasByPage.get(pageIndex);
  if (!canvas || getPage(pageIndex)?.rendering) return;
  setPageState(pageIndex, {rendering: true});
  try {
    const renderer = await getRenderer(pageIndex);
    await Promise.all([renderer.render(canvas, 1.25), ensurePageSource(pageIndex)]);
  } catch (error) {
    setPageState(pageIndex, {error: error instanceof Error ? error.message : t('pdf.renderFailed'), status: 'error'});
  } finally {
    setPageState(pageIndex, {rendering: false});
  }
}

async function getTranslationBlocks(pageIndex: number, source: PdfPageSource, signal: AbortSignal): Promise<PdfTextBlock[]> {
  if (source.kind === 'text') return source.blocks;
  if (!ocrReady.value) {
    ocrPromptPage.value = pageIndex;
    throw new Error(t('pdf.chooseOcrHint'));
  }

  const renderer = await getRenderer(pageIndex);
  const image = await renderPdfPageForOcr(renderer);
  const lines = await client.recognizePage({
    documentFingerprint: documentController!.fingerprint,
    pageIndex,
    imageDataUrl: image.imageDataUrl,
    language: ocrLanguage.value,
  }, signal);
  const blocks = createPdfOcrBlocks(pageIndex, lines, image);
  const withOcr = {...source, blocks, ocrLines: lines};
  setPageState(pageIndex, {source: withOcr, kind: 'scanned'});
  return blocks;
}

async function translateBlocks(pageIndex: number, blocks: PdfTextBlock[], signal: AbortSignal): Promise<Record<string, string>> {
  if (!documentController || blocks.length === 0) return {};
  const result: Record<string, string> = {};
  const pending: PdfTextBlock[] = [];
  const providerOptions = providerCacheOptions();
  for (const block of blocks) {
    const key = buildPdfTranslationCacheKey(buildPdfBlockCacheIdentity(documentController.fingerprint, block, {
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
      providerId: providerId.value,
      ...providerOptions,
    }));
    const cached = cacheEnabled.value ? await pdfTranslationCache.get(key) : null;
    if (cached) result[block.id] = cached;
    else pending.push(block);
  }

  if (pending.length === 0) return result;
  const request = (segments: PdfTextBlock[]) => client.translatePage({
    documentFingerprint: documentController!.fingerprint,
    pageIndex,
    sourceLanguage: sourceLanguage.value,
    targetLanguage: targetLanguage.value,
    providerId: providerId.value,
    segments: segments.map(block => ({id: block.id, text: block.text, contentHash: block.contentHash})),
  }, signal);
  const batch = await request(pending);
  const received = new Map(batch.translations.map(item => [item.id, item.translation]));
  const missing = pending.filter(block => !received.has(block.id));
  for (const block of pending) {
    const translation = received.get(block.id);
    if (translation) result[block.id] = translation;
  }

  // Some AI providers return a malformed/misaligned batch. Retrying only the
  // missing stable segment IDs preserves page order without trusting position.
  for (const block of missing) {
    const retry = await request([block]);
    const translation = retry.translations.find(item => item.id === block.id)?.translation;
    if (!translation) throw new Error(`No translation was returned for PDF block ${block.order + 1}.`);
    result[block.id] = translation;
  }

  if (cacheEnabled.value) await Promise.all(blocks.map(async (block) => {
    const translation = result[block.id];
    if (!translation) return;
    const key = buildPdfTranslationCacheKey(buildPdfBlockCacheIdentity(documentController!.fingerprint, block, {
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
      providerId: providerId.value,
      ...providerCacheOptions(),
    }));
    await pdfTranslationCache.set(key, translation);
  }));
  return result;
}

async function translatePage(
  pageIndex: number,
  signal: AbortSignal,
  reportProgress: (completedSegments: number, totalSegments: number) => void,
): Promise<void> {
  if (shouldGatePdfLocalProvider(providerId.value, localProviderAvailability.value, localProviderGestureArmed.value)) {
    throw new Error(localProviderMessage.value);
  }
  const source = await ensurePageSource(pageIndex);
  const blocks = await getTranslationBlocks(pageIndex, source, signal);
  reportProgress(0, blocks.length);
  const translations = await translateBlocks(pageIndex, blocks, signal);
  if (signal.aborted) return;
  reportProgress(blocks.length, blocks.length);
  const finalSource = getPage(pageIndex)?.source || source;
  const pageResult: PdfPageResult = {
    pageIndex,
    kind: finalSource.kind,
    blocks: finalSource.blocks,
    translations: Object.entries(translations).map(([id, translation]) => ({id, translation})),
    status: 'translated',
    usedOcr: finalSource.kind === 'scanned',
  };
  setPageState(pageIndex, {source: {...finalSource, blocks: pageResult.blocks}, translations, status: pageResult.status, error: undefined});
}

function configureScheduler(): void {
  scheduler?.dispose();
  if (!documentController) return;
  scheduler = new PdfPageScheduler({
    pageCount: documentController.pageCount,
    radius: PDF_VISIBLE_PAGE_RADIUS,
    onProgress: (progress) => {
      if (progress.status === 'translated' && getPage(progress.pageIndex)?.translations) return;
      setPageState(progress.pageIndex, {
        status: progress.status,
        error: progress.status === 'error' ? progress.error : undefined,
      });
    },
  });
  scheduler.setRunner(({pageIndex, signal, reportProgress}) => translatePage(pageIndex, signal, reportProgress));
}

async function updateVisiblePage(pageIndex: number): Promise<void> {
  visiblePageIndex.value = pageIndex;
  await ensurePageRendered(pageIndex);
  const source = await ensurePageSource(pageIndex);
  if (source.kind === 'scanned' && !ocrReady.value) {
    ocrPromptPage.value = pageIndex;
    return;
  }
  if (localProviderGateVisible.value) return;
  scheduler?.updateVisiblePage(pageIndex);
}

function observePages(): void {
  intersectionObserver?.disconnect();
  const container = leftPane.value;
  if (!container || typeof IntersectionObserver === 'undefined') return;
  intersectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    const pageIndex = Number((visible?.target as HTMLElement | undefined)?.dataset.pageIndex);
    if (Number.isInteger(pageIndex) && pageIndex >= 0) void updateVisiblePage(pageIndex);
  }, {root: container, threshold: [0.2, 0.5, 0.8]});
  leftPageElements.forEach(element => intersectionObserver?.observe(element));
}

async function openPdf(): Promise<void> {
  try {
    loading.value = true;
    loadingMessage.value = t('pdf.opening');
    await pdfTranslationCache.cleanup();
    const stream = await streamAdapter.getStreamInfo();
    loadingMessage.value = t('pdf.reading');
    const bytes = await fetchPdfStreamBytes(stream);
    documentController = await PdfDocumentController.load(bytes);
    documentReady.value = true;
    // The source ArrayBuffer is intentionally not retained after PDF.js takes
    // ownership. No PDF bytes are written to settings or translation caches.
    pages.value = Array.from({length: documentController.pageCount}, (_, pageIndex) => ({
      pageIndex,
      status: 'idle',
      translations: {},
      rendering: false,
    }));
    configureScheduler();
    loading.value = false;
    await nextTick();
    observePages();
    await refreshLocalProviderAvailability();
    await updateVisiblePage(0);
  } catch (error) {
    loading.value = false;
    documentReady.value = false;
    if (error instanceof PdfViewerFallbackError || error instanceof PdfDocumentLoadError) {
      errorMessage.value = error.message;
      await fallbackToNative();
    } else {
      errorMessage.value = error instanceof Error ? error.message : t('pdf.openFailed');
    }
  }
}

async function fallbackToNative(): Promise<void> {
  scheduler?.cancel();
  if (documentController) await client.cancel(documentController.fingerprint).catch(() => undefined);
  try {
    await streamAdapter.abortAndFallbackToNativeHandler();
    documentReady.value = false;
    fallback.value = true;
    fallbackMessage.value = t('pdf.returnedNative');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('pdf.nativeFailed');
  }
}

async function enableOcr(): Promise<void> {
  ocrPreparing.value = true;
  try {
    await client.ensureOcrLanguage(ocrLanguage.value);
    ocrReady.value = true;
    const pageIndex = ocrPromptPage.value ?? visiblePageIndex.value;
    ocrPromptPage.value = null;
    scheduler?.updateVisiblePage(pageIndex);
  } catch (error) {
    const pageIndex = ocrPromptPage.value;
    if (pageIndex !== null) setPageState(pageIndex, {status: 'error', error: error instanceof Error ? error.message : t('pdf.ocrSetupFailed')});
  } finally {
    ocrPreparing.value = false;
  }
}

function dismissOcrPrompt(): void {
  const pageIndex = ocrPromptPage.value;
  ocrPromptPage.value = null;
  if (pageIndex !== null) setPageState(pageIndex, {status: 'idle'});
}

async function cancelTranslation(): Promise<void> {
  scheduler?.cancel();
  if (documentController) await client.cancel(documentController.fingerprint).catch(() => undefined);
}

function retryPage(pageIndex: number): void {
  setPageState(pageIndex, {status: 'queued', error: undefined});
  scheduler?.retry(pageIndex);
}

function retryVisiblePage(): void {
  retryPage(visiblePageIndex.value);
}

async function clearTranslationCache(): Promise<void> {
  await pdfTranslationCache.clear();
  pages.value.forEach(page => setPageState(page.pageIndex, {translations: {}, status: page.status === 'translated' ? 'idle' : page.status}));
}

function statusLabel(status: PdfTranslationStatus): string {
  return ({
    idle: t('pdf.waiting'),
    queued: t('pdf.queued'),
    translating: t('pdf.translating'),
    translated: t('pdf.translated'),
    error: t('pdf.failed'),
    cancelled: t('pdf.cancelled'),
  } as Record<PdfTranslationStatus, string>)[status];
}

function getBlockStyle(page: PdfPageView, blockId: string): Record<string, string> {
  const block = page.source?.blocks.find(item => item.id === blockId);
  const metrics = metricsByPage.get(page.pageIndex);
  if (!block || !metrics) return {display: 'none'};
  const width = Math.max(0.5, ((block.bbox.x1 - block.bbox.x0) / metrics.width) * 100);
  const height = Math.max(0.5, ((block.bbox.y1 - block.bbox.y0) / metrics.height) * 100);
  return {
    left: `${Math.max(0, (block.bbox.x0 / metrics.width) * 100)}%`,
    top: `${Math.max(0, ((metrics.height - block.bbox.y1) / metrics.height) * 100)}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

function focusOriginalBlock(pageIndex: number, blockId: string): void {
  const pane = leftPane.value;
  const block = originalBlockElements.get(blockId);
  if (pane && block) {
    const paneRect = pane.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();
    const target = getPdfBlockFocusScrollPosition({
      scrollTop: pane.scrollTop,
      scrollLeft: pane.scrollLeft,
      clientHeight: pane.clientHeight,
      clientWidth: pane.clientWidth,
      scrollHeight: pane.scrollHeight,
      scrollWidth: pane.scrollWidth,
      top: paneRect.top,
      left: paneRect.left,
    }, blockRect);
    if (typeof pane.scrollTo === 'function') {
      pane.scrollTo({top: target.top, left: target.left, behavior: 'smooth'});
    } else {
      pane.scrollTop = target.top;
      pane.scrollLeft = target.left;
    }
    block.focus({preventScroll: true});
  } else {
    // Rendering can lag the right pane briefly. Preserve navigation to the
    // matching page until its exact bbox overlay is mounted.
    leftPageElements.get(pageIndex)?.scrollIntoView({block: 'center', behavior: 'smooth'});
  }
  highlightedBlockId.value = blockId;
  if (highlightedTimer) clearTimeout(highlightedTimer);
  highlightedTimer = setTimeout(() => { highlightedBlockId.value = null; }, 1600);
}

function syncScroll(source: 'left' | 'right'): void {
  if (scrollSynchronizing) return;
  const from = source === 'left' ? leftPane.value : rightPane.value;
  const to = source === 'left' ? rightPane.value : leftPane.value;
  const fromPages = source === 'left' ? leftPageElements : rightPageElements;
  const toPages = source === 'left' ? rightPageElements : leftPageElements;
  if (!from || !to) return;
  const current = pages.value.find((page, index) => {
    const element = fromPages.get(index);
    const next = fromPages.get(index + 1);
    return !!element && from.scrollTop >= element.offsetTop && (!next || from.scrollTop < next.offsetTop);
  }) || pages.value.at(-1);
  if (!current) return;
  const fromPage = fromPages.get(current.pageIndex);
  const toPage = toPages.get(current.pageIndex);
  if (!fromPage || !toPage) return;
  const progress = Math.max(0, Math.min(1, (from.scrollTop - fromPage.offsetTop) / Math.max(1, fromPage.offsetHeight)));
  scrollSynchronizing = true;
  to.scrollTop = toPage.offsetTop + progress * toPage.offsetHeight;
  requestAnimationFrame(() => { scrollSynchronizing = false; });
}

function resetTranslations(): void {
  if (documentController) void client.cancel(documentController.fingerprint).catch(() => undefined);
  pages.value.forEach(page => setPageState(page.pageIndex, {translations: {}, status: 'idle', error: undefined}));
  configureScheduler();
  void refreshLocalProviderAvailability().then(() => updateVisiblePage(visiblePageIndex.value));
}

watch([sourceLanguage, targetLanguage, providerId], () => {
  if (documentReady.value) resetTranslations();
});

onMounted(() => {
  void Promise.all([configReady, loadCachePreference()]).then(() => openPdf());
});
onBeforeUnmount(() => {
  intersectionObserver?.disconnect();
  scheduler?.dispose();
  documentReady.value = false;
  if (highlightedTimer) clearTimeout(highlightedTimer);
  if (documentController) {
    void client.cancel(documentController.fingerprint).catch(() => undefined);
    void documentController.destroy();
  }
});
</script>
