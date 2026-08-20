<template>
  <div class="footer-container footer-size">
    <p class="translation-count">{{ t('footer.translationCount', { count: computedCount }) }}</p>
    <div class="footer-links">
      <el-link class="action-link left" :class="{ 'failed': cacheStatus === 'failed', 'success': cacheStatus === 'succeeded' }" @click="clearCache"
        :disabled="buttonDisabled">
        <el-icon v-if="showLoading">
          <Loading class="el-icon-loading" />
        </el-icon>
        {{ buttonText }}
      </el-link>
      <div class="right-links">
        <el-link class="action-link" href="https://github.com/Bistutu/FluentRead" target="_blank">
          <el-icon class="github-icon">
            <Star />
          </el-icon>
          {{ t('footer.upstream') }}
        </el-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Star, Loading } from "@element-plus/icons-vue";
import { Config } from "../entrypoints/utils/model";
import browser from 'webextension-polyfill';
import { config, configReady, subscribeConfig } from '@/entrypoints/utils/config';

// 实际上是 el-link 而不是 el-button
const buttonDisabled = ref(false);
const cacheStatus = ref<'idle' | 'clearing' | 'succeeded' | 'failed'>('idle');
const { t } = useI18n({ useScope: 'global' });
const buttonText = computed(() => ({
  idle: t('footer.clearCache'),
  clearing: t('footer.clearing'),
  succeeded: t('footer.clearSucceeded'),
  failed: t('footer.clearFailed'),
}[cacheStatus.value]));

const showLoading = ref(false);
async function clearCache() {
  try {
    buttonDisabled.value = true;
    cacheStatus.value = 'clearing';
    showLoading.value = true;

    // 获取当前标签页
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) {
      throw new Error('No active tab found');
    }

    // 发送消息到 content.js
    await browser.tabs.sendMessage(tabs[0].id, { message: 'clearCache' });

    // 显示成功状态
    cacheStatus.value = 'succeeded';

    // 恢复按钮状态
    setTimeout(() => {
      buttonDisabled.value = false;
      cacheStatus.value = 'idle';
      showLoading.value = false;
    }, 1500);

  } catch (error) {
    console.error('清除缓存失败:', error);
    cacheStatus.value = 'failed';

    // 恢复按钮状态
    setTimeout(() => {
      buttonDisabled.value = false;
      cacheStatus.value = 'idle';
      showLoading.value = false;
    }, 1500);
  }
}

// 只订阅统一配置状态，避免 Footer 再注册一套独立的存储读取和监听。
const localConfig = reactive(new Config());
void configReady.then(() => Object.assign(localConfig, config));
const unsubscribeConfig = subscribeConfig((nextConfig) => Object.assign(localConfig, nextConfig));
onUnmounted(unsubscribeConfig);

const computedCount = computed(() => localConfig.count);


</script>

<style scoped>
.footer-size {
  font-size: 0.8em;
}

.footer-container {
  background: var(--fr-bg-color);
  margin: -16px;
}

.translation-count {
  margin: 0px;
  font-size: 1.2em;
  color: var(--fr-text-color-regular);
  text-align: center;
}

.count-number {
  font-weight: 600;
  font-size: 1.1em;
  margin: 0 3px;
  color: var(--el-color-success);
}

.footer-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.right-links {
  display: flex;
  gap: 12px;
}

.action-link {
  font-size: 1.2em;
  transition: all 1s ease;
  text-decoration: none !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-link:hover {
  opacity: 0.8;
}

.action-link:active {
  transform: scale(0.98);
}

.github-icon {
  font-size: 1.2em;
  margin-right: 2px;
}

:deep(.el-icon-loading) {
  animation: rotating 1s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.clearing {
  color: var(--el-color-success) !important;
}

.failed {
  color: var(--el-color-danger) !important;
}

/* 添加成功状态样式 */
.action-link.success {
  color: var(--el-color-success) !important;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .footer-container {
    background: var(--fr-bg-color-darker);
  }
}
</style>
