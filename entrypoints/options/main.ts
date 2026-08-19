import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'element-plus/dist/index.css'
import { bindMercuryI18nLocale, createMercuryI18n } from '@/entrypoints/i18n/vue'
import {
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElCol,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElLink,
  ElOption,
  ElOptionGroup,
  ElRow,
  ElSelect,
  ElSwitch,
  ElText,
  ElTooltip,
} from 'element-plus'
import {
  InfoFilled,
  CircleCheckFilled,
  Download,
  Edit,
  Loading,
  Refresh,
  Setting,
  Star,
  Upload,
  Warning,
  WarningFilled,
} from '@element-plus/icons-vue'

async function bootstrap() {
  const app = createApp(App)
  const i18n = await createMercuryI18n()
  const stopLocaleSync = bindMercuryI18nLocale(i18n)
  app.use(i18n)
  window.addEventListener('pagehide', stopLocaleSync, { once: true })

const components = [
  ElButton,
  ElCollapse,
  ElCollapseItem,
  ElCol,
  ElDialog,
  ElDivider,
  ElEmpty,
  ElIcon,
  ElInput,
  ElInputNumber,
  ElLink,
  ElOption,
  ElOptionGroup,
  ElRow,
  ElSelect,
  ElSwitch,
  ElText,
  ElTooltip,
]

  components.forEach((component) => component.name && app.component(component.name, component))
  app.component('InfoFilled', InfoFilled)
  app.component('CircleCheckFilled', CircleCheckFilled)
  app.component('Download', Download)
  app.component('Edit', Edit)
  app.component('Loading', Loading)
  app.component('Refresh', Refresh)
  app.component('Setting', Setting)
  app.component('Star', Star)
  app.component('Upload', Upload)
  app.component('Warning', Warning)
  app.component('WarningFilled', WarningFilled)

  app.mount('#app')
}

void bootstrap()
