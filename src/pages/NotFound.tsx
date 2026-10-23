import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SEO } from '@/components/SEO'
import { useLanguage } from '@/i18n/LanguageContext'
import { localizePath, stripLanguageFromPathname } from '@/utils/routes'

export function NotFound() {
  const location = useLocation()
  const { t, language } = useLanguage()
  const path = stripLanguageFromPathname(location.pathname)

  return (
    <div className="min-h-screen bg-background text-green-400 pt-28 pb-20">
      <SEO
        title={language === 'en' ? 'Page not found' : '页面不存在'}
        description={language === 'en' ? 'The page you requested does not exist on ModelMart.' : '你访问的 ModelMart 页面不存在。'}
        path={path}
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 text-center font-mono">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          404
        </h1>
        <p className="text-muted-foreground mb-8">
          {language === 'en' ? 'This URL is not available. Try the model catalog or return home.' : '这个 URL 暂不可用，可以回到模型目录或首页继续浏览。'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={localizePath('/', language)}>
            <Button className="gap-2 font-mono">
              <ArrowLeft className="h-4 w-4" />
              {t('nav.home')}
            </Button>
          </Link>
          <Link to={localizePath('/models', language)}>
            <Button variant="outline" className="font-mono">
              {t('models.title')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
