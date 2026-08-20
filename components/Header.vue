<template>
  <h1 class="title">{{ t('brand.productName') }} <span class="version">V{{version}}</span></h1>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const version = process.env.VUE_APP_VERSION
const { t } = useI18n({ useScope: 'global' })
</script>

<style scoped>
.title {
  font-size: 1.75em;
  margin: 0.5em 0;
  color: var(--fr-text-color-primary);
  font-weight: 600;
}

.version {
  font-size: 0.5em;
  opacity: 0.8;
}
</style>
