import {createApp} from 'vue';
import App from './App.vue';
import './style.css';
import {bindMercuryI18nLocale, createMercuryI18n} from '@/entrypoints/i18n/vue';

async function bootstrap() {
  const app = createApp(App);
  const i18n = await createMercuryI18n();
  const stopLocaleSync = bindMercuryI18nLocale(i18n);
  app.use(i18n);
  window.addEventListener('pagehide', stopLocaleSync, {once: true});
  app.mount('#app');
}

void bootstrap();
