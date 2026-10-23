import { translations, type Language, type Translation } from '@/i18n/translations'
import type { ModelType } from '@/types/domain/model'

const providerNameTranslations: Record<string, Partial<Record<Language, string>>> = {
  baidu: {
    'zh-CN': '百度文心',
    'zh-TW': '百度文心',
    en: 'Baidu ERNIE',
  },
  alibaba: {
    'zh-CN': '阿里通义',
    'zh-TW': '阿里通義',
    en: 'Alibaba Qwen',
  },
  tencent: {
    'zh-CN': '腾讯混元',
    'zh-TW': '騰訊混元',
    en: 'Tencent Hunyuan',
  },
  zhipu: {
    'zh-CN': '智谱AI',
    'zh-TW': '智譜AI',
    en: 'Zhipu AI',
  },
  moonshot: {
    'zh-CN': '月之暗面 Moonshot AI',
    'zh-TW': '月之暗面 Moonshot AI',
    en: 'Moonshot AI',
  },
  xiaomi: {
    'zh-CN': '小米 MiMo',
    'zh-TW': '小米 MiMo',
    en: 'Xiaomi MiMo',
  },
  deepseek: {
    'zh-CN': 'DeepSeek 深度求索',
    'zh-TW': 'DeepSeek 深度求索',
    en: 'DeepSeek',
  },
  bytedance: {
    'zh-CN': '字节豆包 ByteDance',
    'zh-TW': '字節豆包 ByteDance',
    en: 'ByteDance Doubao',
  },
  sensetime: {
    'zh-CN': '商汤 SenseTime',
    'zh-TW': '商湯 SenseTime',
    en: 'SenseTime',
  },
  mobvoi: {
    'zh-CN': '出门问问 Mobvoi',
    'zh-TW': '出門問問 Mobvoi',
    en: 'Mobvoi',
  },
  iflytek: {
    'zh-CN': '讯飞 iFlytek',
    'zh-TW': '訊飛 iFlytek',
    en: 'iFlytek',
  },
  huawei: {
    'zh-CN': '华为云 盘古',
    'zh-TW': '華為雲 盤古',
    en: 'Huawei Cloud Pangu',
  },
  yi: {
    'zh-CN': '零一万物 Yi',
    'zh-TW': '零一萬物 Yi',
    en: '01.AI Yi',
  },
}

const zhCnTranslations = translations['zh-CN'] as Record<string, string>

const featureKeyBySourceText = Object.entries(zhCnTranslations).reduce<Record<string, string>>(
  (acc, [key, value]) => {
    if (key.startsWith('models.feature.')) {
      acc[value] = key
    }
    return acc
  },
  {},
)

export function translateModelFeature(feature: string, t: Translation) {
  const key = featureKeyBySourceText[feature]
  return key ? t(key) : feature
}

export function translateModelType(type: ModelType, t: Translation) {
  return t(`models.type.${type}`)
}

export function getProviderDisplayName(
  providerId: string,
  fallbackName: string,
  language: Language,
) {
  return providerNameTranslations[providerId]?.[language] || fallbackName
}

export function getProviderDescription(
  providerId: string,
  fallbackDescription: string,
  t: Translation,
) {
  const description = t(`provider.${providerId}.desc`)
  return description === `provider.${providerId}.desc` ? fallbackDescription : description
}
