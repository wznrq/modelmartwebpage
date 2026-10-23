import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Code2, Terminal, Cpu, Network, Shield, Zap, Globe, Database, Binary, Sparkles } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { useLanguage } from '@/i18n/LanguageContext'
import { localizePath } from '@/utils/routes'

export function About() {
  const [matrixText, setMatrixText] = useState('')
  const [cursorVisible, setCursorVisible] = useState(true)
  const [stats, setStats] = useState({ models: 0, providers: 0, updates: 0 })
  const { t, language } = useLanguage()
  const fullText = `> ${t('about.init')} MODEL_MART v2.0...`

  // Typing animation effect
  useEffect(() => {
    let index = 0
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setMatrixText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(typingInterval)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [])

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  // Stats counter animation
  useEffect(() => {
    const targetStats = { models: 15, providers: 9, updates: 247 }
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let currentStep = 0
    const statsInterval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        models: Math.floor(targetStats.models * progress),
        providers: Math.floor(targetStats.providers * progress),
        updates: Math.floor(targetStats.updates * progress),
      })

      if (currentStep >= steps) {
        clearInterval(statsInterval)
        setStats(targetStats)
      }
    }, increment)

    return () => clearInterval(statsInterval)
  }, [])

  const techStack = [
    { icon: <Code2 className="h-8 w-8" />, name: 'React 18', desc: t('about.tech.react') },
    { icon: <Terminal className="h-8 w-8" />, name: 'TypeScript', desc: t('about.tech.typescript') },
    { icon: <Cpu className="h-8 w-8" />, name: 'Vite 6', desc: t('about.tech.vite') },
    { icon: <Network className="h-8 w-8" />, name: 'FastAPI', desc: t('about.tech.fastapi') },
    { icon: <Database className="h-8 w-8" />, name: 'PostgreSQL', desc: t('about.tech.postgresql') },
    { icon: <Zap className="h-8 w-8" />, name: 'Redis', desc: t('about.tech.redis') },
  ]

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('about.feature1'),
      desc: t('about.feature1Desc'),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('about.feature2'),
      desc: t('about.feature2Desc'),
    },
    {
      icon: <Binary className="h-6 w-6" />,
      title: t('about.feature3'),
      desc: t('about.feature3Desc'),
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: t('about.feature4'),
      desc: t('about.feature4Desc'),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-green-400 overflow-hidden">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        path="/about"
      />
      {/* Matrix-style background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
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

      {/* Hero Section - Terminal Style */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Terminal Window */}
          <div className="bg-card rounded-lg border-2 border-primary/30 shadow-xl shadow-primary/10 max-w-4xl mx-auto overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-secondary px-4 py-3 flex items-center space-x-2 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-muted-foreground font-mono">modelmart@system:~</span>
            </div>

            {/* Terminal Content */}
            <div className="p-8 font-mono text-sm md:text-base">
              <div className="mb-4">
                <span className="text-primary">{matrixText}</span>
                <span className={`text-primary ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>█</span>
              </div>

              <div className="space-y-2 text-foreground">
                <p>{`> ${t('about.status')}`}</p>
                <p>{`> ${t('about.mission')}`}</p>
                <p>{`> ${t('about.target')}`}</p>
                <p className="text-yellow-400">{`> ${t('about.warning')}`}</p>
                <p className="text-cyan-400">{`> ${t('about.future')}`}</p>
              </div>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mt-16">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse">
                MODEL_MART
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-mono">
              <span className="text-primary">&lt;</span>
              {t('about.subtitle')}
              <span className="text-primary">/&gt;</span>
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-primary mb-2 font-mono group-hover:text-cyan-400 transition-colors">
                {stats.models}+
              </div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider font-mono">{t('about.activeModels')}</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-cyan-400 mb-2 font-mono group-hover:text-primary transition-colors">
                {stats.providers}+
              </div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider font-mono">{t('about.providers')}</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-blue-400 mb-2 font-mono group-hover:text-purple-400 transition-colors">
                {stats.updates}+
              </div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider font-mono">{t('about.dailyUpdates')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-card/80 to-background border border-border rounded-xl p-8 md:p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground font-mono">
              <span className="text-primary">$</span> cat mission.txt
            </h2>
            <div className="space-y-4 text-foreground text-lg leading-relaxed font-mono">
              <p>
                <span className="text-cyan-400">{t('about.missionP1')}</span>
              </p>
              <p>
                <span className="text-primary">ModelMart</span> {t('about.missionP2')}
              </p>
              <p>
                {t('about.missionP3')}
              </p>
              <p className="text-primary text-xl font-bold mt-6">
                &gt; {t('about.missionConclusion')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground font-mono">
            <span className="text-cyan-400">&lt;</span> {t('about.techStack')} <span className="text-cyan-400">/&gt;</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 font-mono">{t('about.techBuilt')}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group bg-card/50 border border-border rounded-lg p-6 text-center hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-primary mb-3 flex justify-center group-hover:text-cyan-400 transition-colors">
                  {tech.icon}
                </div>
                <div className="text-foreground font-semibold mb-1 font-mono text-sm">{tech.name}</div>
                <div className="text-muted-foreground text-xs font-mono">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground font-mono">
            <span className="text-primary">#</span> {t('about.features')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 font-mono">{t('about.ourDifference')}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-card/50 to-background border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:text-cyan-400 group-hover:bg-cyan-400/10 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-mono group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Hacker Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/5 via-cyan-500/5 to-blue-500/5 border-2 border-primary/30 rounded-2xl p-12 backdrop-blur-sm">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-mono">
              <span className="text-primary">&gt;&gt;</span> {t('about.ready')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 font-mono">
              {t('about.ctaDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={localizePath('/models', language)}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors font-mono text-lg"
              >
                <Terminal className="mr-2 h-5 w-5" />
                {t('about.exploreModels')}
              </Link>
              <Link
                to={localizePath('/compare', language)}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-cyan-400 text-cyan-400 font-bold rounded-lg hover:bg-cyan-400/10 transition-colors font-mono text-lg"
              >
                <Code2 className="mr-2 h-5 w-5" />
                {t('about.compareNow')}
              </Link>
            </div>
          </div>

          {/* Footer signature */}
          <div className="mt-12 text-muted-foreground font-mono text-sm">
            <p>{`// ${t('about.madeBy')}`}</p>
            <p className="mt-2">{`// © 2026 ModelMart. ${t('about.allSystems')}`}</p>
            <p className="mt-2 text-primary/50">{`// ${t('about.statusBar')}`}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
