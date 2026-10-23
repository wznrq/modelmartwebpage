import { useState } from 'react'
import { BarChart3, Trophy, Target, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { benchmarks, modelBenchmarks } from '@/data/benchmarks'
import { models, providers } from '@/data/models'
import { useLanguage } from '@/i18n/LanguageContext'
import { SEO } from '@/components/SEO'

type ViewMode = 'ranking' | 'comparison' | 'detailed'
type CategoryFilter = 'all' | 'reasoning' | 'knowledge' | 'coding' | 'math' | 'safety'
type BenchmarkLanguage = 'zh-CN' | 'zh-TW' | 'en'

const providerNameTranslations: Record<string, Record<BenchmarkLanguage, string>> = {
  'AI21 Labs': { 'zh-CN': 'AI21 Labs', 'zh-TW': 'AI21 Labs', en: 'AI21 Labs' },
  'Alibaba Cloud / Qwen Team': {
    'zh-CN': '阿里云 / 通义千问团队',
    'zh-TW': '阿里雲 / 通義千問團隊',
    en: 'Alibaba Cloud / Qwen Team',
  },
  Amazon: { 'zh-CN': '亚马逊', 'zh-TW': '亞馬遜', en: 'Amazon' },
  Anthropic: { 'zh-CN': 'Anthropic', 'zh-TW': 'Anthropic', en: 'Anthropic' },
  Baidu: { 'zh-CN': '百度', 'zh-TW': '百度', en: 'Baidu' },
  ByteDance: { 'zh-CN': '字节跳动', 'zh-TW': '字節跳動', en: 'ByteDance' },
  Cohere: { 'zh-CN': 'Cohere', 'zh-TW': 'Cohere', en: 'Cohere' },
  DeepSeek: { 'zh-CN': 'DeepSeek 深度求索', 'zh-TW': 'DeepSeek 深度求索', en: 'DeepSeek' },
  Google: { 'zh-CN': 'Google 谷歌', 'zh-TW': 'Google 谷歌', en: 'Google' },
  IBM: { 'zh-CN': 'IBM', 'zh-TW': 'IBM', en: 'IBM' },
  Inception: { 'zh-CN': 'Inception', 'zh-TW': 'Inception', en: 'Inception' },
  'LG AI Research': { 'zh-CN': 'LG AI Research', 'zh-TW': 'LG AI Research', en: 'LG AI Research' },
  Meituan: { 'zh-CN': '美团', 'zh-TW': '美團', en: 'Meituan' },
  Meta: { 'zh-CN': 'Meta AI', 'zh-TW': 'Meta AI', en: 'Meta' },
  Microsoft: { 'zh-CN': '微软', 'zh-TW': '微軟', en: 'Microsoft' },
  MiniMax: { 'zh-CN': 'MiniMax', 'zh-TW': 'MiniMax', en: 'MiniMax' },
  'Mistral AI': { 'zh-CN': 'Mistral AI', 'zh-TW': 'Mistral AI', en: 'Mistral AI' },
  'Moonshot AI': { 'zh-CN': '月之暗面 Moonshot AI', 'zh-TW': '月之暗面 Moonshot AI', en: 'Moonshot AI' },
  NVIDIA: { 'zh-CN': '英伟达 NVIDIA', 'zh-TW': '輝達 NVIDIA', en: 'NVIDIA' },
  'Nous Research': { 'zh-CN': 'Nous Research', 'zh-TW': 'Nous Research', en: 'Nous Research' },
  OpenBMB: { 'zh-CN': 'OpenBMB', 'zh-TW': 'OpenBMB', en: 'OpenBMB' },
  OpenAI: { 'zh-CN': 'OpenAI', 'zh-TW': 'OpenAI', en: 'OpenAI' },
  'Sarvam AI': { 'zh-CN': 'Sarvam AI', 'zh-TW': 'Sarvam AI', en: 'Sarvam AI' },
  StepFun: { 'zh-CN': '阶跃星辰 StepFun', 'zh-TW': '階躍星辰 StepFun', en: 'StepFun' },
  Xiaomi: { 'zh-CN': '小米', 'zh-TW': '小米', en: 'Xiaomi' },
  'Zhipu AI': { 'zh-CN': '智谱 AI', 'zh-TW': '智譜 AI', en: 'Zhipu AI' },
  xAI: { 'zh-CN': 'xAI', 'zh-TW': 'xAI', en: 'xAI' },
}

const benchmarkProviderAliases: Record<string, string> = {
  qwen: 'alibaba',
  moonshotai: 'moonshot',
  stepfun: 'step',
  'zai-org': 'zhipu',
}

const benchmarkProviderLogos: Record<string, string> = {
  ai21: '/logos/ai21.svg',
  alibaba: '/logos/alibaba.svg',
  amazon: '/logos/amazon.svg',
  anthropic: '/logos/anthropic.svg',
  baidu: '/logos/baidu.svg',
  bytedance: '/logos/bytedance.svg',
  cohere: '/logos/cohere.svg',
  deepseek: '/logos/deepseek.svg',
  google: '/logos/google.svg',
  ibm: '/logos/ibm.svg',
  inceptionlabs: '/logos/inceptionlabs.svg',
  lg: '/logos/lg.svg',
  meituan: '/logos/meituan.svg',
  meta: '/logos/meta.svg',
  microsoft: '/logos/microsoft.svg',
  minimax: '/logos/minimax.svg',
  mistral: '/logos/mistral.svg',
  moonshot: '/logos/moonshot.svg',
  'nous-research': '/logos/nous-research.svg',
  nvidia: '/logos/nvidia.svg',
  openai: '/logos/openai.svg',
  openbmb: '/logos/openbmb.svg',
  sarvamai: '/logos/sarvamai.svg',
  step: '/logos/step.svg',
  xai: '/logos/xai.svg',
  xiaomi: '/logos/xiaomi.svg',
  zhipu: '/logos/zhipu.svg',
}

const benchmarkTranslations: Record<string, Record<BenchmarkLanguage, { fullName: string; description: string }>> = {
  chat_arena: {
    'zh-CN': { fullName: '聊天竞技场', description: '来自 llm-stats.com 的用户偏好竞技场分数，已归一到 0-100，便于横向比较。' },
    'zh-TW': { fullName: '聊天競技場', description: '來自 llm-stats.com 的使用者偏好競技場分數，已歸一到 0-100，便於橫向比較。' },
    en: { fullName: 'Chat Arena', description: 'Crowd preference arena score from llm-stats.com, normalized to 0-100 for UI comparison.' },
  },
  coding_arena: {
    'zh-CN': { fullName: '编程竞技场', description: '来自 llm-stats.com 的编程竞技场分数，已归一到 0-100，便于横向比较。' },
    'zh-TW': { fullName: '編程競技場', description: '來自 llm-stats.com 的編程競技場分數，已歸一到 0-100，便於橫向比較。' },
    en: { fullName: 'Coding Arena', description: 'Coding arena score from llm-stats.com, normalized to 0-100 for UI comparison.' },
  },
  gpqa: {
    'zh-CN': { fullName: 'GPQA', description: '研究生水平的生物、物理、化学多选题评测，用于衡量专业知识和复杂推理能力。' },
    'zh-TW': { fullName: 'GPQA', description: '研究生水平的生物、物理、化學多選題評測，用於衡量專業知識和複雜推理能力。' },
    en: { fullName: 'GPQA', description: 'Graduate-level biology, physics, and chemistry questions for expert reasoning evaluation.' },
  },
  mmlu_pro: {
    'zh-CN': { fullName: 'MMLU-Pro', description: 'MMLU 的高难度版本，扩大选项并移除简单题，更侧重推理密集型知识任务。' },
    'zh-TW': { fullName: 'MMLU-Pro', description: 'MMLU 的高難度版本，擴大選項並移除簡單題，更側重推理密集型知識任務。' },
    en: { fullName: 'MMLU-Pro', description: 'A harder MMLU variant with more choices and reasoning-intensive knowledge tasks.' },
  },
  aime_2025: {
    'zh-CN': { fullName: 'AIME 2025', description: '2025 年美国邀请数学考试题集，用于评估竞赛级数学推理能力。' },
    'zh-TW': { fullName: 'AIME 2025', description: '2025 年美國邀請數學考試題集，用於評估競賽級數學推理能力。' },
    en: { fullName: 'AIME 2025', description: 'Olympiad-style math problems from the 2025 American Invitational Mathematics Examination.' },
  },
  mmlu: {
    'zh-CN': { fullName: 'MMLU', description: '覆盖 STEM、人文、社科和专业领域的多任务语言理解评测。' },
    'zh-TW': { fullName: 'MMLU', description: '覆蓋 STEM、人文、社科和專業領域的多任務語言理解評測。' },
    en: { fullName: 'MMLU', description: 'Massive multitask language understanding across STEM, humanities, social sciences, and professional domains.' },
  },
  swe_bench_verified: {
    'zh-CN': { fullName: 'SWE-Bench Verified', description: '来自真实 GitHub issue 的软件工程修复任务，用于评估生成补丁和解决代码问题的能力。' },
    'zh-TW': { fullName: 'SWE-Bench Verified', description: '來自真實 GitHub issue 的軟體工程修復任務，用於評估生成補丁和解決程式碼問題的能力。' },
    en: { fullName: 'SWE-Bench Verified', description: 'Verified real-world GitHub issue tasks for evaluating code patch generation.' },
  },
  humanity_s_last_exam: {
    'zh-CN': { fullName: '人类最后考试', description: '跨数学、人文和自然科学的前沿知识评测，用于测试模型在高难学术问题上的表现。' },
    'zh-TW': { fullName: '人類最後考試', description: '跨數學、人文和自然科學的前沿知識評測，用於測試模型在高難學術問題上的表現。' },
    en: { fullName: "Humanity's Last Exam", description: 'Frontier academic benchmark across math, humanities, and natural sciences.' },
  },
  livecodebench: {
    'zh-CN': { fullName: 'LiveCodeBench', description: '持续收集新编程竞赛题的代码评测，降低训练污染风险。' },
    'zh-TW': { fullName: 'LiveCodeBench', description: '持續收集新編程競賽題的程式碼評測，降低訓練污染風險。' },
    en: { fullName: 'LiveCodeBench', description: 'Continuously updated coding benchmark using recent programming contest problems.' },
  },
  math: {
    'zh-CN': { fullName: 'MATH', description: '包含竞赛数学题和详细解法的高难数学推理评测。' },
    'zh-TW': { fullName: 'MATH', description: '包含競賽數學題和詳細解法的高難數學推理評測。' },
    en: { fullName: 'MATH', description: 'Challenging competition mathematics problems for reasoning evaluation.' },
  },
  humaneval: {
    'zh-CN': { fullName: 'HumanEval', description: '从函数说明生成可运行代码的编程正确性评测。' },
    'zh-TW': { fullName: 'HumanEval', description: '從函式說明生成可運行程式碼的編程正確性評測。' },
    en: { fullName: 'HumanEval', description: 'Functional correctness benchmark for generating programs from docstrings.' },
  },
  ifeval: {
    'zh-CN': { fullName: 'IFEval', description: '评估模型遵循可验证指令和约束的能力。' },
    'zh-TW': { fullName: 'IFEval', description: '評估模型遵循可驗證指令和約束的能力。' },
    en: { fullName: 'IFEval', description: 'Instruction-following benchmark with verifiable constraints.' },
  },
  mmmu: {
    'zh-CN': { fullName: 'MMMU', description: '面向大学学科知识和多模态推理的图文理解评测。' },
    'zh-TW': { fullName: 'MMMU', description: '面向大學學科知識和多模態推理的圖文理解評測。' },
    en: { fullName: 'MMMU', description: 'Multimodal college-level subject knowledge and reasoning benchmark.' },
  },
  simpleqa: {
    'zh-CN': { fullName: 'SimpleQA', description: '衡量短事实问答准确性的事实性评测。' },
    'zh-TW': { fullName: 'SimpleQA', description: '衡量短事實問答準確性的事實性評測。' },
    en: { fullName: 'SimpleQA', description: 'Short-form factual question answering benchmark.' },
  },
  browsecomp: {
    'zh-CN': { fullName: 'BrowseComp', description: '测试智能体持续浏览网页、查找隐蔽信息并给出可验证答案的能力。' },
    'zh-TW': { fullName: 'BrowseComp', description: '測試智能體持續瀏覽網頁、查找隱蔽資訊並給出可驗證答案的能力。' },
    en: { fullName: 'BrowseComp', description: 'Agentic web browsing benchmark for finding hard-to-locate information.' },
  },
  terminal_bench_2: {
    'zh-CN': { fullName: 'Terminal-Bench 2.0', description: '评估模型通过终端自主完成真实端到端任务的工具使用能力。' },
    'zh-TW': { fullName: 'Terminal-Bench 2.0', description: '評估模型透過終端自主完成真實端到端任務的工具使用能力。' },
    en: { fullName: 'Terminal-Bench 2.0', description: 'Tool-use benchmark for completing real terminal-based tasks autonomously.' },
  },
  math_500: {
    'zh-CN': { fullName: 'MATH-500', description: 'MATH 数据集中 500 道高难竞赛数学题的子集。' },
    'zh-TW': { fullName: 'MATH-500', description: 'MATH 數據集中 500 道高難競賽數學題的子集。' },
    en: { fullName: 'MATH-500', description: 'A 500-problem subset of challenging competition math tasks from MATH.' },
  },
}

export function Benchmarks() {
  const [viewMode, setViewMode] = useState<ViewMode>('ranking')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const { t, language } = useLanguage()
  const benchmarkLanguage = language as BenchmarkLanguage

  const getModelName = (modelId: string) => {
    const benchmark = modelBenchmarks.find((m) => m.modelId === modelId)
    if (benchmark?.modelName) return benchmark.modelName
    const model = models.find((m) => m.id === modelId)
    return model?.name || modelId
  }

  const getProviderLogo = (modelId: string) => {
    const model = models.find((m) => m.id === modelId)
    const benchmark = modelBenchmarks.find((m) => m.modelId === modelId)
    const benchmarkProviderId = benchmark?.providerId
      ? benchmarkProviderAliases[benchmark.providerId] ?? benchmark.providerId
      : undefined
    const provider = providers.find((p) => p.id === model?.providerId || p.id === benchmarkProviderId)
    return provider?.logo ?? (benchmarkProviderId ? benchmarkProviderLogos[benchmarkProviderId] : null) ?? null
  }

  const getProviderName = (modelId: string) => {
    const benchmark = modelBenchmarks.find((m) => m.modelId === modelId)
    if (benchmark?.providerName) {
      return providerNameTranslations[benchmark.providerName]?.[benchmarkLanguage] ?? benchmark.providerName
    }
    const model = models.find((m) => m.id === modelId)
    const provider = providers.find((p) => p.id === model?.providerId)
    return provider?.name || model?.providerId || 'Unknown'
  }

  const getBenchmarkName = (benchmarkName: string, fallback: string) => {
    return benchmarkTranslations[benchmarkName]?.[benchmarkLanguage]?.fullName ?? fallback
  }

  const getBenchmarkDescription = (benchmarkName: string, fallback: string) => {
    return benchmarkTranslations[benchmarkName]?.[benchmarkLanguage]?.description ?? fallback
  }

  const filteredBenchmarks = selectedCategory === 'all'
    ? benchmarks
    : benchmarks.filter((b) => b.category === selectedCategory)

  const getModelScore = (modelId: string, benchmarkName: string): number | null => {
    const data = modelBenchmarks.find((m) => m.modelId === modelId)
    return data?.scores[benchmarkName] ?? null
  }

  const getAverageScore = (modelId: string): number => {
    const data = modelBenchmarks.find((m) => m.modelId === modelId)
    if (!data) return 0
    const allowedScores = new Set(filteredBenchmarks.map((benchmark) => benchmark.name))
    const scoreValues = Object.entries(data.scores)
      .filter(([key, value]) => allowedScores.has(key) && typeof value === 'number')
      .map(([, value]) => value)
    if (!scoreValues.length) return 0
    return scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
  }

  const sortedByAverage = [...modelBenchmarks]
    .map((m) => ({ modelId: m.modelId, average: getAverageScore(m.modelId) }))
    .filter((m) => m.average > 0)
    .sort((a, b) => b.average - a.average)

  const getRankingColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-amber-600'
    return 'text-gray-400'
  }

  const getScoreColor = (score: number, higherIsBetter: boolean = true) => {
    if (higherIsBetter) {
      if (score >= 90) return 'text-green-400'
      if (score >= 80) return 'text-cyan-400'
      if (score >= 70) return 'text-yellow-400'
      return 'text-gray-400'
    }
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO
        title={t('benchmarks.seoTitle')}
        description={t('benchmarks.seoDesc')}
        path="/benchmarks"
      />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-sm text-cyan-400 mb-2">
            <span className="text-green-400">$</span> benchmark --run-all
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-400">&lt;</span> {t('benchmarks.title')} <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono">
            <span className="text-cyan-400">&gt;&gt;</span> {t('benchmarks.subtitle')}
          </p>
        </div>

        {/* View Mode Tabs */}
        <Card className="mb-8 bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setViewMode('ranking')}
                variant={viewMode === 'ranking' ? 'default' : 'outline'}
                className={`gap-2 font-mono ${
                  viewMode === 'ranking'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                <Trophy className="h-4 w-4" />
                {t('benchmarks.ranking')}
              </Button>
              <Button
                onClick={() => setViewMode('comparison')}
                variant={viewMode === 'comparison' ? 'default' : 'outline'}
                className={`gap-2 font-mono ${
                  viewMode === 'comparison'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                {t('benchmarks.comparison')}
              </Button>
              <Button
                onClick={() => setViewMode('detailed')}
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                className={`gap-2 font-mono ${
                  viewMode === 'detailed'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                <Target className="h-4 w-4" />
                {t('benchmarks.detailed')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <Card className="mb-8 bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory('all')}
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                className={`font-mono text-xs ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                    : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {t('benchmarks.all')}
              </Button>
              {(['reasoning', 'knowledge', 'coding', 'math', 'safety'] as CategoryFilter[]).map((cat) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className={`font-mono text-xs ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                      : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                  }`}
                >
                  {t(`benchmarks.${cat}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking View */}
        {viewMode === 'ranking' && (
          <div className="space-y-4">
            {sortedByAverage.map((item, index) => (
              <Card
                key={item.modelId}
                className="bg-card/80 border-border hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setSelectedModel(item.modelId === selectedModel ? null : item.modelId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className={`text-3xl font-bold font-mono w-16 ${getRankingColor(index + 1)}`}>
                        #{index + 1}
                      </div>
                      <div className="flex items-center space-x-4">
                        {getProviderLogo(item.modelId) ? (
                          <img src={getProviderLogo(item.modelId) ?? ''} alt="" className="w-12 h-12 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                        ) : (
                          <div className="w-12 h-12 rounded border border-border bg-accent/60 flex items-center justify-center font-mono text-sm text-cyan-400">
                            {getProviderName(item.modelId).slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xl font-semibold text-foreground font-mono">{getModelName(item.modelId)}</p>
                          <p className="text-sm text-muted-foreground font-mono">{getProviderName(item.modelId)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1 font-mono">{t('benchmarks.overall')}</p>
                        <p className={`text-2xl font-bold font-mono ${getScoreColor(item.average)}`}>
                          {item.average.toFixed(1)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {filteredBenchmarks.slice(0, 4).map((bench) => {
                          const score = getModelScore(item.modelId, bench.name)
                          return (
                            <div key={bench.name} className="text-center">
                              <p className="text-xs text-muted-foreground mb-1 font-mono">{getBenchmarkName(bench.name, bench.fullName)}</p>
                              <p className={`text-lg font-semibold font-mono ${score !== null ? getScoreColor(score) : 'text-muted-foreground/40'}`}>
                                {score !== null ? score.toFixed(1) : '-'}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      {index < 3 && (
                        <Award className={`h-8 w-8 ${getRankingColor(index + 1)}`} />
                      )}
                    </div>
                  </div>

                  {selectedModel === item.modelId && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {benchmarks.map((bench) => {
                          const score = getModelScore(item.modelId, bench.name)
                          return (
                            <div key={bench.name} className="p-3 bg-accent/50 rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground mb-1 font-mono">{getBenchmarkName(bench.name, bench.fullName)}</p>
                              <p className={`text-lg font-semibold font-mono ${score !== null ? getScoreColor(score) : 'text-muted-foreground/40'}`}>
                                {score !== null ? score.toFixed(1) : '-'}
                              </p>
                              <p className="text-xs text-muted-foreground/60 mt-1">{getBenchmarkDescription(bench.name, bench.description)}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Comparison View */}
        {viewMode === 'comparison' && (
          <Card className="bg-card/80 border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-accent/50">
                      <th className="text-left p-6 font-semibold text-muted-foreground min-w-[200px] font-mono">
                        {t('benchmarks.detailed')}
                      </th>
                      {sortedByAverage.slice(0, 5).map((item) => (
                        <th key={item.modelId} className="p-6 text-center min-w-[150px]">
                          <div className="flex flex-col items-center space-y-2">
                            {getProviderLogo(item.modelId) ? (
                              <img src={getProviderLogo(item.modelId) ?? ''} alt="" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                            ) : (
                              <div className="w-8 h-8 rounded border border-border bg-accent/60 flex items-center justify-center font-mono text-[10px] text-cyan-400">
                                {getProviderName(item.modelId).slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <p className="font-semibold text-foreground font-mono">{getModelName(item.modelId)}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBenchmarks.map((bench) => {
                      const topScore = Math.max(
                        ...sortedByAverage.slice(0, 5).map((item) => getModelScore(item.modelId, bench.name) ?? 0)
                      )
                      return (
                        <tr key={bench.name} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                          <td className="p-6">
                            <div className="font-mono">
                              <p className="font-medium text-foreground">{getBenchmarkName(bench.name, bench.fullName)}</p>
                              <p className="text-sm text-muted-foreground">{getBenchmarkDescription(bench.name, bench.description)}</p>
                            </div>
                          </td>
                          {sortedByAverage.slice(0, 5).map((item) => {
                            const score = getModelScore(item.modelId, bench.name)
                            const isTop = score !== null && score === topScore && topScore > 0
                            return (
                              <td key={item.modelId} className="p-6 text-center">
                                <span className={`text-xl font-semibold font-mono ${
                                  isTop ? 'text-primary' : score !== null ? 'text-cyan-400' : 'text-muted-foreground/40'
                                }`}>
                                  {score !== null ? score.toFixed(1) : '-'}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed View */}
        {viewMode === 'detailed' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedByAverage.map((item) => (
              <Card key={item.modelId} className="bg-card/80 border-border hover:border-primary/50 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    {getProviderLogo(item.modelId) ? (
                      <img src={getProviderLogo(item.modelId) ?? ''} alt="" className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                    ) : (
                      <div className="w-8 h-8 rounded border border-border bg-accent/60 flex items-center justify-center font-mono text-[10px] text-cyan-400">
                        {getProviderName(item.modelId).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg text-foreground font-mono">
                        {getModelName(item.modelId)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{getProviderName(item.modelId)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {benchmarks.slice(0, 6).map((bench) => {
                      const score = getModelScore(item.modelId, bench.name)
                      return (
                        <div key={bench.name} className="p-2 bg-accent/50 rounded border border-border">
                          <p className="text-xs text-muted-foreground font-mono">{getBenchmarkName(bench.name, bench.fullName)}</p>
                          <p className={`text-lg font-semibold font-mono ${score !== null ? getScoreColor(score) : 'text-muted-foreground/40'}`}>
                            {score !== null ? score.toFixed(1) : '-'}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-mono">{t('benchmarks.overall')}</span>
                      <span className="text-2xl font-bold font-mono text-primary">
                        {item.average.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Data Source Footer */}
        <div className="mt-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-cyan-400">&gt;</span> {t('benchmarks.dataSource')}
          </p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-2">
            {t('benchmarks.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
