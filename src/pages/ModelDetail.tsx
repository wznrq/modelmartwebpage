import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, ShieldCheck, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SEO } from '@/components/SEO'
import { models, providers } from '@/data/models'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatPrice } from '@/utils/formatPrice'
import { getModelDataTrust, getTrustScore } from '@/utils/modelDataTrust'
import { getAbsoluteUrl, getModelPath, getProviderPath, localizePath } from '@/utils/routes'
import {
  getProviderDescription,
  getProviderDisplayName,
  translateModelFeature,
  translateModelType,
} from '@/utils/modelTranslations'
import { NotFound } from './NotFound'

export function ModelDetail() {
  const { providerId = '', modelId = '' } = useParams()
  const decodedModelId = decodeURIComponent(modelId)
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()
  const model = models.find((item) => item.id === decodedModelId && item.providerId === providerId)
  const provider = providers.find((item) => item.id === providerId)

  if (!model || !provider) {
    return <NotFound />
  }

  const currency = language === 'en' ? '$' : '¥'
  const providerName = getProviderDisplayName(provider.id, provider.name, language)
  const dataTrust = getModelDataTrust(model)
  const modelPath = getModelPath(provider.id, model.id)
  const title = language === 'en'
    ? `${model.name} pricing, context and benchmarks`
    : `${model.name} 价格、上下文与性能数据`
  const description = language === 'en'
    ? `${model.name} by ${providerName}: input ${formatPrice(model.pricing.input, '$', exchangeRate)}, output ${formatPrice(model.pricing.output, '$', exchangeRate)}, ${(model.performance.contextWindow / 1000).toFixed(0)}K context.`
    : `${providerName} ${model.name} 模型详情：输入 ${formatPrice(model.pricing.input, '¥', exchangeRate)}，输出 ${formatPrice(model.pricing.output, '¥', exchangeRate)}，上下文 ${(model.performance.contextWindow / 1000).toFixed(0)}K。`
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: model.name,
      applicationCategory: 'AI model',
      operatingSystem: 'API',
      url: getAbsoluteUrl(modelPath),
      datePublished: model.releaseDate,
      publisher: {
        '@type': 'Organization',
        name: providerName,
        url: model.websiteUrl || getAbsoluteUrl(getProviderPath(provider.id)),
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CNY',
        price: model.pricing.input,
        description: 'Input price per 1M tokens; output price is listed on page.',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ModelMart', item: getAbsoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: providerName, item: getAbsoluteUrl(getProviderPath(provider.id)) },
        { '@type': 'ListItem', position: 3, name: model.name, item: getAbsoluteUrl(modelPath) },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO title={title} description={description} path={modelPath} schema={schema} />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)',
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={localizePath('/models', language)} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-primary font-mono mb-6">
          <ArrowLeft className="h-4 w-4" />
          {t('models.title')}
        </Link>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
          <div className="font-mono">
            <div className="flex items-center gap-3 mb-4">
              <img src={provider.logo} alt="" className="h-12 w-12 object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
              <div>
                <Link to={localizePath(getProviderPath(provider.id), language)} className="text-cyan-400 hover:text-primary text-sm">
                  {providerName}
                </Link>
                <p className="text-xs text-muted-foreground">{getProviderDescription(provider.id, provider.description, t)}</p>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              <span className="text-primary">&lt;</span>
              {model.name}
              <span className="text-primary">/&gt;</span>
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>

          <Card className="bg-card/80 border border-primary/30">
            <CardContent className="p-5 font-mono space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('models.type.chat')}</span>
                <span className="text-primary">{translateModelType(model.type, t)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('models.contextWindow')}</span>
                <span className="text-foreground">{(model.performance.contextWindow / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('models.accuracy')}</span>
                <span className="text-foreground">{model.performance.accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('models.lastVerified')}</span>
                <span className="text-cyan-400">{dataTrust.lastVerified}</span>
              </div>
              <a href={dataTrust.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2 font-mono mt-2">
                  {t('models.visitWebsite')}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </section>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Metric label={t('models.inputPrice')} value={formatPrice(model.pricing.input, currency, exchangeRate)} note="/ 1M tokens" />
          <Metric label={t('models.outputPrice')} value={formatPrice(model.pricing.output, currency, exchangeRate)} note="/ 1M tokens" />
          <Metric label={t('models.latency')} value={`${model.performance.latency}ms`} />
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <Card className="bg-card/70 border border-border">
            <CardContent className="p-5 font-mono">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t('models.features')}</h2>
              <div className="flex flex-wrap gap-2">
                {model.features.map((feature) => (
                  <span key={feature} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-sm">
                    {translateModelFeature(feature, t)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border border-border">
            <CardContent className="p-5 font-mono">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t('models.dataTrust')}</h2>
              <div className="flex items-center gap-2 text-primary mb-3">
                <ShieldCheck className="h-5 w-5" />
                {t(`models.trust.${dataTrust.level}`)} {getTrustScore(dataTrust.level)}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'en'
                  ? 'Prices are normalized to CNY per 1M tokens and converted in English mode.'
                  : '价格已归一为 CNY / 百万 token，英文模式自动折算美元。'}
              </p>
              <Link to={localizePath(`/business?provider=${provider.id}`, language)}>
                <Button className="w-full gap-2 font-mono">
                  <TrendingUp className="h-4 w-4" />
                  {t('models.consultProcurement')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/60 p-4 font-mono">
      <div className="text-xs text-muted-foreground mb-2">{label}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {note && <div className="text-[10px] text-muted-foreground mt-1">{note}</div>}
    </div>
  )
}
