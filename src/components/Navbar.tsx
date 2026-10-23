import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Terminal, Globe, ChevronDown, Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'
import { useLanguage } from '@/i18n/LanguageContext'
import { languages, Language } from '@/i18n/translations'
import { localizePath, stripLanguageFromPathname } from '@/utils/routes'
import { useThemeStore } from '../stores/themeStore'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()
  const isDark = useThemeStore((state) => state.isDark)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/models', label: t('nav.models') },
    { path: '/codeplan', label: t('nav.codeplan') },
    { path: '/compare', label: t('nav.compare') },
    { path: '/calculator', label: t('nav.calculator') },
    { path: '/benchmarks', label: t('nav.benchmarks') },
    { path: '/about', label: t('nav.about') },
  ]
  const currentBasePath = stripLanguageFromPathname(location.pathname)
  const getLocalizedPath = (path: string) => localizePath(path, language)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl shadow-lg border-b border-primary/20'
          : 'bg-background/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getLocalizedPath('/')} className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center text-black font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow border border-green-400">
              <Terminal className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight font-mono text-foreground group-hover:text-primary transition-colors">ModelMart</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={getLocalizedPath(link.path)}
                className={`text-sm font-medium transition-colors hover:text-primary font-mono ${
                  currentBasePath === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary/30"
              >
                <Globe className="h-4 w-4" />
                <span>{languages[language].nativeName}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg overflow-hidden min-w-[140px] shadow-xl">
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang)
                        setIsLangMenuOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left font-mono text-sm flex items-center justify-between hover:bg-accent transition-colors ${
                        language === lang ? 'text-primary bg-accent' : 'text-foreground'
                      }`}
                    >
                      <span>{languages[lang].nativeName}</span>
                      {language === lang && <span className="text-primary">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary hover:bg-accent"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={getLocalizedPath(link.path)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors font-mono ${
                  currentBasePath === link.path
                    ? 'bg-accent text-primary border border-primary/30'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Language switcher in mobile */}
            <div className="border-t border-border/50 pt-3 mt-3">
              <p className="px-4 py-2 text-xs text-muted-foreground font-mono">语言 / Language</p>
              <div className="flex gap-2 px-4">
                {(Object.keys(languages) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                      language === lang
                        ? 'bg-accent text-primary border border-primary/40'
                        : 'text-muted-foreground border border-transparent hover:text-foreground'
                    }`}
                  >
                    {languages[lang].nativeName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
