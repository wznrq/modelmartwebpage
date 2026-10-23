import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Globe, TrendingUp, Terminal, Cpu, Database, Bell, ChevronLeft, ChevronRight, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { providers } from '@/data/models'
import { useState, useEffect, useCallback } from 'react'
import { SEO } from '@/components/SEO'
import { useLanguage } from '@/i18n/LanguageContext'
import { getProviderPath, localizePath } from '@/utils/routes'

// 最新优惠新闻数据
const getNewsItems = (lang: string) => [
  {
    id: 1,
    provider: 'OpenAI',
    title: lang === 'en' ? 'GPT-5.4 Series Released' : 'GPT-5.4 系列正式发布',
    description: lang === 'en' ? 'New flagship model, from $2.5/M input, 1M context' : '全新旗舰模型发布，输入低至 $2.5/M，1M 上下文窗口',
    tag: 'new',
    tagColor: 'bg-green-500',
    link: '/models?provider=openai',
  },
  {
    id: 2,
    provider: 'DeepSeek',
    title: lang === 'en' ? 'DeepSeek V4 Preview Released' : 'DeepSeek V4 Preview 发布',
    description: lang === 'en' ? '1M context, Flash from $0.14/M input, Pro 75% off' : '1M 上下文，Flash 输入 $0.14/M 起，Pro 限时 75 折',
    tag: 'sale',
    tagColor: 'bg-cyan-500',
    link: '/models?provider=deepseek',
  },
  {
    id: 3,
    provider: 'Google',
    title: lang === 'en' ? 'Gemini 3 Flash Preview Released' : 'Gemini 3 Flash Preview 发布',
    description: lang === 'en' ? 'Frontier model built for speed, from $0.5/M input' : '面向速度与前沿智能，输入 $0.5/M 起',
    tag: 'promo',
    tagColor: 'bg-yellow-500',
    link: '/models?provider=google',
  },
  {
    id: 4,
    provider: 'Anthropic',
    title: lang === 'en' ? 'Claude 4.7 Supports 1M Context' : 'Claude 4.7 支持 1M 上下文',
    description: lang === 'en' ? 'New 1M token context support, free upgrade' : '新增百万 token 上下文支持，限时免费升级',
    tag: 'upgrade',
    tagColor: 'bg-purple-500',
    link: '/models?provider=anthropic',
  },
  {
    id: 5,
    provider: 'MiniMax',
    title: lang === 'en' ? 'MiniMax M2.7 Now Available' : 'MiniMax M2.7 正式上线',
    description: lang === 'en' ? '200K context, first month 50% off' : '200K 上下文高性能模型，首月 5 折优惠',
    tag: 'new',
    tagColor: 'bg-green-500',
    link: '/models?provider=minimax',
  },
  {
    id: 6,
    provider: 'Moonshot',
    title: lang === 'en' ? 'Kimi K2.6 Released' : 'Kimi K2.6 重磅发布',
    description: lang === 'en' ? '262K context, math reasoning improved 40%' : '262K 超长上下文，数学推理能力提升 40%',
    tag: 'new',
    tagColor: 'bg-green-500',
    link: '/models?provider=moonshot',
  },
  {
    id: 7,
    provider: lang === 'en' ? 'Alibaba' : '阿里',
    title: lang === 'en' ? 'Qwen3 Open Source Free' : 'Qwen3 开源免费商用',
    description: lang === 'en' ? '72B parameter open source, free commercial license' : '72B 参数开源模型，完全免费商用许可',
    tag: 'free',
    tagColor: 'bg-blue-500',
    link: '/models?provider=alibaba',
  },
  {
    id: 8,
    provider: lang === 'en' ? 'Zhipu' : '智谱',
    title: lang === 'en' ? 'GLM-5 Released, 200K Context' : 'GLM-5 发布，200K 上下文',
    description: lang === 'en' ? 'Domestic flagship, code能力大幅提升' : '国产旗舰模型，代码能力大幅提升',
    tag: 'new',
    tagColor: 'bg-green-500',
    link: '/models?provider=zhipu',
  },
]

export function Home() {
  const [glitchText, setGlitchText] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)
  const { t, language } = useLanguage()
  const fullText = t('home.exploreModels')
  const newsItems = getNewsItems(language)

  const newsPerPage = 3
  const totalPages = Math.ceil(newsItems.length / newsPerPage)

  const nextNews = useCallback(() => {
    setCurrentNewsIndex((prev) => (prev + 1) % totalPages)
  }, [totalPages])

  const prevNews = useCallback(() => {
    setCurrentNewsIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }, [totalPages])

  useEffect(() => {
    const interval = setInterval(nextNews, 5000)
    return () => clearInterval(interval)
  }, [nextNews])

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchText(true)
      setTimeout(() => setGlitchText(false), 200)
    }, 3000)

    return () => clearInterval(glitchInterval)
  }, [])

  useEffect(() => {
    let index = 0
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 80)

    return () => clearInterval(typingInterval)
  }, [fullText])

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('home.feature1Title'),
      description: t('home.feature1Desc'),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('home.feature2Title'),
      description: t('home.feature2Desc'),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('home.feature3Title'),
      description: t('home.feature3Desc'),
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('home.feature4Title'),
      description: t('home.feature4Desc'),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-green-400 overflow-hidden">
      <SEO
        title={t('home.seoTitle')}
        description={t('home.seoDesc')}
        path="/"
      />
      {/* Matrix background effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`,
        }} />
      </div>

      {/* News Ticker Section */}
      <section className="pt-16 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-blue-500/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg shrink-0">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono font-bold text-primary">{t('news.title')}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-3 gap-4">
                {newsItems.slice(currentNewsIndex * newsPerPage, currentNewsIndex * newsPerPage + newsPerPage).map((news) => (
                  <Link key={news.id} to={localizePath(news.link, language)} className="min-w-0">
                    <div className="bg-card/80 rounded-lg p-3 border border-border hover:border-primary/50 transition-all group h-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded text-white font-mono ${news.tagColor}`}>
                          {t(`news.tag.${news.tag}`)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{news.provider}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground font-mono group-hover:text-primary transition-colors truncate">
                        {news.title}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono truncate">{news.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={prevNews}
                className="p-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground font-mono w-12 text-center">
                {currentNewsIndex + 1}/{totalPages}
              </span>
              <button
                onClick={nextNews}
                className="p-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="mb-6 font-mono text-sm text-cyan-400">
                <span className="text-green-400">$</span> {t('home.initScript')}
              </div>

              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 font-mono transition-all ${
                glitchText ? 'text-red-400 translate-x-1' : 'text-foreground'
              }`}>
                {typedText}
                <span className="animate-pulse text-green-400">█</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg font-mono">
                <span className="text-cyan-400">&lt;</span>
                {t('home.subtitle')}
                <span className="text-cyan-400">/&gt;</span>
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <Link to={localizePath('/models', language)}>
                  <Button variant="premium" size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-black font-mono font-bold border-2 border-green-400">
                    <Terminal className="mr-2 h-5 w-5" />
                    {t('home.browseModels')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to={localizePath('/compare', language)}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono font-bold">
                    <Cpu className="mr-2 h-5 w-5" />
                    {t('home.compareAnalysis')}
                  </Button>
                </Link>
                <Link to={localizePath('/calculator', language)}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-primary/70 text-primary hover:bg-primary/10 font-mono font-bold">
                    <Calculator className="mr-2 h-5 w-5" />
                    {t('nav.calculator')}
                  </Button>
                </Link>
                <Link to={localizePath('/business', language)}>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-yellow-400/70 text-yellow-400 hover:bg-yellow-400/10 font-mono font-bold">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    {t('business.navCta')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-in hidden lg:block">
              <div className="bg-card rounded-lg border-2 border-primary/30 p-6 shadow-xl shadow-primary/10">
                <div className="flex items-center space-x-2 mb-4 border-b border-border pb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs text-muted-foreground font-mono">model_stats.exe</span>
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <p className="text-primary">{`> ${t('home.loading')}`}</p>
                  <p className="text-cyan-400">{`> ${t('home.connected', { count: providers.length })}`}</p>
                  <p className="text-cyan-400">{`> ${t('home.indexed', { count: providers.length * 2 })}`}</p>
                  <p className="text-yellow-400">{`> ${t('home.status')}`}</p>
                  <p className="text-primary mt-4">{`> ${t('home.readyQuery')}`}</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-lg border-2 border-cyan-400/30">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">{t('home.indexedModels')}</p>
                    <p className="text-2xl font-bold text-cyan-400 font-mono">{providers.length * 2}+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Providers Section */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
              <span className="text-primary">#</span> {t('home.providersTitle')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-mono">
              <span className="text-cyan-400">&gt;&gt;</span> {t('home.providersSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <Link key={provider.id} to={localizePath(getProviderPath(provider.id), language)}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group bg-card/50 border-border hover:border-primary/50 h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className="mb-3 group-hover:scale-110 transition-transform flex justify-center">
                      <img src={provider.logo} alt="" className="w-12 h-12 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                    </div>
                    <h3 className="font-semibold mb-1 text-foreground font-mono group-hover:text-primary transition-colors">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{t(`provider.${provider.id}.desc`)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">
              <span className="text-cyan-400">&lt;</span> {t('home.whyChoose')} <span className="text-cyan-400">/&gt;</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-mono">
              <span className="text-primary">$</span> {t('home.missionStatement')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground font-mono">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-blue-500/5 border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-mono text-foreground">
            <span className="text-primary">&gt;&gt;</span> {t('home.ready')}
          </h2>
          <p className="text-lg mb-8 text-muted-foreground font-mono">
            {t('home.readyDesc')}
          </p>
          <Link to={localizePath('/models', language)}>
            <Button
              variant="secondary"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold border-2 border-primary"
            >
              <Terminal className="mr-2 h-5 w-5" />
              {t('home.freeStart')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
