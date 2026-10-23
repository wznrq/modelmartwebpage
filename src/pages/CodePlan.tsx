import { useState, useMemo } from 'react'
import { Check, X, TrendingUp, Code2, Terminal, Filter, ChevronDown, ChevronUp, Sparkles, Sword, Gift, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { SEO } from '@/components/SEO'
import { useLanguage } from '@/i18n/LanguageContext'
import { formatPrice } from '@/utils/formatPrice'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { localizePath } from '@/utils/routes'

interface PlanFeature {
  text: string;
  included: boolean;
  warning?: boolean;
}

interface Plan {
  provider: string;
  logo: string;
  planName: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  color: string;
  borderColor: string;
  badge: string;
  priceNote?: string;
  promoUrl?: string;
  promoLabelKey?: string;
  promoNoteKey?: string;
  features: PlanFeature[];
  highlight: string;
  category: 'domestic' | 'international';
  providerName: string;
}

const USD_TO_CNY = 7.2;
const MINIMAX_TOKEN_PLAN_PROMO = {
  promoUrl: 'https://platform.minimaxi.com/subscribe/token-plan?code=E7voRZG0DB&source=link',
  promoLabelKey: 'codeplan.promo.minimax.cta',
  promoNoteKey: 'codeplan.promo.minimax.note',
} as const;

const plans: Plan[] = [
  // === 智谱 GLM ===
  { provider: 'zhipu', providerName: '智谱 GLM', logo: '/logos/zhipu.svg', planName: 'Lite', monthlyPrice: 49, yearlyPrice: null, color: 'from-blue-400 to-cyan-400', borderColor: 'hover:border-blue-400/50', badge: '入门级', category: 'domestic', features: [{ text: 'GLM-5 模型', included: true }, { text: '约 80 次/5小时', included: true }, { text: '400 次/周', included: true }, { text: '高峰期限速', included: true, warning: true }], highlight: '最低价格，适合轻度使用' },
  { provider: 'zhipu', providerName: '智谱 GLM', logo: '/logos/zhipu.svg', planName: 'Pro', monthlyPrice: 149, yearlyPrice: null, color: 'from-blue-500 to-cyan-500', borderColor: 'hover:border-blue-500/50', badge: '专业级', priceNote: '2月涨30%，4月再涨10%', category: 'domestic', features: [{ text: 'GLM-5/5.1 模型', included: true }, { text: '约 400 次/5小时', included: true }, { text: '2000 次/周', included: true }, { text: 'GLM-5 消耗 3x 额度', included: true, warning: true }], highlight: '重度编码用户首选' },
  { provider: 'zhipu', providerName: '智谱 GLM', logo: '/logos/zhipu.svg', planName: 'Max', monthlyPrice: 469, yearlyPrice: null, color: 'from-blue-600 to-purple-500', borderColor: 'hover:border-purple-500/50', badge: '旗舰级', category: 'domestic', features: [{ text: 'GLM-5.1 模型', included: true }, { text: '约 1600 次/5小时', included: true }, { text: '8000 次/周', included: true }, { text: '最高质量代码生成', included: true }], highlight: '最高额度，重度用户首选' },
  // === MiniMax ===
  { provider: 'minimax', providerName: 'MiniMax', logo: '/logos/minimax.svg', planName: 'Starter', monthlyPrice: 29, yearlyPrice: 24, color: 'from-green-500 to-emerald-500', borderColor: 'hover:border-green-500/50', badge: '性价比之王', category: 'domestic', features: [{ text: 'M2.7 模型', included: true }, { text: '约 40 prompts/月', included: true }, { text: '无周限制', included: true }, { text: '适合学生/预算用户', included: true }], highlight: '最低月费，最佳性价比', ...MINIMAX_TOKEN_PLAN_PROMO },
  { provider: 'minimax', providerName: 'MiniMax', logo: '/logos/minimax.svg', planName: 'Plus', monthlyPrice: 49, yearlyPrice: 39, color: 'from-green-500 to-teal-500', borderColor: 'hover:border-teal-500/50', badge: '进阶', category: 'domestic', features: [{ text: 'M2.7 模型', included: true }, { text: '约 100 prompts/月', included: true }, { text: '无周限制', included: true }, { text: '年付优惠', included: true }], highlight: '平衡之选', ...MINIMAX_TOKEN_PLAN_PROMO },
  { provider: 'minimax', providerName: 'MiniMax', logo: '/logos/minimax.svg', planName: 'Max', monthlyPrice: 119, yearlyPrice: 99, color: 'from-green-600 to-emerald-600', borderColor: 'hover:border-emerald-500/50', badge: '高额度', category: 'domestic', features: [{ text: 'M2.7 模型', included: true }, { text: '约 300 prompts/月', included: true }, { text: '无周限制', included: true }, { text: '年付优惠', included: true }], highlight: '高频用户首选', ...MINIMAX_TOKEN_PLAN_PROMO },
  { provider: 'minimax', providerName: 'MiniMax', logo: '/logos/minimax.svg', planName: 'Ultra', monthlyPrice: 899, yearlyPrice: null, color: 'from-green-700 to-emerald-700', borderColor: 'hover:border-green-600/50', badge: '顶配', category: 'domestic', features: [{ text: 'M2.7 模型', included: true }, { text: '约 2000 prompts/月', included: true }, { text: '无周限制', included: true }, { text: '企业级支持', included: true }], highlight: '无限火力，极致体验', ...MINIMAX_TOKEN_PLAN_PROMO },
  // === Kimi ===
  { provider: 'moonshot', providerName: 'Kimi', logo: '/logos/moonshot.svg', planName: 'Andante', monthlyPrice: 49, yearlyPrice: 39, color: 'from-purple-500 to-pink-500', borderColor: 'hover:border-purple-500/50', badge: 'UI 开发首选', category: 'domestic', features: [{ text: 'Kimi-for-coding 专用', included: true }, { text: '1x 额度倍率', included: true }, { text: '前端/UI 截图还原强', included: true }, { text: '年付优惠 ¥39/月', included: true }], highlight: '前端开发者的理想选择' },
  { provider: 'moonshot', providerName: 'Kimi', logo: '/logos/moonshot.svg', planName: 'Moderato', monthlyPrice: 99, yearlyPrice: 79, color: 'from-purple-600 to-pink-600', borderColor: 'hover:border-pink-500/50', badge: '进阶', category: 'domestic', features: [{ text: 'Kimi-for-coding 专用', included: true }, { text: '4x 额度倍率', included: true }, { text: '更高对话频率', included: true }, { text: '年付优惠', included: true }], highlight: '进阶开发首选' },
  { provider: 'moonshot', providerName: 'Kimi', logo: '/logos/moonshot.svg', planName: 'Allegretto', monthlyPrice: 199, yearlyPrice: 159, color: 'from-purple-700 to-red-500', borderColor: 'hover:border-red-500/50', badge: '高级', category: 'domestic', features: [{ text: 'Kimi-for-coding 专用', included: true }, { text: '20x 额度倍率', included: true }, { text: '极高对话频率', included: true }, { text: '年付优惠', included: true }], highlight: '重度开发者首选' },
  { provider: 'moonshot', providerName: 'Kimi', logo: '/logos/moonshot.svg', planName: 'Allegro', monthlyPrice: 699, yearlyPrice: null, color: 'from-purple-800 to-red-600', borderColor: 'hover:border-red-600/50', badge: '旗舰', category: 'domestic', features: [{ text: 'Kimi-for-coding 专用', included: true }, { text: '60x 额度倍率', included: true }, { text: '无限火力', included: true }, { text: '企业级支持', included: true }], highlight: '极致体验，极限开发' },
  // === 阿里百炼 ===
  { provider: 'alibaba', providerName: '阿里百炼', logo: '/logos/alibaba.svg', planName: 'Pro', monthlyPrice: 200, yearlyPrice: null, color: 'from-orange-500 to-red-500', borderColor: 'hover:border-orange-500/50', badge: '多模型聚合', priceNote: 'Lite 版已下线', category: 'domestic', features: [{ text: '8 大模型可选', included: true }, { text: 'Qwen/GLM/Kimi 等', included: true }, { text: '自然月计费', included: true }, { text: '灵活切换模型', included: true }], highlight: '多模型切换者必备' },
  // === 腾讯云 ===
  { provider: 'tencent', providerName: '腾讯云', logo: '/logos/tencent.svg', planName: 'Coding', monthlyPrice: 40, yearlyPrice: null, color: 'from-indigo-500 to-blue-500', borderColor: 'hover:border-indigo-500/50', badge: '企业生态', priceNote: '首月 ¥7.9', category: 'domestic', features: [{ text: '混元系列模型', included: true }, { text: '支持 OpenAI 协议', included: true }, { text: '支持 Anthropic 协议', included: true }, { text: '企业生态集成', included: true }], highlight: '企业级应用集成' },
  // === 火山引擎 ===
  { provider: 'bytedance', providerName: '火山引擎', logo: '/logos/bytedance.svg', planName: 'Coding', monthlyPrice: 40, yearlyPrice: null, color: 'from-red-500 to-orange-500', borderColor: 'hover:border-orange-500/50', badge: '低门槛', priceNote: '首月 ¥9.9', category: 'domestic', features: [{ text: '按 API 请求计数', included: true }, { text: '1 prompt = 5-30 请求', included: true, warning: true }, { text: '高峰期性能不稳定', included: true, warning: true }, { text: '适合试用体验', included: true }], highlight: '入门门槛低但隐藏成本高' },
  // === Codex ===
  { provider: 'openai', providerName: 'Codex (ChatGPT)', logo: '/logos/openai.svg', planName: 'Go', monthlyPrice: Math.round(8 * USD_TO_CNY), yearlyPrice: null, color: 'from-green-400 to-emerald-500', borderColor: 'hover:border-green-400/50', badge: '入门', category: 'international', features: [{ text: 'GPT-4o 模型', included: true }, { text: '基础代码助手', included: true }, { text: '限速适用', included: true }, { text: '美元定价 $8/月', included: true }], highlight: 'OpenAI 官方最低价' },
  { provider: 'openai', providerName: 'Codex (ChatGPT)', logo: '/logos/openai.svg', planName: 'Plus', monthlyPrice: Math.round(20 * USD_TO_CNY), yearlyPrice: null, color: 'from-green-500 to-teal-500', borderColor: 'hover:border-teal-500/50', badge: '热门', category: 'international', features: [{ text: 'GPT-4o 模型', included: true }, { text: '更高使用额度', included: true }, { text: '优先访问新功能', included: true }, { text: '美元定价 $20/月', included: true }], highlight: '最受欢迎的选择' },
  { provider: 'openai', providerName: 'Codex (ChatGPT)', logo: '/logos/openai.svg', planName: 'Pro', monthlyPrice: Math.round(200 * USD_TO_CNY), yearlyPrice: null, color: 'from-green-600 to-emerald-600', borderColor: 'hover:border-emerald-500/50', badge: '旗舰', category: 'international', features: [{ text: 'GPT-4o + o1 模型', included: true }, { text: '无限使用额度', included: true }, { text: '最新功能抢先体验', included: true }, { text: '美元定价 $200/月', included: true }], highlight: '开发者终极之选' },
  // === Gemini CLI ===
  { provider: 'google', providerName: 'Gemini CLI', logo: '/logos/google.svg', planName: 'Free', monthlyPrice: 0, yearlyPrice: null, color: 'from-blue-400 to-cyan-400', borderColor: 'hover:border-blue-400/50', badge: '免费', category: 'international', features: [{ text: 'Gemini 模型', included: true }, { text: '1000 请求/天', included: true }, { text: '基础功能', included: true }, { text: '免费使用', included: true }], highlight: '零成本入门' },
  { provider: 'google', providerName: 'Gemini CLI', logo: '/logos/google.svg', planName: 'Pro', monthlyPrice: Math.round(20 * USD_TO_CNY), yearlyPrice: null, color: 'from-blue-500 to-cyan-500', borderColor: 'hover:border-cyan-500/50', badge: '进阶', category: 'international', features: [{ text: 'Gemini 2.0 模型', included: true }, { text: '1500 请求/天', included: true }, { text: '优先队列', included: true }, { text: '美元定价 $20/月', included: true }], highlight: '进阶开发首选' },
  { provider: 'google', providerName: 'Gemini CLI', logo: '/logos/google.svg', planName: 'Ultra', monthlyPrice: Math.round(200 * USD_TO_CNY), yearlyPrice: null, color: 'from-blue-600 to-purple-500', borderColor: 'hover:border-purple-500/50', badge: '旗舰', category: 'international', features: [{ text: 'Gemini 2.0 Pro 模型', included: true }, { text: '2000 请求/天', included: true }, { text: '最高优先级', included: true }, { text: '美元定价 $200/月', included: true }], highlight: '企业级开发首选' },
  // === Claude Code ===
  { provider: 'anthropic', providerName: 'Claude Code', logo: '/logos/anthropic.svg', planName: 'Pro', monthlyPrice: Math.round(20 * USD_TO_CNY), yearlyPrice: null, color: 'from-orange-400 to-red-400', borderColor: 'hover:border-orange-400/50', badge: '专业', category: 'international', features: [{ text: 'Claude 3.5 模型', included: true }, { text: '标准使用倍率', included: true }, { text: '1x 使用限制', included: true }, { text: '美元定价 $20/月', included: true }], highlight: 'Anthropic 官方首选' },
  { provider: 'anthropic', providerName: 'Claude Code', logo: '/logos/anthropic.svg', planName: 'Max 5x', monthlyPrice: Math.round(100 * USD_TO_CNY), yearlyPrice: null, color: 'from-orange-500 to-red-500', borderColor: 'hover:border-red-500/50', badge: '高级', category: 'international', features: [{ text: 'Claude 3.5 模型', included: true }, { text: '5倍使用倍率', included: true }, { text: '更高使用额度', included: true }, { text: '美元定价 $100/月', included: true }], highlight: '高频开发者之选' },
  { provider: 'anthropic', providerName: 'Claude Code', logo: '/logos/anthropic.svg', planName: 'Max 20x', monthlyPrice: Math.round(200 * USD_TO_CNY), yearlyPrice: null, color: 'from-orange-600 to-red-600', borderColor: 'hover:border-red-600/50', badge: '旗舰', category: 'international', features: [{ text: 'Claude 3.5 + o1 模型', included: true }, { text: '20倍使用倍率', included: true }, { text: '无限火力', included: true }, { text: '美元定价 $200/月', included: true }], highlight: '开发者终极选择' },
]

export function CodePlan() {
  const { t, language } = useLanguage()
  const { exchangeRate } = useExchangeRate()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('price-asc')
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const filteredPlans = useMemo(() => {
    let result = [...plans]

    if (selectedProvider !== 'all') {
      result = result.filter(p => p.provider === selectedProvider)
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    result.sort((a, b) => {
      const priceA = billingCycle === 'yearly' && a.yearlyPrice ? a.yearlyPrice : (a.monthlyPrice || 0)
      const priceB = billingCycle === 'yearly' && b.yearlyPrice ? b.yearlyPrice : (b.monthlyPrice || 0)

      if (sortBy === 'price-asc') return priceA - priceB
      if (sortBy === 'price-desc') return priceB - priceA
      if (sortBy === 'name') return a.providerName.localeCompare(b.providerName)
      return 0
    })

    return result
  }, [selectedProvider, selectedCategory, sortBy, billingCycle])

  const minPrice = Math.min(...filteredPlans.map(p => p.monthlyPrice || 0))
  const maxPrice = Math.max(...filteredPlans.map(p => p.monthlyPrice || 0))
  const currency = language === 'en' ? '$' : '¥'

  const getPriceLevel = (price: number | null) => {
    if (!price) return t('codeplan.badge.free')
    const ratio = price / maxPrice
    if (ratio < 0.2) return t('codeplan.superLow')
    if (ratio < 0.4) return t('codeplan.value')
    if (ratio < 0.7) return t('codeplan.mid')
    return t('codeplan.high')
  }

  // Translate plan text helper
  const translatePlanText = (text: string) => {
    // Map Chinese text to translation keys
    const textMap: Record<string, string> = {
      // Badges
      '入门级': 'codeplan.badge.entry',
      '专业级': 'codeplan.badge.professional',
      '旗舰级': 'codeplan.badge.flagship',
      '性价比之王': 'codeplan.badge.valueKing',
      '进阶': 'codeplan.badge.advanced',
      '高额度': 'codeplan.badge.highQuota',
      '顶配': 'codeplan.badge.top',
      'UI 开发首选': 'codeplan.badge.uiDevFirst',
      '高级': 'codeplan.badge.senior',
      '旗舰': 'codeplan.badge.flag',
      '多模型聚合': 'codeplan.badge.multiModel',
      '企业生态': 'codeplan.badge.enterprise',
      '低门槛': 'codeplan.badge.lowBarrier',
      '入门': 'codeplan.badge.entry2',
      '热门': 'codeplan.badge.popular',
      '免费': 'codeplan.badge.free',
      '专业': 'codeplan.badge.professional2',
      // Highlights
      '最低价格，适合轻度使用': 'codeplan.highlight.lightUse',
      '重度编码用户首选': 'codeplan.highlight.heavyCoding',
      '最高额度，重度用户首选': 'codeplan.highlight.maxQuota',
      '最低月费，最佳性价比': 'codeplan.highlight.bestValue',
      '平衡之选': 'codeplan.highlight.balanced',
      '高频用户首选': 'codeplan.highlight.frequentUser',
      '无限火力，极致体验': 'codeplan.highlight.unlimited',
      '前端开发者的理想选择': 'codeplan.highlight.frontendIdeal',
      '进阶开发首选': 'codeplan.highlight.advancedDev',
      '重度开发者首选': 'codeplan.highlight.heavyDev',
      '极致体验，极限开发': 'codeplan.highlight.ultimate',
      '多模型切换者必备': 'codeplan.highlight.multiSwitch',
      '企业级应用集成': 'codeplan.highlight.enterpriseInt',
      '入门门槛低但隐藏成本高': 'codeplan.highlight.hiddenCost',
      'OpenAI 官方最低价': 'codeplan.highlight.openaiLowest',
      '最受欢迎的选择': 'codeplan.highlight.mostPopular',
      '开发者终极之选': 'codeplan.highlight.devUltimate',
      '零成本入门': 'codeplan.highlight.zeroCost',
      'Anthropic 官方首选': 'codeplan.highlight.anthropicFirst',
      '企业级开发首选': 'codeplan.highlight.enterpriseDev',
      '开发者终极选择': 'codeplan.highlight.devUltimateChoice',
      // Features
      'GLM-5 模型': 'codeplan.feature.glm5',
      'GLM-5/5.1 模型': 'codeplan.feature.glm51',
      'GLM-5.1 模型': 'codeplan.feature.glm51Model',
      '约 80 次/5小时': 'codeplan.feature.glm515',
      '约 400 次/5小时': 'codeplan.feature.glm5400',
      '约 1600 次/5小时': 'codeplan.feature.glm51600',
      '400 次/周': 'codeplan.feature.week400',
      '2000 次/周': 'codeplan.feature.week2000',
      '8000 次/周': 'codeplan.feature.week8000',
      '高峰期限速': 'codeplan.feature.peakLimit',
      'GLM-5 消耗 3x 额度': 'codeplan.feature.glm53x',
      '最高质量代码生成': 'codeplan.feature.bestQuality',
      'M2.7 模型': 'codeplan.feature.m27',
      '约 40 prompts/月': 'codeplan.feature.prompts40',
      '约 100 prompts/月': 'codeplan.feature.prompts100',
      '约 300 prompts/月': 'codeplan.feature.prompts300',
      '约 2000 prompts/月': 'codeplan.feature.prompts2000',
      '无周限制': 'codeplan.feature.noWeekLimit',
      '适合学生/预算用户': 'codeplan.feature.studentBudget',
      '年付优惠': 'codeplan.feature.yearlyDiscount',
      '年付优惠 ¥39/月': 'codeplan.feature.yearlyDiscount39',
      '企业级支持': 'codeplan.feature.enterpriseSupport',
      'Kimi-for-coding 专用': 'codeplan.feature.kimiOnly',
      '1x 额度倍率': 'codeplan.feature.1x',
      '4x 额度倍率': 'codeplan.feature.4x',
      '20x 额度倍率': 'codeplan.feature.20x',
      '60x 额度倍率': 'codeplan.feature.60x',
      '前端/UI 截图还原强': 'codeplan.feature.frontendUi',
      '更高对话频率': 'codeplan.feature.higherFreq',
      '极高对话频率': 'codeplan.feature.veryHighFreq',
      '无限火力': 'codeplan.feature.unlimitedPower',
      '8 大模型可选': 'codeplan.feature.8models',
      'Qwen/GLM/Kimi 等': 'codeplan.feature.qwenGlmKimi',
      '自然月计费': 'codeplan.feature.monthlyBilling',
      '灵活切换模型': 'codeplan.feature.flexSwitch',
      '混元系列模型': 'codeplan.feature.hunyuan',
      '支持 OpenAI 协议': 'codeplan.feature.openaiProtocol',
      '支持 Anthropic 协议': 'codeplan.feature.anthropicProtocol',
      '企业生态集成': 'codeplan.feature.enterpriseEco',
      '按 API 请求计数': 'codeplan.feature.apiCount',
      '1 prompt = 5-30 请求': 'codeplan.feature.prompt530',
      '高峰期性能不稳定': 'codeplan.feature.unstable',
      '适合试用体验': 'codeplan.feature.trial',
      'GPT-4o 模型': 'codeplan.feature.gpt4o',
      'GPT-4o + o1 模型': 'codeplan.feature.gpt4oo1',
      '基础代码助手': 'codeplan.feature.basicAssistant',
      '限速适用': 'codeplan.feature.rateLimited',
      '美元定价 $8/月': 'codeplan.feature.usd8',
      '更高使用额度': 'codeplan.feature.higherQuota',
      '优先访问新功能': 'codeplan.feature.priorityAccess',
      '美元定价 $20/月': 'codeplan.feature.usd20',
      '无限使用额度': 'codeplan.feature.unlimitedQuota',
      '最新功能抢先体验': 'codeplan.feature.earlyAccess',
      '美元定价 $200/月': 'codeplan.feature.usd200',
      'Gemini 模型': 'codeplan.feature.gemini',
      '1000 请求/天': 'codeplan.feature.requests1000',
      '基础功能': 'codeplan.feature.basic',
      '免费使用': 'codeplan.feature.freeUse',
      'Gemini 2.0 模型': 'codeplan.feature.gemini20',
      '1500 请求/天': 'codeplan.feature.requests1500',
      '优先队列': 'codeplan.feature.priorityQueue',
      'Gemini 2.0 Pro 模型': 'codeplan.feature.gemini20pro',
      '2000 请求/天': 'codeplan.feature.requests2000',
      '最高优先级': 'codeplan.feature.topPriority',
      'Claude 3.5 模型': 'codeplan.feature.claude35',
      '标准使用倍率': 'codeplan.feature.standardRate',
      '1x 使用限制': 'codeplan.feature.1xLimit',
      '5倍使用倍率': 'codeplan.feature.5xRate',
      '20倍使用倍率': 'codeplan.feature.20xRate',
      'Claude 3.5 + o1 模型': 'codeplan.feature.claude35o1',
    }
    const key = textMap[text]
    return key ? t(key) : text
  }

  // Categories with translation keys
  const categories = [
    { id: 'all', labelKey: 'codeplan.all', icon: '🌐' },
    { id: 'domestic', labelKey: 'codeplan.domestic', icon: '🇨🇳' },
    { id: 'international', labelKey: 'codeplan.international', icon: '🌍' },
  ]

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO
        title={t('codeplan.seoTitle')}
        description={t('codeplan.seoDesc')}
        path="/codeplan"
      />
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="font-mono text-sm text-cyan-400 mb-2">
            <span className="text-green-400">$</span> kubectl get coding-plans --sort=price
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-mono text-foreground">
            <span className="text-green-400">&lt;</span>
            Coding Plan
            <span className="text-green-400">/&gt;</span>
          </h1>
          <p className="text-lg text-muted-foreground font-mono max-w-2xl mx-auto">
            <span className="text-cyan-400">&gt;&gt;</span> {t('codeplan.subtitle')}
          </p>
        </div>

        {/* Stats Bar - Terminal Style */}
        <div className="mb-8 border border-border bg-card/80 rounded-lg overflow-hidden">
          <div className="flex">
            <div className="flex-1 p-4 border-r border-border">
              <div className="text-xs text-muted-foreground font-mono mb-1">$ echo $TOTAL</div>
              <div className="text-2xl font-bold text-primary font-mono">{plans.length}</div>
              <div className="text-xs text-muted-foreground font-mono">{t('codeplan.total')}</div>
            </div>
            <div className="flex-1 p-4 border-r border-border">
              <div className="text-xs text-muted-foreground font-mono mb-1">$ echo $DOMESTIC</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{plans.filter(p => p.category === 'domestic').length}</div>
              <div className="text-xs text-muted-foreground font-mono">{t('codeplan.domestic')}</div>
            </div>
            <div className="flex-1 p-4 border-r border-border">
              <div className="text-xs text-muted-foreground font-mono mb-1">$ echo $INTL</div>
              <div className="text-2xl font-bold text-purple-400 font-mono">{plans.filter(p => p.category === 'international').length}</div>
              <div className="text-xs text-muted-foreground font-mono">{t('codeplan.international')}</div>
            </div>
            <div className="flex-1 p-4">
              <div className="text-xs text-muted-foreground font-mono mb-1">$ echo $PRICE_RANGE</div>
              <div className="text-2xl font-bold text-yellow-400 font-mono">{currency}{minPrice}-{currency}{maxPrice}</div>
              <div className="text-xs text-muted-foreground font-mono">{t('codeplan.priceRange')}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Category Tabs */}
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.icon} {t(cat.labelKey)}
                  </button>
                ))}
              </div>

              {/* Provider Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => document.getElementById('codeplan-provider-dropdown')?.classList.toggle('hidden')}
                    className="flex items-center gap-2 bg-secondary text-foreground px-3 py-2 rounded-lg font-mono text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {selectedProvider === 'all' ? (
                      t('codeplan.allProviders')
                    ) : (
                      <>
                        <img
                          src={plans.find(p => p.provider === selectedProvider)?.logo}
                          alt=""
                          className="w-5 h-5 object-contain"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                        {plans.find(p => p.provider === selectedProvider)?.providerName}
                      </>
                    )}
                  </button>
                  <div
                    id="codeplan-provider-dropdown"
                    className="hidden absolute z-20 top-full left-0 mt-1 bg-card border border-border rounded-lg overflow-hidden min-w-[160px] shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => { setSelectedProvider('all'); document.getElementById('codeplan-provider-dropdown')?.classList.add('hidden'); }}
                      className="w-full px-4 py-2 text-left text-foreground hover:bg-accent font-mono flex items-center gap-2"
                    >
                      {t('codeplan.allProviders')}
                    </button>
                    {[...new Set(plans.map(p => p.provider))].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => { setSelectedProvider(p); document.getElementById('codeplan-provider-dropdown')?.classList.add('hidden'); }}
                        className={`w-full px-4 py-2 text-left hover:bg-accent font-mono flex items-center gap-2 ${selectedProvider === p ? 'bg-primary/20 text-primary' : 'text-foreground'}`}
                      >
                        <img src={plans.find(plan => plan.provider === p)?.logo} alt="" className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                        {plans.find(plan => plan.provider === p)?.providerName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-secondary text-foreground px-3 py-2 rounded-lg font-mono text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="price-asc">{t('codeplan.sortPriceAsc')}</option>
                  <option value="price-desc">{t('codeplan.sortPriceDesc')}</option>
                  <option value="name">{t('codeplan.sortName')}</option>
                </select>
              </div>

              {/* Billing Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('codeplan.monthly')}
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('codeplan.yearly')} <span className="text-xs text-primary">{t('codeplan.yearlyDiscount')}</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning Banner - Terminal Style */}
        <div className="mb-8 border border-primary/30 bg-card/80 rounded-lg p-4 font-mono">
          <div className="flex items-start gap-3">
            <div className="text-cyan-400 text-sm">// $ cat tips.txt</div>
          </div>
          <div className="mt-2 text-sm text-foreground">
            <span className="text-yellow-400">⚠️</span> {t('codeplan.warning')}
            <br />
            <span className="text-muted-foreground">{t('codeplan.warningDetail')}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">// $ echo $TIP</span>
            <span className="text-xs text-primary">→ {t('codeplan.tip')}</span>
          </div>
        </div>

        {/* Price Comparison Bar */}
        <Card className="mb-8 bg-card/50 border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="flex h-3">
              {filteredPlans.map((plan) => {
                const price = billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : (plan.monthlyPrice || 0)
                const width = plan.monthlyPrice ? ((price / maxPrice) * 100) : 2
                return (
                  <div
                    key={`${plan.provider}-${plan.planName}`}
                    className={`h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-300 cursor-pointer hover:opacity-80`}
                    style={{ width: `${Math.max(width, 2)}%` }}
                    title={`${plan.providerName} ${plan.planName}: ${formatPrice(price, currency, exchangeRate)}`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between px-4 py-2 text-xs font-mono text-muted-foreground">
              <span>{formatPrice(minPrice, currency, exchangeRate)}</span>
              <span>{t('codeplan.priceDistribution')}</span>
              <span>{formatPrice(maxPrice, currency, exchangeRate)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPlans.map((plan) => {
            const price = billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : (plan.monthlyPrice || 0)
            const isExpanded = expandedPlan === `${plan.provider}-${plan.planName}`
            const isHovered = hoveredPlan === `${plan.provider}-${plan.planName}`
            const priceLevel = getPriceLevel(price)

            return (
              <Card
                key={`${plan.provider}-${plan.planName}`}
                className={`bg-card/80 border-border ${plan.borderColor} transition-all duration-300 relative overflow-hidden cursor-pointer ${
                  isHovered ? 'scale-[1.02] shadow-xl shadow-primary/10' : ''
                }`}
                onMouseEnter={() => setHoveredPlan(`${plan.provider}-${plan.planName}`)}
                onMouseLeave={() => setHoveredPlan(null)}
                onClick={() => setExpandedPlan(isExpanded ? null : `${plan.provider}-${plan.planName}`)}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`} />

                {/* Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold font-mono bg-gradient-to-r ${plan.color} text-foreground shadow-lg`}>
                    {translatePlanText(plan.badge)}
                  </span>
                </div>

                {/* Category indicator */}
                <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${plan.category === 'domestic' ? 'bg-red-500' : 'bg-blue-500'}`} />

                <CardContent className="p-6 relative">
                  {/* Provider & Plan */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={plan.logo} alt="" className="w-10 h-10 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-mono">{plan.providerName}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{plan.planName}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      {price === 0 ? (
                        <span className="text-4xl font-bold text-primary font-mono">{t('codeplan.badge.free')}</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-primary font-mono">{formatPrice(price, currency, exchangeRate)}</span>
                          <span className="text-muted-foreground font-mono">{t('codeplan.perMonth')}</span>
                        </>
                      )}
                    </div>
                    {plan.priceNote && (
                      <p className="text-xs text-yellow-400 font-mono mt-1">{plan.priceNote}</p>
                    )}
                    {billingCycle === 'yearly' && plan.yearlyPrice && (
                      <p className="text-xs text-cyan-400 font-mono mt-1">{t('codeplan.yearly')} {formatPrice(plan.yearlyPrice * 12, currency, exchangeRate)}{t('codeplan.yearlySuffix')}</p>
                    )}
                  </div>

                  {/* Price Level Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      priceLevel === t('codeplan.superLow') ? 'bg-green-500/20 text-green-400' :
                      priceLevel === t('codeplan.value') ? 'bg-cyan-500/20 text-cyan-400' :
                      priceLevel === t('codeplan.mid') ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {priceLevel}
                    </span>
                    {plan.category === 'international' && (
                      <span className="px-2 py-1 rounded text-xs font-mono bg-blue-500/20 text-blue-400">🔄 {t('codeplan.exchangeNote')}</span>
                    )}
                  </div>

                  {/* Highlight */}
                  <p className="text-sm text-cyan-400 mb-4 font-mono bg-cyan-500/10 px-3 py-2 rounded border border-cyan-500/30">
                    {translatePlanText(plan.highlight)}
                  </p>

                  {plan.promoUrl && plan.promoLabelKey && (
                    <a
                      href={plan.promoUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      aria-label={t(plan.promoLabelKey)}
                      onClick={(event) => event.stopPropagation()}
                      className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-mono font-semibold text-green-400 transition-all hover:border-green-400 hover:bg-green-500/20"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Gift className="h-4 w-4 flex-shrink-0" />
                        {t(plan.promoLabelKey)}
                      </span>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  )}

                  {plan.promoNoteKey && (
                    <p className="mb-4 text-xs text-green-400/80 font-mono leading-relaxed">
                      {t(plan.promoNoteKey)}
                    </p>
                  )}

                  {/* Expandable Features */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-xs text-muted-foreground font-mono mb-2">{t('codeplan.planDetails')}</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start space-x-2 text-sm">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            ) : feature.warning ? (
                              <X className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <span className={feature.warning ? 'text-red-400' : 'text-foreground'}>
                              {translatePlanText(feature.text)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Expand hint */}
                  <div className="flex items-center justify-center mt-4 text-muted-foreground text-xs font-mono">
                    {isExpanded ? (
                      <span>{t('codeplan.clickToCollapse')} <ChevronUp className="h-3 w-3 inline" /></span>
                    ) : (
                      <span>{t('codeplan.clickToExpand')} <ChevronDown className="h-3 w-3 inline" /></span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Comparison CTA - Terminal Style */}
        <div className="mb-12 border border-primary/30 bg-card/80 rounded-lg overflow-hidden">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border">
            <span className="text-xs text-muted-foreground font-mono">// help: {t('codeplan.helpTip')}</span>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm text-muted-foreground mb-2">
                  <span className="text-primary">$</span> if ({t('codeplan.hesitate')}) &#123; use.compare(); &#125;
                </div>
                <h3 className="text-xl font-bold text-foreground font-mono flex items-center gap-2">
                  <Sword className="h-5 w-5 text-primary" />
                  {t('codeplan.compareTitle')}
                </h3>
                <p className="text-muted-foreground font-mono text-sm mt-2">
                  <span className="text-cyan-400">→</span> {t('codeplan.compareDesc')}
                </p>
              </div>
              <Link to={localizePath('/compare', language)}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold px-6 py-3">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {t('codeplan.goCompare')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-card/80 border-border">
            <CardContent className="p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-mono">
                <Sparkles className="h-8 w-8 text-yellow-400 inline mr-2" />
                {t('codeplan.ctaTitle')}
              </h2>
              <p className="text-xl text-muted-foreground mb-8 font-mono">
                {t('codeplan.ctaDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={localizePath('/models', language)}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold px-8 py-3">
                    <Terminal className="mr-2 h-5 w-5" />
                    {t('codeplan.browseModels')}
                  </Button>
                </Link>
                <Link to={localizePath('/compare', language)}>
                  <Button variant="outline" className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono font-bold px-8 py-3">
                    <Code2 className="mr-2 h-5 w-5" />
                    {t('codeplan.compareAnalysis')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
