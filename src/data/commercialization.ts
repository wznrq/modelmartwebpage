export type PartnershipRoute =
  | 'channel_partner'
  | 'marketplace'
  | 'partner_program'
  | 'byok'
  | 'bd_required'
  | 'open_weights'

export type PartnershipPriority = 'high' | 'medium' | 'low'
export type PartnershipStatus = 'ready' | 'apply' | 'bd' | 'research'
export type PartnershipRiskLevel = 'low' | 'medium' | 'high'

export interface CommercialPlan {
  id: 'free' | 'pro' | 'team' | 'enterprise'
  nameKey: string
  priceKey: string
  descriptionKey: string
  features: string[]
  highlighted?: boolean
}

export interface TargetSegment {
  id: string
  titleKey: string
  descriptionKey: string
  monthlySpendKey: string
}

export interface ProviderPartnership {
  providerId: string
  route: PartnershipRoute
  priority: PartnershipPriority
  status: PartnershipStatus
  partnerUrl: string
  riskLevel: PartnershipRiskLevel
  ctaLabel: string
  notes: string
}

export interface GoToMarketMilestone {
  day: string
  titleKey: string
  descriptionKey: string
  metricKey: string
}

export const commercialPlans: CommercialPlan[] = [
  {
    id: 'free',
    nameKey: 'business.plan.free.name',
    priceKey: 'business.plan.free.price',
    descriptionKey: 'business.plan.free.desc',
    features: [
      'business.plan.free.feature1',
      'business.plan.free.feature2',
      'business.plan.free.feature3',
    ],
  },
  {
    id: 'pro',
    nameKey: 'business.plan.pro.name',
    priceKey: 'business.plan.pro.price',
    descriptionKey: 'business.plan.pro.desc',
    features: [
      'business.plan.pro.feature1',
      'business.plan.pro.feature2',
      'business.plan.pro.feature3',
    ],
  },
  {
    id: 'team',
    nameKey: 'business.plan.team.name',
    priceKey: 'business.plan.team.price',
    descriptionKey: 'business.plan.team.desc',
    highlighted: true,
    features: [
      'business.plan.team.feature1',
      'business.plan.team.feature2',
      'business.plan.team.feature3',
      'business.plan.team.feature4',
    ],
  },
  {
    id: 'enterprise',
    nameKey: 'business.plan.enterprise.name',
    priceKey: 'business.plan.enterprise.price',
    descriptionKey: 'business.plan.enterprise.desc',
    features: [
      'business.plan.enterprise.feature1',
      'business.plan.enterprise.feature2',
      'business.plan.enterprise.feature3',
      'business.plan.enterprise.feature4',
    ],
  },
]

export const targetSegments: TargetSegment[] = [
  {
    id: 'ai-startups',
    titleKey: 'business.segment.startup.title',
    descriptionKey: 'business.segment.startup.desc',
    monthlySpendKey: 'business.segment.spend.mid',
  },
  {
    id: 'product-teams',
    titleKey: 'business.segment.product.title',
    descriptionKey: 'business.segment.product.desc',
    monthlySpendKey: 'business.segment.spend.high',
  },
  {
    id: 'integrators',
    titleKey: 'business.segment.integrator.title',
    descriptionKey: 'business.segment.integrator.desc',
    monthlySpendKey: 'business.segment.spend.variable',
  },
]

export const providerPartnerships: ProviderPartnership[] = [
  {
    providerId: 'alibaba',
    route: 'channel_partner',
    priority: 'high',
    status: 'apply',
    partnerUrl: 'https://partner.aliyun.com/',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.apply',
    notes: 'business.partner.notes.alibaba',
  },
  {
    providerId: 'tencent',
    route: 'channel_partner',
    priority: 'high',
    status: 'apply',
    partnerUrl: 'https://partner.cloud.tencent.com/',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.apply',
    notes: 'business.partner.notes.tencent',
  },
  {
    providerId: 'baidu',
    route: 'channel_partner',
    priority: 'high',
    status: 'apply',
    partnerUrl: 'https://cloud.baidu.com/partner/index.html',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.apply',
    notes: 'business.partner.notes.baidu',
  },
  {
    providerId: 'huawei',
    route: 'channel_partner',
    priority: 'high',
    status: 'apply',
    partnerUrl: 'https://www.huaweicloud.com/intl/zh-cn/partners/',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.apply',
    notes: 'business.partner.notes.huawei',
  },
  {
    providerId: 'mistral',
    route: 'partner_program',
    priority: 'medium',
    status: 'bd',
    partnerUrl: 'https://mistral.ai/partners',
    riskLevel: 'medium',
    ctaLabel: 'business.partner.cta.bd',
    notes: 'business.partner.notes.mistral',
  },
  {
    providerId: 'microsoft',
    route: 'marketplace',
    priority: 'medium',
    status: 'ready',
    partnerUrl: 'https://azure.microsoft.com/en-us/products/ai-model-catalog/',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.marketplace',
    notes: 'business.partner.notes.azure',
  },
  {
    providerId: 'google',
    route: 'marketplace',
    priority: 'medium',
    status: 'ready',
    partnerUrl: 'https://cloud.google.com/marketplace',
    riskLevel: 'medium',
    ctaLabel: 'business.partner.cta.marketplace',
    notes: 'business.partner.notes.google',
  },
  {
    providerId: 'amazon',
    route: 'marketplace',
    priority: 'medium',
    status: 'ready',
    partnerUrl: 'https://aws.amazon.com/bedrock/model-choice/',
    riskLevel: 'low',
    ctaLabel: 'business.partner.cta.marketplace',
    notes: 'business.partner.notes.aws',
  },
  {
    providerId: 'openai',
    route: 'byok',
    priority: 'medium',
    status: 'ready',
    partnerUrl: 'https://openai.com/policies/services-agreement/',
    riskLevel: 'high',
    ctaLabel: 'business.partner.cta.byok',
    notes: 'business.partner.notes.openai',
  },
  {
    providerId: 'anthropic',
    route: 'byok',
    priority: 'medium',
    status: 'ready',
    partnerUrl: 'https://support.anthropic.com/en/articles/8114521-how-can-i-access-the-anthropic-api',
    riskLevel: 'high',
    ctaLabel: 'business.partner.cta.byok',
    notes: 'business.partner.notes.anthropic',
  },
  {
    providerId: 'meta',
    route: 'open_weights',
    priority: 'low',
    status: 'research',
    partnerUrl: 'https://ai.meta.com/llama/',
    riskLevel: 'medium',
    ctaLabel: 'business.partner.cta.openWeights',
    notes: 'business.partner.notes.meta',
  },
]

export const goToMarketMilestones: GoToMarketMilestone[] = [
  {
    day: '30',
    titleKey: 'business.milestone.30.title',
    descriptionKey: 'business.milestone.30.desc',
    metricKey: 'business.milestone.30.metric',
  },
  {
    day: '60',
    titleKey: 'business.milestone.60.title',
    descriptionKey: 'business.milestone.60.desc',
    metricKey: 'business.milestone.60.metric',
  },
  {
    day: '90',
    titleKey: 'business.milestone.90.title',
    descriptionKey: 'business.milestone.90.desc',
    metricKey: 'business.milestone.90.metric',
  },
]
