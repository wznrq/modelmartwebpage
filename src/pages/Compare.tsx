import { useState } from 'react'
import { Plus, X, Check, Terminal, Cpu, Code2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { models, providers } from '@/data/models'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/i18n/LanguageContext'
import { SEO } from '@/components/SEO'
import { formatPrice } from '@/utils/formatPrice'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { getProviderDisplayName, translateModelFeature } from '@/utils/modelTranslations'
import { localizePath } from '@/utils/routes'

type CompareMode = 'models' | 'codeplan'

const USD_TO_CNY = 7.2

// CodePlan data
const codeplans = [
  { provider: 'zhipu', name: '智谱 GLM Lite', price: 49, badge: '入门级', limit: '80次/5小时', category: '国内' },
  { provider: 'zhipu', name: '智谱 GLM Pro', price: 149, badge: '专业级', limit: '400次/5小时', category: '国内' },
  { provider: 'zhipu', name: '智谱 GLM Max', price: 469, badge: '旗舰级', limit: '1600次/5小时', category: '国内' },
  { provider: 'minimax', name: 'MiniMax Starter', price: 29, badge: '性价比', limit: '40次/月', category: '国内' },
  { provider: 'minimax', name: 'MiniMax Plus', price: 49, badge: '进阶', limit: '100次/月', category: '国内' },
  { provider: 'minimax', name: 'MiniMax Max', price: 119, badge: '高额度', limit: '300次/月', category: '国内' },
  { provider: 'minimax', name: 'MiniMax Ultra', price: 899, badge: '顶配', limit: '2000次/月', category: '国内' },
  { provider: 'moonshot', name: 'Kimi Andante', price: 49, badge: 'UI开发首选', limit: '1x额度', category: '国内' },
  { provider: 'moonshot', name: 'Kimi Moderato', price: 99, badge: '进阶', limit: '4x额度', category: '国内' },
  { provider: 'moonshot', name: 'Kimi Allegretto', price: 199, badge: '高级', limit: '20x额度', category: '国内' },
  { provider: 'moonshot', name: 'Kimi Allegro', price: 699, badge: '旗舰', limit: '60x额度', category: '国内' },
  { provider: 'alibaba', name: '阿里百炼 Pro', price: 200, badge: '多模型聚合', limit: '8大模型可选', category: '国内' },
  { provider: 'tencent', name: '腾讯云 Coding', price: 40, badge: '企业生态', limit: '混元系列', category: '国内' },
  { provider: 'openai', name: 'Codex Go', price: Math.round(8 * USD_TO_CNY), badge: '入门', limit: 'GPT-4o', category: '国际' },
  { provider: 'openai', name: 'Codex Plus', price: Math.round(20 * USD_TO_CNY), badge: '热门', limit: 'GPT-4o', category: '国际' },
  { provider: 'openai', name: 'Codex Pro', price: Math.round(200 * USD_TO_CNY), badge: '旗舰', limit: 'GPT-4o+o1', category: '国际' },
  { provider: 'google', name: 'Gemini Free', price: 0, badge: '免费', limit: '1000请求/天', category: '国际' },
  { provider: 'google', name: 'Gemini Pro', price: Math.round(20 * USD_TO_CNY), badge: '进阶', limit: '1500请求/天', category: '国际' },
  { provider: 'google', name: 'Gemini Ultra', price: Math.round(200 * USD_TO_CNY), badge: '旗舰', limit: '2000请求/天', category: '国际' },
  { provider: 'anthropic', name: 'Claude Code Pro', price: Math.round(20 * USD_TO_CNY), badge: '专业', limit: 'Claude 3.5', category: '国际' },
  { provider: 'anthropic', name: 'Claude Max 5x', price: Math.round(100 * USD_TO_CNY), badge: '高级', limit: '5倍倍率', category: '国际' },
  { provider: 'anthropic', name: 'Claude Max 20x', price: Math.round(200 * USD_TO_CNY), badge: '旗舰', limit: '20倍倍率', category: '国际' },
]

const providerLogos: Record<string, string> = {
  zhipu: '/logos/zhipu.svg',
  minimax: '/logos/minimax.svg',
  moonshot: '/logos/moonshot.svg',
  alibaba: '/logos/alibaba.svg',
  tencent: '/logos/tencent.svg',
  openai: '/logos/openai.svg',
  google: '/logos/google.svg',
  anthropic: '/logos/anthropic.svg',
}

export function Compare() {
  const [compareMode, setCompareMode] = useState<CompareMode>('models')
  const [selectedModels, setSelectedModels] = useState<string[]>(['qwen3-max-2026-01-23', 'deepseek-v4-flash', 'glm-5'])
  const [selectedPlans, setSelectedPlans] = useState<number[]>([0, 1, 2])
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()

  const selectedModelData = models.filter((m) => selectedModels.includes(m.id))
  const selectedPlanData = codeplans.filter((_, i) => selectedPlans.includes(i))

  // Translate Compare plan text helper
  const translateCompareText = (text: string) => {
    const textMap: Record<string, string> = {
      // Badges
      '入门级': 'codeplan.badge.entry',
      '专业级': 'codeplan.badge.professional',
      '旗舰级': 'codeplan.badge.flagship',
      '性价比': 'codeplan.badge.valueKing',
      '进阶': 'codeplan.badge.advanced',
      '高额度': 'codeplan.badge.highQuota',
      '顶配': 'codeplan.badge.top',
      'UI开发首选': 'codeplan.badge.uiDevFirst',
      '高级': 'codeplan.badge.senior',
      '旗舰': 'codeplan.badge.flag',
      '多模型聚合': 'codeplan.badge.multiModel',
      '企业生态': 'codeplan.badge.enterprise',
      '入门': 'codeplan.badge.entry2',
      '热门': 'codeplan.badge.popular',
      '免费': 'codeplan.badge.free',
      '专业': 'codeplan.badge.professional2',
      // Limits
      '80次/5小时': 'codeplan.feature.glm515',
      '400次/5小时': 'codeplan.feature.glm5400',
      '1600次/5小时': 'codeplan.feature.glm51600',
      '40次/月': 'codeplan.feature.prompts40',
      '100次/月': 'codeplan.feature.prompts100',
      '300次/月': 'codeplan.feature.prompts300',
      '2000次/月': 'codeplan.feature.prompts2000',
      '1x额度': 'codeplan.feature.1x',
      '4x额度': 'codeplan.feature.4x',
      '20x额度': 'codeplan.feature.20x',
      '60x额度': 'codeplan.feature.60x',
      '8大模型可选': 'codeplan.feature.8models',
      '混元系列': 'codeplan.feature.hunyuan',
      'GPT-4o': 'codeplan.feature.gpt4o',
      'GPT-4o+o1': 'codeplan.feature.gpt4oo1',
      '1000请求/天': 'codeplan.feature.requests1000',
      '1500请求/天': 'codeplan.feature.requests1500',
      '2000请求/天': 'codeplan.feature.requests2000',
      'Claude 3.5': 'codeplan.feature.claude35',
      '5倍倍率': 'codeplan.feature.5xRate',
      '20倍倍率': 'codeplan.feature.20xRate',
      // Categories
      '国内': 'codeplan.domestic',
      '国际': 'codeplan.international',
    }
    const key = textMap[text]
    return key ? t(key) : text
  }

  const getProviderLogo = (providerId: string) => {
    return providers.find((p) => p.id === providerId)?.logo || '🤖'
  }

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    return getProviderDisplayName(providerId, provider?.name || providerId, language)
  }

  const handleAddModel = (modelId: string) => {
    if (!selectedModels.includes(modelId) && selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter((id) => id !== modelId))
  }

  const handleTogglePlan = (idx: number) => {
    if (selectedPlans.includes(idx)) {
      if (selectedPlans.length > 1) {
        setSelectedPlans(selectedPlans.filter(i => i !== idx))
      }
    } else if (selectedPlans.length < 4) {
      setSelectedPlans([...selectedPlans, idx])
    }
  }

  const availableModels = models.filter((m) => !selectedModels.includes(m.id))

  const currency = language === 'en' ? '$' : '¥'
  const metrics = [
    { label: t('compare.inputPrice'), unit: `${currency}/1M`, getValue: (m: any) => m.pricing.input, lowerIsBetter: true },
    { label: t('compare.outputPrice'), unit: `${currency}/1M`, getValue: (m: any) => m.pricing.output, lowerIsBetter: true },
    { label: t('compare.context'), unit: 'tokens', getValue: (m: any) => m.performance.contextWindow, lowerIsBetter: false },
    { label: t('compare.maxOutput'), unit: 'tokens', getValue: (m: any) => m.performance.maxOutput, lowerIsBetter: false },
    { label: t('compare.latency'), unit: 'ms', getValue: (m: any) => m.performance.latency, lowerIsBetter: true },
    { label: t('compare.accuracy'), unit: '%', getValue: (m: any) => m.performance.accuracy, lowerIsBetter: false },
  ]

  const getBestValue = (metricIndex: number) => {
    const values = selectedModelData.map((m) => metrics[metricIndex].getValue(m))
    const isLowerBetter = metrics[metricIndex].lowerIsBetter
    return isLowerBetter ? Math.min(...values) : Math.max(...values)
  }

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO
        title={t('compare.seoTitle')}
        description={t('compare.seoDesc')}
        path="/compare"
      />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="font-mono text-sm text-cyan-400 mb-2">
            <span className="text-green-400">$</span> {compareMode === 'models' ? 'compare --models' : 'compare --codeplans'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-400">&lt;</span> {t('compare.title')} <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            <span className="text-cyan-400">→</span> {compareMode === 'models' ? t('compare.modelsDesc') : t('compare.codeplanDesc')}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8 font-mono">
          <button
            onClick={() => setCompareMode('models')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              compareMode === 'models'
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-muted-foreground hover:text-primary border border-transparent'
            }`}
          >
            <Cpu className="h-4 w-4 inline mr-1" /> {t('compare.modelsMode')}
          </button>
          <button
            onClick={() => setCompareMode('codeplan')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              compareMode === 'codeplan'
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-muted-foreground hover:text-primary border border-transparent'
            }`}
          >
            <Code2 className="h-4 w-4 inline mr-1" /> {t('compare.codeplanMode')}
          </button>
        </div>

        {/* Models Comparison */}
        {compareMode === 'models' && (
          <>
            {/* Model Selection */}
            <Card className="mb-8 bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  {selectedModelData.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
                      <img src={getProviderLogo(model.providerId)} alt="" className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                      <span className="font-medium font-mono text-foreground">{model.name}</span>
                      <button onClick={() => handleRemoveModel(model.id)} className="ml-2 hover:bg-destructive/20 rounded-full p-1 transition-colors text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {selectedModels.length < 4 && (
                    <div className="relative group">
                      <Button variant="outline" className="gap-2 font-mono border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                        <Plus className="h-4 w-4" /> {t('compare.addModel')}
                      </Button>
                      <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 max-h-96 overflow-y-auto">
                        {availableModels.map((model) => (
                          <button key={model.id} onClick={() => handleAddModel(model.id)} className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center space-x-3 border-b border-border/50 last:border-b-0">
                            <img src={getProviderLogo(model.providerId)} alt="" className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                            <div>
                              <p className="font-medium text-sm text-foreground font-mono">{model.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{getProviderName(model.providerId)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Models Table */}
            {selectedModelData.length > 0 && (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-accent/50">
                          <th className="text-left p-6 font-semibold text-muted-foreground min-w-[160px] font-mono">{t('compare.coreFeatures').split(' ')[0]}</th>
                          {selectedModelData.map((model) => (
                            <th key={model.id} className="p-6 text-center min-w-[160px]">
                              <div className="flex flex-col items-center space-y-2">
                                <img src={getProviderLogo(model.providerId)} alt="" className="w-10 h-10 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                                <div className="text-center">
                                  <p className="font-semibold text-foreground font-mono">{model.name}</p>
                                  <p className="text-sm text-muted-foreground font-mono">{getProviderName(model.providerId)}</p>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((metric, idx) => {
                          const bestValue = getBestValue(idx)
                          return (
                            <tr key={idx} className="border-b border-border/50 last:border-b-0 hover:bg-primary/5 transition-colors">
                              <td className="p-6">
                                <div className="font-mono">
                                  <p className="font-medium text-foreground">{metric.label}</p>
                                  <p className="text-sm text-muted-foreground">{metric.unit}</p>
                                </div>
                              </td>
                              {selectedModelData.map((model) => {
                                const value = metric.getValue(model)
                                const isBest = value === bestValue
                                return (
                                  <td key={model.id} className="p-6 text-center">
                                    <div className="flex flex-col items-center font-mono">
                                      <span className={`text-xl font-semibold ${isBest ? 'text-primary' : 'text-cyan-400'}`}>
                                        {typeof value === 'number' && value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}
                                      </span>
                                      {isBest && <Check className="h-5 w-5 text-primary mt-1" />}
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                        <tr className="hover:bg-primary/5 transition-colors">
                          <td className="p-6"><p className="font-medium text-foreground font-mono">{t('compare.coreFeatures')}</p></td>
                          {selectedModelData.map((model) => (
                            <td key={model.id} className="p-6">
                              <div className="space-y-2">
                                {model.features.slice(0, 3).map((feature, idx) => (
                                  <span key={idx} className="inline-block px-2 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-400 mr-2 mb-1 font-mono border border-cyan-500/30">{translateModelFeature(feature, t)}</span>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* CodePlan Comparison */}
        {compareMode === 'codeplan' && (
          <>
            {/* CodePlan Selection */}
            <Card className="mb-8 bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {codeplans.map((plan, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTogglePlan(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-mono text-sm ${
                        selectedPlans.includes(idx)
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'text-muted-foreground border border-transparent hover:text-primary'
                      }`}
                    >
                      <img src={providerLogos[plan.provider]} alt="" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                      {plan.name}
                      <span className="text-xs opacity-60">{formatPrice(plan.price, currency, exchangeRate)}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm font-mono text-muted-foreground">
                  <span className="text-primary">❯</span> {t('compare.selectModel')} ({selectedPlans.length}/4)
                </div>
              </CardContent>
            </Card>

            {/* CodePlan Table */}
            {selectedPlanData.length > 0 && (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-accent/50">
                          <th className="text-left p-6 font-semibold text-muted-foreground min-w-[180px] font-mono">{t('compare.usageLimit').split(' ')[0]}</th>
                          {selectedPlanData.map((plan, idx) => (
                            <th key={idx} className="p-6 text-center min-w-[180px]">
                              <div className="flex flex-col items-center space-y-2">
                                <img src={providerLogos[plan.provider]} alt="" className="w-12 h-12 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                                <div className="text-center">
                                  <p className="font-semibold text-foreground font-mono">{plan.name}</p>
                                  <p className="text-xs text-muted-foreground">{translateCompareText(plan.category)}</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary border border-primary/30">{translateCompareText(plan.badge)}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Price */}
                        <tr className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                          <td className="p-6"><p className="font-medium text-foreground font-mono">{t('compare.monthlyFee')}</p></td>
                          {selectedPlanData.map((plan, idx) => {
                            const prices = selectedPlanData.map(p => p.price)
                            const minPrice = Math.min(...prices)
                            const isBest = plan.price === minPrice
                            return (
                              <td key={idx} className="p-6 text-center">
                                <div className="flex flex-col items-center font-mono">
                                  <span className={`text-2xl font-bold ${isBest ? 'text-primary' : 'text-cyan-400'}`}>
                                    {plan.price === 0 ? t('compare.free') : formatPrice(plan.price, currency, exchangeRate)}
                                  </span>
                                  {isBest && plan.price > 0 && <Check className="h-5 w-5 text-primary mt-1" />}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                        {/* Usage Limit */}
                        <tr className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                          <td className="p-6"><p className="font-medium text-foreground font-mono">{t('compare.usageLimit')}</p></td>
                          {selectedPlanData.map((plan) => (
                            <td key={plan.name} className="p-6 text-center">
                              <span className="text-cyan-400 font-mono">{translateCompareText(plan.limit)}</span>
                            </td>
                          ))}
                        </tr>
                        {/* Annual Price */}
                        <tr className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                          <td className="p-6"><p className="font-medium text-foreground font-mono">{t('compare.annualFee')}</p></td>
                          {selectedPlanData.map((plan) => (
                            <td key={plan.name} className="p-6 text-center">
                              <span className="text-cyan-400 font-mono">{plan.price > 0 ? formatPrice(plan.price * 12, currency, exchangeRate) : '-'}</span>
                            </td>
                          ))}
                        </tr>
                        {/* Effective Price Hint */}
                        <tr className="bg-accent/30">
                          <td className="p-6">
                            <div className="font-mono">
                              <p className="font-medium text-yellow-400">{t('compare.effectivePrice')}</p>
                              <p className="text-xs text-muted-foreground mt-1">{t('compare.effectivePriceTip')}</p>
                            </div>
                          </td>
                          {selectedPlanData.map((plan) => (
                            <td key={plan.name} className="p-6 text-center">
                              {plan.limit.includes('/月') ? t('compare.perMonth') : plan.limit.includes('/5小时') ? t('compare.per5h') : plan.limit.includes('/天') ? t('compare.perDay') : t('compare.quota')}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CodePlan Tip */}
            <Card className="mt-8 bg-card/50 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="font-mono text-sm">
                  <div className="text-yellow-400 mb-2">// $ cat tips.txt</div>
                  <div className="text-foreground">
                    <span className="text-yellow-400">⚠️</span> {t('codeplan.warning')}
                    <br />
                    <span className="text-muted-foreground">{t('codeplan.tip')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA to CodePlan page */}
            <div className="mt-8 text-center">
              <Link to={localizePath('/codeplan', language)}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold px-6 py-3">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('compare.viewFullList')}
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Empty State for Models */}
        {compareMode === 'models' && selectedModelData.length === 0 && (
          <Card className="bg-card/50 border-border">
            <CardContent className="p-12 text-center">
              <div className="font-mono text-muted-foreground mb-4">
                <Cpu className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t('compare.noSelection')}</p>
                <p className="text-sm mt-2">Error: No models selected</p>
              </div>
              <Button onClick={() => handleAddModel(models[0].id)} className="font-mono border-2 border-primary text-primary hover:bg-primary/10">
                <Terminal className="mr-2 h-4 w-4" /> {t('compare.addFirst')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
