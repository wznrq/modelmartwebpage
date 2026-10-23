import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Terminal, Database, ChevronRight, ChevronDown, Globe, Zap, Bell, Check, ShieldCheck, Handshake } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { models, providers } from '@/data/models'
import { useLanguage } from '@/i18n/LanguageContext'
import { SEO } from '@/components/SEO'
import { formatPrice } from '@/utils/formatPrice'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { useAlertStore } from '@/stores/alertStore'
import { getModelDataTrust, getTrustScore } from '@/utils/modelDataTrust'
import { getModelPath, getProviderPath, localizePath } from '@/utils/routes'
import {
  getProviderDescription,
  getProviderDisplayName,
  translateModelFeature as translateSharedModelFeature,
  translateModelType,
} from '@/utils/modelTranslations'

type SortKey = 'name' | 'price' | 'accuracy' | 'context'
type Category = 'all' | 'domestic' | 'international'

const domesticProviders = providers.filter((provider) => provider.country === 'domestic').map((provider) => provider.id)
const internationalProviders = providers.filter((provider) => provider.country === 'international').map((provider) => provider.id)

export function Models() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [category, setCategory] = useState<Category>('all')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()
  const { subscribeModel, isSubscribed } = useAlertStore()

  useEffect(() => {
    const providerParam = searchParams.get('provider')
    if (providerParam && providers.some(p => p.id === providerParam)) {
      setSelectedProvider(providerParam)
    }

    const queryParam = searchParams.get('q')
    if (queryParam) {
      setSearchTerm(queryParam)
    }
  }, [searchParams])

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const provider = providers.find((p) => p.id === model.providerId)
      const providerName = getProviderDisplayName(
        model.providerId,
        provider?.name || model.providerId,
        language,
      )
      const matchesSearch =
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.providerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.features.some(f =>
          f.toLowerCase().includes(searchTerm.toLowerCase()) ||
          translateSharedModelFeature(f, t).toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesProvider =
        selectedProvider === 'all' || model.providerId === selectedProvider

      const isDomestic = domesticProviders.includes(model.providerId)
      const matchesCategory =
        category === 'all' ||
        (category === 'domestic' && isDomestic) ||
        (category === 'international' && !isDomestic)

      return matchesSearch && matchesProvider && matchesCategory
    })
  }, [searchTerm, selectedProvider, category, language, t])

  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price') return a.pricing.input - b.pricing.input
      if (sortBy === 'accuracy') return b.performance.accuracy - a.performance.accuracy
      if (sortBy === 'context') return b.performance.contextWindow - a.performance.contextWindow
      return 0
    })
  }, [filteredModels, sortBy])

  const stats = useMemo(() => {
    const prices = models.map(m => m.pricing.input)
    return {
      total: models.length,
      providers: providers.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      domestic: models.filter(m => domesticProviders.includes(m.providerId)).length,
      international: models.filter(m => internationalProviders.includes(m.providerId)).length,
    }
  }, [])

  const getProviderLogo = (providerId: string) => {
    return providers.find((p) => p.id === providerId)?.logo || '🤖'
  }

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId)
    return getProviderDisplayName(providerId, provider?.name || providerId, language)
  }

  const isDomestic = (providerId: string) => domesticProviders.includes(providerId)

  // Translate model feature text helper
  const translateModelFeature = (text: string) => {
    const textMap: Record<string, string> = {
      '多模态理解': 'models.feature.multimodalUnderstanding',
      '高级推理': 'models.feature.advancedReasoning',
      '代码生成': 'models.feature.codeGeneration',
      '百万级上下文': 'models.feature.millionContext',
      '轻量快速': 'models.feature.lightweightFast',
      '高性价比': 'models.feature.costEffective',
      '多模态': 'models.feature.multimodal',
      '128K上下文': 'models.feature.128kContext',
      '长文本理解': 'models.feature.longTextUnderstanding',
      '快速响应': 'models.feature.fastResponse',
      '函数调用': 'models.feature.functionCalling',
      '顶级推理': 'models.feature.topReasoning',
      '复杂问题解决': 'models.feature.complexProblemSolving',
      '思维链': 'models.feature.thoughtChain',
      '快速推理': 'models.feature.fastReasoning',
      '最新推理模型': 'models.feature.latestReasoningModel',
      '超级推理': 'models.feature.superReasoning',
      '前沿科学': 'models.feature.frontierScience',
      '高效推理': 'models.feature.efficientReasoning',
      '成本优化': 'models.feature.costOptimization',
      'STEM能力': 'models.feature.stemAbility',
      '平衡性能': 'models.feature.balancedPerformance',
      '极速响应': 'models.feature.instantResponse',
      '轻量级': 'models.feature.lightweight',
      '顶级性能': 'models.feature.topPerformance',
      '复杂推理': 'models.feature.complexReasoning',
      '长文本处理': 'models.feature.longTextProcessing',
      '开源': 'models.feature.openSource',
      '多语言': 'models.feature.multilingual',
      '欧洲合规': 'models.feature.euCompliance',
      '开源免费': 'models.feature.openSourceFree',
      '高度可定制': 'models.feature.highlyCustomizable',
      '本地部署': 'models.feature.localDeployment',
      '开源模型': 'models.feature.openSourceModel',
      '405B参数': 'models.feature.405bParams',
      '70B参数': 'models.feature.70bParams',
      '极速轻量': 'models.feature.instantLightweight',
      'MoE架构': 'models.feature.moeArchitecture',
      '64K上下文': 'models.feature.64kContext',
      '代码专用': 'models.feature.codeSpecialized',
      '架构设计': 'models.feature.architectureDesign',
      '性能优化': 'models.feature.performanceOptimization',
      '最新模型': 'models.feature.latestModel',
      '推理能力': 'models.feature.reasoningAbility',
      '实时知识': 'models.feature.realtimeKnowledge',
      '幽默风格': 'models.feature.humorStyle',
      '搜索增强': 'models.feature.searchEnhancement',
      '高性能': 'models.feature.highPerformance',
      'AWS托管': 'models.feature.awsHosted',
      '企业级安全': 'models.feature.enterpriseSecurity',
      'VPC支持': 'models.feature.vpcSupport',
      'AWS原生': 'models.feature.awsNative',
      'Azure托管': 'models.feature.azureHosted',
      '合规性': 'models.feature.compliance',
      '超高性价比': 'models.feature.ultraCostEffective',
      '671B参数': 'models.feature.671bParams',
      '640K上下文': 'models.feature.640kContext',
      '强化学习推理': 'models.feature.rlReasoning',
      '免费预览': 'models.feature.freePreview',
      '实时更新': 'models.feature.realtimeUpdate',
      '数学专用': 'models.feature.mathSpecialized',
      '解题能力': 'models.feature.problemSolving',
      '多任务能力': 'models.feature.multiTask',
      '262K上下文': 'models.feature.262kContext',
      '长文档处理': 'models.feature.longDocProcessing',
      '代码能力': 'models.feature.codingAbility',
      '对话优化': 'models.feature.conversationOptimization',
      '图像分析': 'models.feature.imageAnalysis',
      '200K上下文': 'models.feature.200kContext',
      '抖音生态': 'models.feature.douyinEcosystem',
      '极高性价比': 'models.feature.extremeCostEffective',
      '32K上下文': 'models.feature.32kContext',
      '图像理解': 'models.feature.imageUnderstanding',
      '视频理解': 'models.feature.videoUnderstanding',
      '商汤CV积累': 'models.feature.sensetimeCv',
      '语音交互': 'models.feature.voiceInteraction',
      'AI助手': 'models.feature.aiAssistant',
      '认知智能': 'models.feature.cognitiveIntelligence',
      '语音合成': 'models.feature.speechSynthesis',
      '安全大脑': 'models.feature.safetyBrain',
      '华为自研': 'models.feature.huaweiSelfDeveloped',
      '昇腾AI加速': 'models.feature.ascendAi',
      '行业定制': 'models.feature.industryCustomization',
      '昇腾芯片': 'models.feature.ascendChip',
      '国产算力': 'models.feature.domesticComputing',
      '中文优化': 'models.feature.chineseOptimization',
      '知识图谱': 'models.feature.knowledgeGraph',
      '行业解决方案': 'models.feature.industrySolutions',
      '百度搜索增强': 'models.feature.baiduSearch',
      '百度生态': 'models.feature.baiduEcosystem',
      '知识增强': 'models.feature.knowledgeEnhancement',
      '72B参数': 'models.feature.72bParams',
      '超长上下文': 'models.feature.ultraLongContext',
      '数学推理': 'models.feature.mathReasoning',
      '阿里云托管': 'models.feature.alibabaCloud',
      '音频理解': 'models.feature.audioUnderstanding',
      'GLM大模型系列': 'models.feature.glmSeries',
      '增强推理': 'models.feature.enhancedReasoning',
      '多语言支持': 'models.feature.multilingualSupport',
      '专业领域优化': 'models.feature.professionalDomain',
      '角色扮演': 'models.feature.rolePlaying',
      '情感交互': 'models.feature.emotionalInteraction',
      '成本低廉': 'models.feature.lowCost',
      '双语优化': 'models.feature.bilingualOptimization',
      '34B参数': 'models.feature.34bParams',
      '256K上下文': 'models.feature.256kContext',
      '腾讯生态': 'models.feature.tencentEcosystem',
      '腾讯生态集成': 'models.feature.tencentIntegration',
      '日常对话': 'models.feature.dailyConversation',
      '图像生成': 'models.feature.imageGeneration',
      '文字渲染': 'models.feature.textRendering',
      '高一致性': 'models.feature.highConsistency',
      '高效生成': 'models.feature.efficientGeneration',
      '实时生成': 'models.feature.realtimeGeneration',
      '高分辨率': 'models.feature.highResolution',
      '视频生成': 'models.feature.videoGeneration',
      '电影级质量': 'models.feature.cinematicQuality',
      '运动一致性': 'models.feature.motionConsistency',
      '艺术图像': 'models.feature.artImage',
      '高保真': 'models.feature.highFidelity',
      '创意无限': 'models.feature.creative',
      '社区驱动': 'models.feature.communityDriven',
      'AI搜索': 'models.feature.aiSearch',
      '实时信息': 'models.feature.realtimeInfo',
      '引用来源': 'models.feature.citation',
      '对话搜索': 'models.feature.conversationalSearch',
      'AI搜索Pro': 'models.feature.aiSearchPro',
      '无限使用': 'models.feature.unlimitedUse',
      '深度搜索': 'models.feature.deepSearch',
      '学术研究': 'models.feature.academicResearch',
      '1M上下文': 'models.feature.1mContext',
      '3072维度': 'models.feature.dimension3072',
      '400K上下文': 'models.feature.400kContext',
      'Apache 2.0': 'models.feature.apache20',
      'Chat Completions API': 'models.feature.chatCompletionsApi',
      '专业版': 'models.feature.professionalEdition',
      '中型开源': 'models.feature.mediumOpenSource',
      '代理任务': 'models.feature.agentTasks',
      '代理编码': 'models.feature.agentCoding',
      '低延迟': 'models.feature.lowLatency',
      '内容审核': 'models.feature.contentModeration',
      '前代旗舰': 'models.feature.previousFlagship',
      '可本地部署': 'models.feature.deployableLocally',
      '可配置推理': 'models.feature.configurableReasoning',
      '基础对话': 'models.feature.basicConversation',
      '复杂任务': 'models.feature.complexTasks',
      '复杂分析': 'models.feature.complexAnalysis',
      '实时对话': 'models.feature.realtimeConversation',
      '小型嵌入': 'models.feature.smallEmbedding',
      '开源权重': 'models.feature.openWeights',
      '指令遵循': 'models.feature.instructionFollowing',
      '文字图像': 'models.feature.textAndImage',
      '文字转语音': 'models.feature.textToSpeech',
      '更强推理': 'models.feature.strongerReasoning',
      '更精准': 'models.feature.moreAccurate',
      '更精准响应': 'models.feature.moreAccurateResponses',
      '最强代理编码': 'models.feature.strongestAgentCoding',
      '最强嵌入': 'models.feature.strongestEmbedding',
      '最快': 'models.feature.fastest',
      '最新图像生成': 'models.feature.latestImageGeneration',
      '最新旗舰': 'models.feature.latestFlagshipShort',
      '最新旗舰模型': 'models.feature.latestFlagshipModel',
      '最智能非推理模型': 'models.feature.smartestNonReasoningModel',
      '最精准响应': 'models.feature.mostAccurateResponses',
      '最经济': 'models.feature.mostEconomical',
      '最高智能': 'models.feature.highestIntelligence',
      '深度思考': 'models.feature.deepThinking',
      '深度推理': 'models.feature.deepReasoning',
      '科学计算': 'models.feature.scientificComputing',
      '语音识别': 'models.feature.speechRecognition',
      '语音转文字': 'models.feature.speechToText',
      '语音输入输出': 'models.feature.speechInputOutput',
      '超轻量': 'models.feature.ultraLightweight',
      '轻量任务': 'models.feature.lightweightTasks',
      '轻量级任务': 'models.feature.lightweightTaskMode',
      '边缘部署': 'models.feature.edgeDeployment',
      '近前沿智能': 'models.feature.nearFrontierIntelligence',
      '通用场景': 'models.feature.generalScenarios',
      '顶级智能': 'models.feature.topIntelligence',
      '高准确率': 'models.feature.highAccuracy',
      '高容量': 'models.feature.highCapacity',
      '高智能': 'models.feature.highIntelligence',
      '高质量': 'models.feature.highQuality',
    }
    const key = textMap[text]
    return key ? t(key) : text
  }

  return (
    <div className="min-h-screen bg-background text-green-400 pt-20 pb-16">
      <SEO
        title={t('models.seoTitle')}
        description={t('models.seoDesc')}
        path="/models"
      />
      <div className="fixed inset-0 opacity-3 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Terminal Header */}
        <div className="mb-8 font-mono">
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-3">
            <span className="text-green-500">❯</span>
            <span>./list-models --verbose</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <span className="text-green-400">&lt;</span>
            {t('models.title')}
            <span className="text-green-400"> /&gt;</span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono">
            <span className="text-cyan-400">→</span> {t('models.subtitle', { count: stats.providers, total: stats.total })}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: t('models.total'), value: stats.total, icon: Database },
            { label: t('models.providers'), value: stats.providers, icon: Globe },
            { label: t('models.domestic'), value: stats.domestic, icon: Zap },
            { label: t('models.international'), value: stats.international, icon: Globe },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-secondary/60 border border-border rounded-lg px-4 py-3 font-mono">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Icon className="h-3 w-3" />
                {label}
              </div>
              <div className="text-xl text-primary font-bold">{value}</div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 font-mono">
          {[
            { key: 'all', label: t('models.all'), count: stats.total },
            { key: 'domestic', label: t('models.domestic'), count: stats.domestic },
            { key: 'international', label: t('models.international'), count: stats.international },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setCategory(key as Category)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                category === key
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20'
              }`}
            >
              {label} <span className="text-xs opacity-60">({count})</span>
            </button>
          ))}
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono">$</span>
            <input
              type="text"
              placeholder={t('models.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-border bg-secondary/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition-all font-mono text-sm"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => document.getElementById('models-provider-dropdown')?.classList.toggle('hidden')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/60 text-foreground focus:outline-none focus:border-primary/60 font-mono text-sm cursor-pointer min-w-[140px]"
            >
              {selectedProvider === 'all' ? (
                t('models.allProviders')
              ) : (
                <>
                  <img src={providers.find(p => p.id === selectedProvider)?.logo} alt="" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                  {getProviderName(selectedProvider)}
                </>
              )}
            </button>
            <div id="models-provider-dropdown" className="hidden absolute z-20 top-full left-0 mt-1 bg-card border border-border rounded-lg overflow-hidden min-w-[160px] max-h-64 overflow-y-auto shadow-lg">
              <button
                type="button"
                onClick={() => { setSelectedProvider('all'); document.getElementById('models-provider-dropdown')?.classList.add('hidden'); }}
                className="w-full px-4 py-2 text-left text-foreground hover:bg-accent font-mono flex items-center gap-2"
              >
                {t('models.allProviders')}
              </button>
              {providers.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedProvider(p.id); document.getElementById('models-provider-dropdown')?.classList.add('hidden'); }}
                  className={`w-full px-4 py-2 text-left hover:bg-accent font-mono flex items-center gap-2 ${selectedProvider === p.id ? 'bg-primary/20 text-primary' : 'text-foreground'}`}
                >
                  <img src={p.logo} alt="" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                  {getProviderName(p.id)}
                </button>
              ))}
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-4 py-2.5 rounded-lg border border-border bg-secondary/60 text-foreground focus:outline-none focus:border-primary/60 font-mono text-sm cursor-pointer min-w-[140px]"
          >
            <option value="name">{t('models.sortName')}</option>
            <option value="price">{t('models.sortPrice')}</option>
            <option value="accuracy">{t('models.sortAccuracy')}</option>
            <option value="context">{t('models.sortContext')}</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm font-mono text-muted-foreground mb-4">
          <span className="text-primary">❯</span> {t('models.found', { count: sortedModels.length })}
        </div>

        {/* Models List */}
        <div className="space-y-3">
          {sortedModels.map((model) => {
            const isExpanded = expandedCard === model.id
            const domestic = isDomestic(model.providerId)
            const dataTrust = getModelDataTrust(model)
            const trustScore = getTrustScore(dataTrust.level)
            const subscribed = isSubscribed(model.id)

            return (
              <Card
                key={model.id}
                className={`bg-card/80 border-border hover:border-primary/40 transition-all duration-200 overflow-hidden ${isExpanded ? 'ring-1 ring-primary/30' : ''}`}
              >
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedCard(isExpanded ? null : model.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Link to={localizePath(getProviderPath(model.providerId), language)} onClick={(e) => e.stopPropagation()}>
                        <img src={getProviderLogo(model.providerId)} alt="" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </Link>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={localizePath(getModelPath(model.providerId, model.id), language)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-foreground font-mono font-medium hover:text-primary transition-colors"
                          >
                            {model.name}
                          </Link>
                          {domestic && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">{t('models.domestic')}</span>
                          )}
                          <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                            model.type === 'chat' ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
                            model.type === 'code' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                            model.type === 'image' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}>
                            {translateModelType(model.type, t)}
                          </span>
                          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded bg-green-500/10 text-green-400 border border-green-500/30 font-mono">
                            <ShieldCheck className="h-3 w-3" />
                            {t(`models.trust.${dataTrust.level}`)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {getProviderName(model.providerId)} · {t('models.contextWindow')} {(model.performance.contextWindow / 1000).toFixed(0)}K
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-cyan-400 font-mono text-sm">{formatPrice(model.pricing.input, language === 'en' ? '$' : '¥', exchangeRate)}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{t('models.perToken')}</div>
                      </div>
                      <div className="text-green-400">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border px-4 py-4 bg-accent/20">
                      <p className="mb-4 text-xs text-muted-foreground font-mono">
                        {getProviderDescription(
                          model.providerId,
                          providers.find((p) => p.id === model.providerId)?.description || '',
                          t,
                        )}
                      </p>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="bg-secondary/60 rounded-lg p-3 border border-border">
                          <div className="text-xs text-muted-foreground font-mono mb-2">{t('models.pricing')}</div>
                          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                            <div>
                              <span className="text-muted-foreground">{t('models.inputPrice')}</span>
                              <div className="text-cyan-400 font-bold">{formatPrice(model.pricing.input, language === 'en' ? '$' : '¥', exchangeRate)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('models.outputPrice')}</span>
                              <div className="text-cyan-400 font-bold">{formatPrice(model.pricing.output, language === 'en' ? '$' : '¥', exchangeRate)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-secondary/60 rounded-lg p-3 border border-border">
                          <div className="text-xs text-muted-foreground font-mono mb-2">{t('models.performance')}</div>
                          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                            <div>
                              <span className="text-muted-foreground">{t('models.accuracy')}</span>
                              <div className="text-primary font-bold">{model.performance.accuracy}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t('models.latency')}</span>
                              <div className="text-primary font-bold">{model.performance.latency}ms</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-secondary/60 rounded-lg p-3 border border-border">
                          <div className="text-xs text-muted-foreground font-mono mb-2">{t('models.features')}</div>
                          <div className="flex flex-wrap gap-1">
                            {model.features.slice(0, 4).map((feature, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-xs rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">{translateModelFeature(feature)}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-secondary/60 rounded-lg p-3 border border-border">
                          <div className="text-xs text-muted-foreground font-mono mb-2">{t('models.dataTrust')}</div>
                          <div className="space-y-2 font-mono text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t('models.confidence')}</span>
                              <span className="text-primary font-bold">{trustScore}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{t('models.lastVerified')}</span>
                              <span className="text-cyan-400">{dataTrust.lastVerified}</span>
                            </div>
                            <a href={dataTrust.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-cyan-400 hover:text-primary transition-colors">
                              {t(`models.trust.${dataTrust.level}`)} →
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                        <a href={dataTrust.sourceUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono text-sm hover:bg-primary/20 transition-all border border-primary/30">
                          {t('models.visitWebsite')} →
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            subscribeModel(model.id, model.providerId)
                          }}
                          disabled={subscribed}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-secondary/50 text-muted-foreground font-mono text-sm hover:text-primary transition-all border border-border/50 disabled:cursor-default disabled:text-primary disabled:border-primary/30"
                        >
                          {subscribed ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          {subscribed ? t('models.alertSubscribed') : t('models.subscribeAlert')}
                        </button>
                        <Link
                          to={localizePath(`/business?provider=${model.providerId}`, language)}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono text-sm hover:bg-primary/20 transition-all border border-primary/30"
                        >
                          <Handshake className="h-4 w-4" />
                          {t('models.consultProcurement')}
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(model.name); }} className="px-4 py-2 rounded-lg bg-secondary/50 text-muted-foreground font-mono text-sm hover:text-primary transition-all border border-border/50">
                          {t('models.copyName')}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {sortedModels.length === 0 && (
          <div className="text-center py-20 font-mono">
            <Terminal className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground text-lg">{t('models.noResults')}</p>
            <p className="text-muted-foreground/70 text-sm mt-2">Error: Query returned 0 results</p>
            <button onClick={() => { setSearchTerm(''); setSelectedProvider('all'); setCategory('all'); }} className="mt-4 px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-all">
              {t('models.reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
