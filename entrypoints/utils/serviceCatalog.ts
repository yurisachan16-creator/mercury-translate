import { customModelString, resolveConfiguredModel, servicesType } from '@/entrypoints/utils/option'
import type { MessagePath } from '@/entrypoints/i18n/messages'

export interface ServiceOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface ServiceGroup {
  id: string
  label: string
  items: ServiceOption[]
}

export function cleanServiceLabel(label: string) {
  return label.replace(/[⭐️★]+/gu, '').trim()
}

export function buildServiceGroups(options: ServiceOption[]): ServiceGroup[] {
  const groups: ServiceGroup[] = []
  let current: ServiceGroup = { id: 'other', label: '其他服务', items: [] }

  for (const option of options) {
    if (option.disabled) {
      if (current.items.length) groups.push(current)
      current = {
        id: option.value,
        label: cleanServiceLabel(option.label),
        items: [],
      }
      continue
    }
    current.items.push({ ...option, label: cleanServiceLabel(option.label) })
  }

  if (current.items.length) groups.push(current)
  return groups
}

export function filterServiceGroups(groups: ServiceGroup[], query: string) {
  const keyword = query.trim().toLocaleLowerCase()
  if (!keyword) return groups

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label}${item.value}${item.description || ''}`.toLocaleLowerCase().includes(keyword),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function filterModels(modelOptions: string[], query: string) {
  const keyword = query.trim().toLocaleLowerCase()
  if (!keyword) return modelOptions
  return modelOptions.filter((model) => model.toLocaleLowerCase().includes(keyword))
}

export function getSelectedModelLabel(
  service: string,
  selectedModels: Record<string, string>,
  customModels: Record<string, string>,
  translate?: (path: MessagePath) => string,
) {
  if (!servicesType.isUseModel(service)) return ''

  const selectedModel = selectedModels[service]
  const configuredModel = resolveConfiguredModel(selectedModel, customModels[service])
  if (configuredModel) return configuredModel
  if (selectedModel === customModelString) return translate ? translate('serviceConfig.customModel') : customModelString
  return translate ? translate('serviceCatalog.noModelSelected') : '未选择模型'
}

export function splitModelOptions(modelOptions: string[], selectedModel = '', visibleCount = 4) {
  // 自定义模型是一个输入入口，不应因为当前选中而被提到常用模型区。
  // 即使调用方传入的列表顺序不稳定，也要保证它在完整列表的最后。
  const regularModels = modelOptions.filter((model) => model !== customModelString)
  const customModels = modelOptions.filter((model) => model === customModelString)
  const orderedModels = [...regularModels, ...customModels]
  const common = orderedModels.slice(0, visibleCount)

  if (
    selectedModel
    && selectedModel !== customModelString
    && orderedModels.includes(selectedModel)
    && !common.includes(selectedModel)
  ) {
    common.splice(Math.max(visibleCount - 1, 0), 1, selectedModel)
  }

  return {
    common,
    more: orderedModels.filter((model) => !common.includes(model)),
  }
}
