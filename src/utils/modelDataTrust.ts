export type DataTrustLevel = 'official' | 'verified' | 'aggregated'

interface SourceableModel {
  id: string
  providerId: string
  releaseDate: string
  websiteUrl?: string
}

const DATA_SNAPSHOT_DATE = '2026-04-28'

const providerSourceUrls: Record<string, string> = {
  openai: 'https://platform.openai.com/docs/models',
  anthropic: 'https://docs.anthropic.com/en/docs/about-claude/models',
  google: 'https://ai.google.dev/gemini-api/docs/models',
  meta: 'https://ai.meta.com/llama/',
  mistral: 'https://docs.mistral.ai/getting-started/models/models_overview/',
  amazon: 'https://aws.amazon.com/bedrock/',
  microsoft: 'https://learn.microsoft.com/azure/ai-foundry/openai/concepts/models',
  stability: 'https://platform.stability.ai/docs/getting-started',
  runway: 'https://docs.dev.runwayml.com/',
  midjourney: 'https://docs.midjourney.com/',
  perplexity: 'https://docs.perplexity.ai/getting-started/models/models',
  xai: 'https://docs.x.ai/docs/models',
  baidu: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
  alibaba: 'https://help.aliyun.com/zh/model-studio/getting-started/models',
  tencent: 'https://cloud.tencent.com/document/product/1729',
  zhipu: 'https://docs.bigmodel.cn/cn/guide/models',
  moonshot: 'https://platform.moonshot.cn/docs/pricing/chat',
  minimax: 'https://www.minimaxi.com/document/guides/chat-model/V2',
  xiaomi: 'https://mimo.xiaomi.com/',
  deepseek: 'https://api-docs.deepseek.com/quick_start/pricing',
  bytedance: 'https://www.volcengine.com/docs/82379/1330310',
  sensetime: 'https://platform.sensenova.cn/doc',
  mobvoi: 'https://www.mobvoi.com/',
  iflytek: 'https://www.xfyun.cn/doc/spark/Web.html',
  '360': 'https://ai.360.com/',
  huawei: 'https://support.huaweicloud.com/pangu/',
  yi: 'https://platform.lingyiwanwu.com/docs',
}

export function getModelSourceUrl(model: SourceableModel) {
  return model.websiteUrl || providerSourceUrls[model.providerId] || 'https://modelmart.ai/models'
}

export function getModelDataTrust(model: SourceableModel) {
  const sourceUrl = getModelSourceUrl(model)
  const level: DataTrustLevel = model.websiteUrl ? 'official' : providerSourceUrls[model.providerId] ? 'verified' : 'aggregated'

  return {
    level,
    sourceUrl,
    lastVerified: DATA_SNAPSHOT_DATE,
    releaseDate: model.releaseDate,
  }
}

export function getTrustScore(level: DataTrustLevel) {
  if (level === 'official') return 95
  if (level === 'verified') return 85
  return 70
}
