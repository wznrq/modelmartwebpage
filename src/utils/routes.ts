import type { Language } from '@/i18n/translations'

export const BASE_URL = 'https://modelmart.ai'
export const DEFAULT_LANGUAGE: Language = 'zh-CN'
export const SEO_LANGUAGES: Language[] = ['zh-CN', 'zh-TW', 'en']

const languageSet = new Set<string>(SEO_LANGUAGES)

export function isSeoLanguage(value: string | undefined): value is Language {
  return Boolean(value && languageSet.has(value))
}

export function getLanguageFromPathname(pathname: string): Language | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isSeoLanguage(segment) ? segment : null
}

export function stripLanguageFromPathname(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  if (isSeoLanguage(parts[0])) {
    parts.shift()
  }

  return `/${parts.join('/')}`.replace(/\/$/, '') || '/'
}

export function localizePath(path: string, language: Language) {
  const [pathname, query = ''] = path.split('?')
  const cleanPath = stripLanguageFromPathname(pathname || '/')
  const localizedPath = language === DEFAULT_LANGUAGE
    ? `/zh-CN${cleanPath === '/' ? '' : cleanPath}`
    : `/${language}${cleanPath === '/' ? '' : cleanPath}`

  return `${localizedPath || `/${language}`}${query ? `?${query}` : ''}`
}

export function getModelPath(providerId: string, modelId: string) {
  return `/models/${providerId}/${encodeURIComponent(modelId)}`
}

export function getProviderPath(providerId: string) {
  return `/providers/${providerId}`
}

export function getCanonicalPath(basePath: string, language: Language) {
  return localizePath(basePath, language).split('?')[0]
}

export function getAbsoluteUrl(path: string) {
  return `${BASE_URL}${path === '/' ? '' : path}`
}
