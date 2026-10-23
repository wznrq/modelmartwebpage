import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { localizePath } from '@/utils/routes'

export function Footer() {
  const { language, t } = useLanguage()

  const getCopyrightText = () => {
    switch (language) {
      case 'zh-CN':
        return '© 2026 ModelMart. 保留所有权利。'
      case 'zh-TW':
        return '© 2026 ModelMart. 保留所有權利。'
      case 'en':
        return '© 2026 ModelMart. All rights reserved.'
      default:
        return '© 2026 ModelMart. All rights reserved.'
    }
  }

  const getDisclaimerText = () => {
    switch (language) {
      case 'zh-CN':
        return '// 模型定价和性能数据仅供参考，实际价格以官方为准'
      case 'zh-TW':
        return '// 模型定價和性能數據僅供參考，實際價格以官方為準'
      case 'en':
        return '// Model pricing and performance data are for reference only'
      default:
        return '// Model pricing and performance data are for reference only'
    }
  }

  const getBuildInfo = () => {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    switch (language) {
      case 'zh-CN':
        return `// 构建时间: ${date} ${time}`
      case 'zh-TW':
        return `// 構建時間: ${date} ${time}`
      case 'en':
        return `// Build: ${date} ${time}`
      default:
        return `// Build: ${date} ${time}`
    }
  }

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-primary">{getCopyrightText()}</span>
            <span>{getDisclaimerText()}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
            <span>ModelMart v2.0</span>
            <span className="flex flex-wrap items-center gap-3">
              <Link to={localizePath('/business', language)} className="text-cyan-400 hover:text-primary transition-colors">
                {t('business.footerLink')}
              </Link>
              <span>{getBuildInfo()}</span>
            </span>
          </div>
        </div>

        {/* Decorative terminal-style decoration */}
        <div className="mt-4 font-mono text-xs text-primary/30">
          <span>{'['}</span>
          <span className="text-cyan-400/50">SYSTEM</span>
          <span>{']'}</span>
          <span className="ml-2 text-green-400/50">ALL_SYSTEMS_NOMINAL</span>
          <span className="ml-4">{']'}</span>
          <span className="text-yellow-400/50 ml-2">STATUS: ONLINE</span>
          <span>{'['}</span>
        </div>
      </div>
    </footer>
  )
}
