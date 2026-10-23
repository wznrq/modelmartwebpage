import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, getTranslation, Translation } from './translations'
import { getLanguageFromPathname, localizePath } from '@/utils/routes'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const STORAGE_KEY = 'modelmart-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const pathLanguage = getLanguageFromPathname(window.location.pathname)
      if (pathLanguage) return pathLanguage

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ['zh-CN', 'zh-TW', 'en'].includes(stored)) {
        return stored as Language
      }
    }
    return 'zh-CN'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)

    if (typeof window !== 'undefined') {
      const nextPath = localizePath(`${window.location.pathname}${window.location.search}`, lang)
      if (nextPath !== `${window.location.pathname}${window.location.search}`) {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }
  }

  const t = getTranslation(language)

  useEffect(() => {
    const syncLanguageFromPath = () => {
      const pathLanguage = getLanguageFromPathname(window.location.pathname)
      if (pathLanguage) {
        setLanguageState(pathLanguage)
        localStorage.setItem(STORAGE_KEY, pathLanguage)
      }
    }

    syncLanguageFromPath()
    window.addEventListener('popstate', syncLanguageFromPath)

    return () => window.removeEventListener('popstate', syncLanguageFromPath)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
