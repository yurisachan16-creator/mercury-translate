import type { MessagePath } from '@/entrypoints/i18n/runtime'

export type NavigationItem = {
  id: string
  icon: string
  label: string
  description: string
  group: string
  heading: string
  summary: string
  kicker: string
  title: string
  detail: string
  searchDescription: string
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

type Translate = (key: MessagePath, values?: Record<string, unknown>) => string

const nav = (t: Translate, key: MessagePath) => t(key)

export function createNavigationGroups(t: Translate): NavigationGroup[] {
  return [
  {
    label: nav(t, 'nav.basicSettings'),
    items: [
      {
        id: 'settings-general', icon: '⌂', label: nav(t, 'nav.generalLabel'), description: nav(t, 'nav.generalDescription'), group: nav(t, 'nav.basicSettings'),
        heading: nav(t, 'nav.generalHeading'), summary: nav(t, 'nav.generalSummary'),
        kicker: nav(t, 'nav.generalKicker'), title: nav(t, 'nav.generalTitle'), detail: nav(t, 'nav.generalDetail'),
        searchDescription: nav(t, 'nav.generalSearch'),
      },
      {
        id: 'settings-services', icon: '译', label: nav(t, 'nav.servicesLabel'), description: nav(t, 'nav.servicesDescription'), group: nav(t, 'nav.basicSettings'),
        heading: nav(t, 'nav.servicesHeading'), summary: nav(t, 'nav.servicesSummary'),
        kicker: nav(t, 'nav.servicesKicker'), title: nav(t, 'nav.servicesTitle'), detail: nav(t, 'nav.servicesDetail'),
        searchDescription: nav(t, 'nav.servicesSearch'),
      },
    ],
  },
  {
    label: nav(t, 'nav.readingTools'),
    items: [
      {
        id: 'settings-shortcuts', icon: '⌘', label: nav(t, 'nav.shortcutsLabel'), description: nav(t, 'nav.shortcutsDescription'), group: nav(t, 'nav.readingTools'),
        heading: nav(t, 'nav.shortcutsHeading'), summary: nav(t, 'nav.shortcutsSummary'),
        kicker: nav(t, 'nav.shortcutsKicker'), title: nav(t, 'nav.shortcutsTitle'), detail: nav(t, 'nav.shortcutsDetail'),
        searchDescription: nav(t, 'nav.shortcutsSearch'),
      },
      {
        id: 'settings-image-translation', icon: '图', label: nav(t, 'nav.imageLabel'), description: nav(t, 'nav.imageDescription'), group: nav(t, 'nav.readingTools'),
        heading: nav(t, 'nav.imageHeading'), summary: nav(t, 'nav.imageSummary'),
        kicker: nav(t, 'nav.imageKicker'), title: nav(t, 'nav.imageTitle'), detail: nav(t, 'nav.imageDetail'),
        searchDescription: nav(t, 'nav.imageSearch'),
      },
      {
        id: 'settings-video', icon: 'CC', label: nav(t, 'nav.videoLabel'), description: nav(t, 'nav.videoDescription'), group: nav(t, 'nav.readingTools'),
        heading: nav(t, 'nav.videoHeading'), summary: nav(t, 'nav.videoSummary'),
        kicker: nav(t, 'nav.videoKicker'), title: nav(t, 'nav.videoTitle'), detail: nav(t, 'nav.videoDetail'),
        searchDescription: nav(t, 'nav.videoSearch'),
      },
    ],
  },
  {
    label: nav(t, 'nav.systemData'),
    items: [
      {
        id: 'settings-advanced', icon: '◇', label: nav(t, 'nav.advancedLabel'), description: nav(t, 'nav.advancedDescription'), group: nav(t, 'nav.systemData'),
        heading: nav(t, 'nav.advancedHeading'), summary: nav(t, 'nav.advancedSummary'),
        kicker: nav(t, 'nav.advancedKicker'), title: nav(t, 'nav.advancedTitle'), detail: nav(t, 'nav.advancedDetail'),
        searchDescription: nav(t, 'nav.advancedSearch'),
      },
      {
        id: 'settings-data', icon: '⇅', label: nav(t, 'nav.dataLabel'), description: nav(t, 'nav.dataDescription'), group: nav(t, 'nav.systemData'),
        heading: nav(t, 'nav.dataHeading'), summary: nav(t, 'nav.dataSummary'),
        kicker: nav(t, 'nav.dataKicker'), title: nav(t, 'nav.dataTitle'), detail: nav(t, 'nav.dataDetail'),
        searchDescription: nav(t, 'nav.dataSearch'),
      },
    ],
  },
  {
    label: nav(t, 'nav.aboutGroup'),
    items: [
      {
        id: 'settings-about', icon: 'i', label: nav(t, 'nav.aboutLabel'), description: nav(t, 'nav.aboutDescription'), group: nav(t, 'nav.aboutGroup'),
        heading: nav(t, 'nav.aboutHeading'), summary: nav(t, 'nav.aboutSummary'),
        kicker: nav(t, 'nav.aboutKicker'), title: nav(t, 'nav.aboutTitle'), detail: nav(t, 'nav.aboutDetail'),
        searchDescription: nav(t, 'nav.aboutSearch'),
      },
    ],
  },
  ]
}

export function createNavigationItems(t: Translate) {
  return createNavigationGroups(t).flatMap((group) => group.items)
}
