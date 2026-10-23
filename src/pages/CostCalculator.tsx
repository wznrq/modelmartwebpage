import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bell, Calculator, Check, Database, SlidersHorizontal, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SEO } from '@/components/SEO'
import { models, providers } from '@/data/models'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { useLanguage } from '@/i18n/LanguageContext'
import { useAlertStore } from '@/stores/alertStore'
import { getCurrencySymbol } from '@/utils/formatPrice'
import { getProviderDisplayName } from '@/utils/modelTranslations'
import { localizePath } from '@/utils/routes'

type Scenario = 'balanced' | 'cost' | 'quality' | 'longContext' | 'coding'

const scenarioWeights: Record<Scenario, {
  accuracy: number
  cost: number
  context: number
  latency: number
  coding: number
}> = {
  balanced: { accuracy: 0.4, cost: 0.3, context: 0.2, latency: 0.1, coding: 0 },
  cost: { accuracy: 0.2, cost: 0.65, context: 0.1, latency: 0.05, coding: 0 },
  quality: { accuracy: 0.65, cost: 0.1, context: 0.15, latency: 0.1, coding: 0 },
  longContext: { accuracy: 0.25, cost: 0.15, context: 0.55, latency: 0.05, coding: 0 },
  coding: { accuracy: 0.3, cost: 0.2, context: 0.1, latency: 0.1, coding: 0.3 },
}

const commercialModelTypes = new Set(['chat', 'code', 'multimodal'])

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function formatAmount(priceInCNY: number, currency: '¥' | '$', exchangeRate: number) {
  const amount = currency === '$' ? priceInCNY / exchangeRate : priceInCNY
  const digits = amount >= 100 ? 0 : 2

  return `${currency}${amount.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function CostCalculator() {
  const [scenario, setScenario] = useState<Scenario>('balanced')
  const [monthlyRequests, setMonthlyRequests] = useState(50000)
  const [inputTokens, setInputTokens] = useState(1200)
  const [outputTokens, setOutputTokens] = useState(600)
  const [reusableInputRatio, setReusableInputRatio] = useState(0)
  const [minContextK, setMinContextK] = useState(32)
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()
  const currency = getCurrencySymbol(language)
  const { subscribeModel, isSubscribed } = useAlertStore()

  const recommendations = useMemo(() => {
    const effectiveInputTokens = inputTokens * (1 - reusableInputRatio / 100)
    const candidates = models
      .filter((model) => commercialModelTypes.has(model.type))
      .filter((model) => model.performance.contextWindow >= minContextK * 1000)
      .map((model) => {
        const monthlyCostCny =
          monthlyRequests *
          ((effectiveInputTokens * model.pricing.input + outputTokens * model.pricing.output) / 1_000_000)
        const provider = providers.find((item) => item.id === model.providerId)

        return {
          model,
          provider,
          monthlyCostCny,
        }
      })

    const minCost = Math.max(Math.min(...candidates.map((item) => item.monthlyCostCny)), 0.01)
    const maxContext = Math.max(...candidates.map((item) => item.model.performance.contextWindow), 1)
    const maxLatency = Math.max(...candidates.map((item) => item.model.performance.latency), 1)
    const weights = scenarioWeights[scenario]

    return candidates
      .map((item) => {
        const accuracyScore = item.model.performance.accuracy
        const costScore = clampNumber((minCost / Math.max(item.monthlyCostCny, 0.01)) * 100, 0, 100)
        const contextScore = clampNumber((item.model.performance.contextWindow / maxContext) * 100, 0, 100)
        const latencyScore = clampNumber((1 - item.model.performance.latency / maxLatency) * 100, 0, 100)
        const codingScore =
          item.model.type === 'code' ||
          item.model.features.some((feature) => feature.includes('代码') || feature.toLowerCase().includes('code'))
            ? 100
            : 65
        const score =
          accuracyScore * weights.accuracy +
          costScore * weights.cost +
          contextScore * weights.context +
          latencyScore * weights.latency +
          codingScore * weights.coding

        return {
          ...item,
          score,
          unitCostCny: item.monthlyCostCny / Math.max(monthlyRequests, 1),
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [inputTokens, minContextK, monthlyRequests, outputTokens, reusableInputRatio, scenario])

  const best = recommendations[0]
  const totalCost = recommendations.reduce((sum, item) => sum + item.monthlyCostCny, 0)
  const averageCost = recommendations.length ? totalCost / recommendations.length : 0
  const potentialSaving = best ? Math.max(averageCost - best.monthlyCostCny, 0) : 0

  const setNumberValue = (setter: (value: number) => void, min: number, max: number) => {
    return (value: string) => {
      const next = Number(value)
      setter(Number.isFinite(next) ? clampNumber(next, min, max) : min)
    }
  }

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO
        title={t('calculator.seoTitle')}
        description={t('calculator.seoDesc')}
        path="/calculator"
      />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 font-mono">
          <div className="text-sm text-cyan-400 mb-2">
            <span className="text-green-400">$</span> modelmart tco --recommend
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            <span className="text-green-400">&lt;</span> {t('calculator.title')} <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            <span className="text-cyan-400">→</span> {t('calculator.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <Card className="bg-card/80 border border-border h-fit">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-2 text-foreground font-mono font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                {t('calculator.workload')}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground font-mono mb-2">{t('calculator.scenario')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['balanced', 'cost', 'quality', 'longContext', 'coding'] as Scenario[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setScenario(item)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                        scenario === item
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`calculator.scenario.${item}`)}
                    </button>
                  ))}
                </div>
              </div>

              {[
                {
                  label: t('calculator.monthlyRequests'),
                  value: monthlyRequests,
                  min: 1000,
                  max: 10000000,
                  setter: setMonthlyRequests,
                },
                {
                  label: t('calculator.inputTokens'),
                  value: inputTokens,
                  min: 1,
                  max: 1000000,
                  setter: setInputTokens,
                },
                {
                  label: t('calculator.outputTokens'),
                  value: outputTokens,
                  min: 1,
                  max: 1000000,
                  setter: setOutputTokens,
                },
                {
                  label: t('calculator.reusableInput'),
                  value: reusableInputRatio,
                  min: 0,
                  max: 95,
                  setter: setReusableInputRatio,
                },
                {
                  label: t('calculator.minContext'),
                  value: minContextK,
                  min: 4,
                  max: 1024,
                  setter: setMinContextK,
                },
              ].map((item) => (
                <div key={item.label}>
                  <label className="block text-xs text-muted-foreground font-mono mb-2">{item.label}</label>
                  <input
                    type="number"
                    value={item.value}
                    min={item.min}
                    max={item.max}
                    onChange={(event) => setNumberValue(item.setter, item.min, item.max)(event.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/60"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-secondary/60 border border-border rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calculator className="h-3.5 w-3.5" />
                  {t('calculator.bestMonthlyCost')}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {best ? formatAmount(best.monthlyCostCny, currency, exchangeRate) : '-'}
                </div>
              </div>
              <div className="bg-secondary/60 border border-border rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {t('calculator.estimatedSaving')}
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatAmount(potentialSaving, currency, exchangeRate)}
                </div>
              </div>
              <div className="bg-secondary/60 border border-border rounded-lg p-4 font-mono">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Database className="h-3.5 w-3.5" />
                  {t('calculator.candidates')}
                </div>
                <div className="text-2xl font-bold text-foreground">{recommendations.length}</div>
              </div>
            </div>

            <Card className="bg-card/80 border border-border">
              <CardContent className="p-0">
                <div className="border-b border-border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground font-mono">{t('calculator.recommendations')}</h2>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{t('calculator.recommendationsDesc')}</p>
                    </div>
                    <Link to={localizePath('/business?intent=tco', language)}>
                      <Button variant="outline" size="sm" className="gap-1 font-mono">
                        {t('calculator.businessCta')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-border/60">
                  {recommendations.map((item, index) => {
                    const subscribed = isSubscribed(item.model.id)
                    const providerName = getProviderDisplayName(
                      item.model.providerId,
                      item.provider?.name || item.model.providerId,
                      language,
                    )

                    return (
                      <div key={item.model.id} className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/10 text-primary flex items-center justify-center font-mono text-sm">
                              {index + 1}
                            </div>
                            <img
                              src={item.provider?.logo}
                              alt=""
                              className="w-8 h-8 object-contain"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none'
                              }}
                            />
                            <div>
                              <div className="text-foreground font-mono font-semibold">{item.model.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{providerName}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:min-w-[520px]">
                            <Metric label={t('calculator.monthlyCost')} value={formatAmount(item.monthlyCostCny, currency, exchangeRate)} />
                            <Metric label={t('calculator.unitCost')} value={formatAmount(item.unitCostCny * 1000, currency, exchangeRate)} />
                            <Metric label={t('calculator.context')} value={`${Math.round(item.model.performance.contextWindow / 1000)}K`} />
                            <Metric label={t('calculator.score')} value={item.score.toFixed(1)} />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                          <span className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                            {t('calculator.accuracy')}: {item.model.performance.accuracy}%
                          </span>
                          <span className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                            {t('calculator.latency')}: {item.model.performance.latency}ms
                          </span>
                          <Button
                            size="sm"
                            variant={subscribed ? 'secondary' : 'outline'}
                            onClick={() => subscribeModel(item.model.id, item.model.providerId)}
                            className="ml-auto gap-1 font-mono"
                            disabled={subscribed}
                          >
                            {subscribed ? <Check className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                            {subscribed ? t('calculator.alertSubscribed') : t('calculator.subscribeAlert')}
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  {recommendations.length === 0 && (
                    <div className="p-10 text-center font-mono text-muted-foreground">
                      {t('calculator.noCandidates')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/60 border border-border p-3 font-mono">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}
