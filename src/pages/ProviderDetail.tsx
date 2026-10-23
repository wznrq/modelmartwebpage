import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SEO } from '@/components/SEO'
import { models, providers } from '@/data/models'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatPrice } from '@/utils/formatPrice'
import { getAbsoluteUrl, getModelPath, getProviderPath, localizePath } from '@/utils/routes'
import {
  getProviderDescription,
  getProviderDisplayName,
  translateModelFeature,
  translateModelType,
} from '@/utils/modelTranslations'
import { NotFound } from './NotFound'

export function ProviderDetail() {
  const { providerId = '' } = useParams()
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()
  const provider = providers.find((item) => item.id === providerId)

  if (!provider) {
    return <NotFound />
  }

  const providerModels = models
    .filter((model) => model.providerId === provider.id)
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
  const providerName = getProviderDisplayName(provider.id, provider.name, language)
  const providerPath = getProviderPath(provider.id)
  const currency = language === 'en' ? '$' : '¥'
  const minInputPrice = Math.min(...providerModels.map((model) => model.pricing.input))
  const maxContext = Math.max(...providerModels.map((model) => model.performance.contextWindow))
  const title = language === 'en'
    ? `${providerName} AI models, pricing and benchmarks`
    : `${providerName} 大模型价格、性能与基准测试`
  const description = language === 'en'
    ? `${providerName} model catalog on ModelMart: ${providerModels.length} models, pricing from ${formatPrice(minInputPrice, '$', exchangeRate)}, max context ${(maxContext / 1000).toFixed(0)}K.`
    : `${providerName} 模型目录：收录 ${providerModels.length} 个模型，输入价格低至 ${formatPrice(minInputPrice, '¥', exchangeRate)}，最高上下文 ${(maxContext / 1000).toFixed(0)}K。`
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: providerName,
      url: getAbsoluteUrl(providerPath),
      logo: getAbsoluteUrl(provider.logo),
      description: getProviderDescription(provider.id, provider.description, t),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${providerName} models`,
      itemListElement: providerModels.slice(0, 20).map((model, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: model.name,
        url: getAbsoluteUrl(getModelPath(provider.id, model.id)),
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO title={title} description={description} path={providerPath} schema={schema} />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={localizePath('/models', language)} className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-primary font-mono mb-6">
          <ArrowLeft className="h-4 w-4" />
          {t('models.title')}
        </Link>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6 mb-8">
          <div className="font-mono">
            <div className="flex items-center gap-4 mb-5">
              <img src={provider.logo} alt="" className="h-14 w-14 object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
              <div>
                <div className="text-sm text-cyan-400">{provider.country === 'domestic' ? t('models.domestic') : t('models.international')}</div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground">{providerName}</h1>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>

          <Card className="bg-card/80 border border-primary/30">
            <CardContent className="p-5 font-mono space-y-4">
              <Metric label={t('models.total')} value={providerModels.length.toString()} />
              <Metric label={t('models.inputPrice')} value={formatPrice(minInputPrice, currency, exchangeRate)} />
              <Metric label={t('models.contextWindow')} value={`${(maxContext / 1000).toFixed(0)}K`} />
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground font-mono mb-5">
            <span className="text-primary">#</span> {providerName} {t('models.title')}
          </h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {providerModels.map((model) => (
              <Link key={model.id} to={localizePath(getModelPath(provider.id, model.id), language)}>
                <Card className="h-full bg-card/70 border border-border hover:border-primary/50 transition-all">
                  <CardContent className="p-5 font-mono">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{model.name}</h3>
                        <p className="text-xs text-muted-foreground">{translateModelType(model.type, t)} · {model.releaseDate}</p>
                      </div>
                      {model.websiteUrl && (
                        <a href={model.websiteUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="text-cyan-400 hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="rounded bg-secondary/60 border border-border p-2">
                        <div className="text-[10px] text-muted-foreground">{t('models.inputPrice')}</div>
                        <div className="text-primary">{formatPrice(model.pricing.input, currency, exchangeRate)}</div>
                      </div>
                      <div className="rounded bg-secondary/60 border border-border p-2">
                        <div className="text-[10px] text-muted-foreground">{t('models.contextWindow')}</div>
                        <div className="text-primary">{(model.performance.contextWindow / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                          {translateModelFeature(feature, t)}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={localizePath(`/models?provider=${provider.id}`, language)}>
            <Button variant="outline" className="font-mono">{t('models.viewDetails')}</Button>
          </Link>
          <Link to={localizePath(`/business?provider=${provider.id}`, language)}>
            <Button className="font-mono">{t('models.consultProcurement')}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-bold text-foreground">{value}</span>
    </div>
  )
}
