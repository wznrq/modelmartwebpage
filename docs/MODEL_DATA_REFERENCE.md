# AI 模型数据文档

## 数据来源

- `src/data/models.ts` - 模型数据定义

## 数据结构

### ModelProvider 接口
```typescript
interface ModelProvider {
  id: string;           // 提供商唯一标识
  name: string;         // 显示名称
  logo: string;        // Logo 路径
  country: 'domestic' | 'international';  // 国内/国际
  description: string; // 描述
}
```

### AIModel 接口
```typescript
interface AIModel {
  id: string;           // 模型唯一标识
  providerId: string;  // 关联的提供商 ID
  name: string;        // 模型名称
  version: string;     // 版本
  type: 'chat' | 'code' | 'image' | 'multimodal' | 'audio' | 'embedding' | 'moderation';  // 类型
  pricing: {
    input: number;   // 输入价格 (CNY per 1M tokens)
    output: number;  // 输出价格 (CNY per 1M tokens)
  };
  performance: {
    contextWindow: number;  // 上下文窗口 (tokens)
    maxOutput: number;     // 最大输出 (tokens)
    latency: number;       // 延迟 (ms)
    accuracy: number;       // 准确率 (%)
  };
  features: string[];      // 功能特性
  releaseDate: string;     // 发布日期
  websiteUrl?: string;     // 官网链接
}
```

## 提供商列表

### 国际提供商 (12)

| ID | 名称 | Logo | 描述 |
|----|------|------|------|
| openai | OpenAI | /logos/openai.svg | 全球领先的AI研究机构 |
| anthropic | Anthropic | /logos/anthropic.svg | 安全可靠的AI系统 |
| google | Google DeepMind | /logos/google.svg | 谷歌旗下人工智能实验室 |
| meta | Meta AI | /logos/meta.svg | 开源大模型领导者 |
| mistral | Mistral AI | /logos/mistral.svg | 欧洲AI初创公司，专注于开源模型 |
| amazon | Amazon AWS | /logos/amazon.svg | 亚马逊云服务AI平台 |
| microsoft | Microsoft Azure | /logos/microsoft.svg | 微软Azure AI服务 |
| stability | Stability AI | /logos/stability.svg | 开源图像生成模型领导者 |
| runway | Runway | /logos/runway.svg | AI视频生成和编辑平台 |
| midjourney | Midjourney | /logos/midjourney.svg | AI图像生成领先平台 |
| perplexity | Perplexity | /logos/perplexity.svg | AI搜索引擎创新者 |
| xai | xAI | /logos/xai.svg | 马斯克旗下AI公司 |

### 国内提供商 (15)

| ID | 名称 | Logo | 描述 |
|----|------|------|------|
| baidu | 百度文心 | /logos/baidu.svg | 中国领先的人工智能平台 |
| alibaba | 阿里通义 | /logos/alibaba.svg | 阿里巴巴集团AI品牌 |
| tencent | 腾讯混元 | /logos/tencent.svg | 腾讯全链路自研大语言模型 |
| zhipu | 智谱AI | /logos/zhipu.svg | 清华大学孵化的人工智能企业 |
| moonshot | 月之暗面 Moonshot AI | /logos/moonshot.svg | 中国领先的大语言模型初创公司 |
| minimax | MiniMax | /logos/minimax.svg | 通用人工智能领军企业 |
| xiaomi | Xiaomi MiMo | /logos/xiaomi.svg | 小米自研通用大模型与多模态智能平台 |
| deepseek | DeepSeek 深度求索 | /logos/deepseek.svg | 中国领先的开源大模型研究团队 |
| bytedance | 字节豆包 ByteDance | /logos/bytedance.svg | 字节跳动AI大模型产品 |
| sensetime | 商汤 SenseTime | /logos/sensetime.svg | 计算机视觉和AI领域的领先企业 |
| mobvoi | 出门问问 Mobvoi | /logos/mobvoi.svg | 中国AI语音交互和生成式AI公司 |
| iflytek | 讯飞 iFlytek | /logos/iflytek.svg | 中国智能语音和AI领导者 |
| huawei | 华为云 盘古 | /logos/huawei.svg | 华为云AI大模型服务 |
| 360 | 360 智脑 | /logos/360.svg | 360安全大脑AI模型 |
| yi | 零一万物 Yi | /logos/yi.svg | 中国大模型创业公司 |

## 模型统计

- **Provider 总数**: 27 (12 国际 + 15 国内)
- **模型总数**: 110

## 官方数据核验结论（2026-04-28）

本页是 `src/data/models.ts` 的系统数据快照，不等同于“全部已由官方逐项确认”的模型目录。官方模型列表和价格会频繁变化；凡未能在厂商官方模型页或官方价格页确认的条目，在产品、对外文案和后续数据同步中应按“未核验/占位/平台别名”处理。

| Provider | 核验结论 | 需要修正的文档口径 |
|----------|----------|--------------------|
| OpenAI | 已修复 | 系统数据已更新为官方可确认的 GPT-5.4、GPT-5.4 Pro、GPT-5.4 mini、GPT-5.4 nano 口径；GPT-5.5 已发布但 API 可用性/价格表待官方文档落地，暂不进入系统价格表。 |
| Anthropic | 已修复 | 系统数据已更新为 Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6、Claude Haiku 4.5、Claude Sonnet 4.5；4.7/4.6 按官方发布页与 Claude API 模型页核验。 |
| Google Gemini | 已修复 | 系统数据已更新为 Gemini 3 Pro Preview、Gemini 3 Flash Preview、Gemini 3 Pro Image Preview，并保留 Gemini 2.5 Pro/Flash。 |
| Mistral AI | 已修复 | 系统数据已更新为 Mistral Small 4、Mistral Large 3、Mistral Medium 3.1、Leanstral，价格和上下文按官方模型/价格页归一化。 |
| xAI | 已修复 | 系统数据已改为 Grok 4.20、Grok 4.1 Fast、Grok 4；价格仍需以 xAI Console 对账户显示为准。 |
| DeepSeek | 已修复 | 系统数据已更新为 DeepSeek V4 Preview 官方 API ID `deepseek-v4-flash` 和 `deepseek-v4-pro`；旧 `deepseek-chat` / `deepseek-reasoner` 仅作为兼容路由，官方已公告未来退役。 |
| Xiaomi MiMo | 新增 | 系统数据已加入 MiMo-V2.5-Pro、MiMo-V2.5、MiMo-V2-Pro、MiMo-V2-Omni、MiMo-V2-Flash。官方页可确认 V2.5 系列、开源权重、1M 上下文和 Token Plan 倍率；V2-Pro 官方页可确认 $1/$3 与 256K-1M 翻倍阶梯。V2.5/Omni/Flash token 单价按公开价格索引交叉核验，后续需以小米 API 控制台账单为最终口径。 |
| Perplexity | 已修复/复合计费 | 系统数据已加入 Sonar Reasoning Pro、Sonar Deep Research；官方 Sonar API 还按搜索上下文请求、citation/reasoning/search query 等单独计费，当前表格只保留 token 主价。 |
| Amazon AWS / Microsoft Azure | 已修复/平台托管口径 | Bedrock 已更新 Claude Opus 4.7、Amazon Nova 2 Lite/Premier；Azure 已更新 GPT-5.4 系列与 Phi-4 Reasoning。平台可用性和区域价格仍以云厂商页面为准。 |
| Runway / Midjourney / Stability | 已修复/非纯 token 计费 | Runway 已更新 Gen-4.5，Midjourney 已更新 V8.1 Alpha，Stability 已更新 Stable Diffusion 3.5 系列；视频/图片模型多按秒、图片、积分或订阅计费，CNY 字段是归一化展示。 |
| 国内厂商 | 部分需登录或控制台核验 | 阿里云百炼、腾讯混元、Kimi、DeepSeek、Xiaomi MiMo 已同步最新公开模型名/价格口径；百度、商汤、出门问问、讯飞、360、华为、Yi 等部分公开页不足以核验所有价格，保留为“公开资料/控制台待核验”。 |

官方来源索引见 [MODEL_SOURCES.md](./MODEL_SOURCES.md)。

## 各提供商模型详情

### OpenAI (29)

**当前在用模型:**
| 模型 ID | 名称 | 类型 | 说明 |
|---------|------|------|------|
| gpt-5.4 | GPT-5.4 | multimodal | 最新 API 旗舰 |
| gpt-5.4-pro | GPT-5.4 Pro | multimodal | 专业版旗舰 |
| gpt-5.4-mini | GPT-5.4 mini | multimodal | 低成本多模态 |
| gpt-5.4-nano | GPT-5.4 nano | multimodal | 最快最经济 |
| gpt-5-mini | GPT-5 mini | multimodal | 低延迟高容量 |
| gpt-5-nano | GPT-5 nano | multimodal | 最快最经济 |
| gpt-5 | GPT-5 | chat | 可配置推理 |
| gpt-4.1 | GPT-4.1 | chat | 最智能非推理模型 |
| chatgpt-image-latest | ChatGPT Image Latest | image | ChatGPT 图像模型 |
| gpt-image-1.5 | GPT Image 1.5 | image | 上一代图像 |
| gpt-5.2-codex | GPT-5.2 Codex | code | 代理编码 |
| gpt-5.2 | GPT-5.2 | chat | 前代旗舰 |
| gpt-5.1 | GPT-5.1 | chat | 代理编码 |
| gpt-5-pro | GPT-5 Pro | chat | 专业版 |
| gpt-5.2-pro | GPT-5.2 Pro | chat | 专业版 |
| o3-pro | o3 Pro | chat | 更强推理 |
| o3 | o3 | chat | 复杂推理 |
| gpt-oss-120b | GPT-OSS-120B | chat | 开源权重(Apache 2.0) |
| gpt-oss-20b | GPT-OSS-20B | chat | 中型开源模型 |
| gpt-4.1-mini | GPT-4.1 mini | chat | 小版本 |
| gpt-realtime | GPT Realtime | audio | 实时语音输入输出 |
| gpt-audio | GPT Audio | audio | 语音输入输出 |
| gpt-4o-transcribe | GPT-4o Transcribe | audio | 语音转文字 |
| gpt-4o-transcribe-diarize | GPT-4o Diarize | audio | 说话人识别 |
| tts-1 | TTS-1 | audio | 快速语音合成 |
| tts-1-hd | TTS-1 HD | audio | 高质量语音 |
| whisper-1 | Whisper-1 | audio | 语音识别 |
| omni-moderation-latest | Omni Moderation | moderation | 内容审核 |
| text-embedding-3-large | Embedding 3 Large | embedding | 最强嵌入 |
| text-embedding-3-small | Embedding 3 Small | embedding | 小型嵌入 |

**已废弃模型:**
gpt-4.5, gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, o1, o1-mini, o1-pro, o3-mini, o4-mini, dall-e-3, dall-e-2, sora-2, gpt-image-1, whisper-2

### Anthropic (5)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Claude Opus 4.7 | 4.7 | chat | ¥36 | ¥180 | 1M | 最新旗舰、最高智能、复杂推理 |
| Claude Opus 4.6 | 4.6 | chat | ¥36 | ¥180 | 1M beta | 最高智能、顶级推理、复杂分析 |
| Claude Sonnet 4.6 | 4.6 | chat | ¥21.6 | ¥108 | 1M beta | 平衡性能、快速响应、高性价比 |
| Claude Haiku 4.5 | 4.5 | chat | ¥7.2 | ¥36 | 200K | 极速响应、高性价比、轻量级 |
| Claude Sonnet 4.5 | 4.5 | chat | ¥21.6 | ¥108 | 1M beta | 高级推理、代码能力 |

### Google DeepMind (5)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Gemini 3 Pro Preview | 3.0 | multimodal | ¥14.4 | ¥86.4 | 1M | 官方 Preview 旗舰 |
| Gemini 3 Flash Preview | 3.0 | multimodal | ¥3.6 | ¥21.6 | 1M | 高性价比、快速响应 |
| Gemini 3 Pro Image Preview | 3.0 | image | ¥14.4 | ¥86.4 | 65K | 图像生成、多模态 |
| Gemini 2.5 Pro | 2.5 | multimodal | ¥9 | ¥72 | 1M | 高性能、百万级上下文 |
| Gemini 2.5 Flash | 2.5 | multimodal | ¥2.16 | ¥18 | 1M | 高性价比、快速响应 |

### Meta AI (5)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Llama 4 Maverick | 4.0 | multimodal | 免费 | 免费 | 1M | 开源免费、多模态 |
| Llama 4 Scout | 4.0 | multimodal | 免费 | 免费 | 10M | 开源免费、超长上下文 |
| Llama 3.3 70B | 3.3 | chat | 免费 | 免费 | 128K | 开源、70B参数、多语言 |
| Llama 3.1 70B | 3.1 | chat | 免费 | 免费 | 128K | 开源、70B参数 |
| Llama 3.1 8B | 3.1 | chat | 免费 | 免费 | 128K | 开源、轻量快速 |

### Mistral AI (4)

> 官方模型页已更新到 Mistral Small 4、Mistral Large 3、Mistral Medium 3.1、Leanstral 等。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Mistral Small 4 | 26.03 | multimodal | ¥1.08 | ¥4.32 | 256K | 开源、多模态、高性价比 |
| Mistral Large 3 | 25.12 | multimodal | ¥3.6 | ¥10.8 | 256K | 开源、多模态、顶级推理 |
| Mistral Medium 3.1 | 3.1 | chat | ¥2.88 | ¥14.4 | 128K | 高性价比、快速响应 |
| Leanstral | 26.03 | code | 免费 | 免费 | 256K | 开源、代码生成 |

### xAI (3)

> xAI 的团队可用模型和价格可能随 Console 权限变化，以下为公开文档可确认模型口径。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Grok 4.20 | 4.20 | chat | ¥14.4 | ¥43.2 | 2M | 最新旗舰、推理能力 |
| Grok 4.1 Fast | 4.1 | chat | ¥1.44 | ¥3.6 | 2M | 快速响应、高性价比 |
| Grok 4 | 4.0 | chat | ¥21.6 | ¥108 | 256K | 推理能力、工具调用 |

### Amazon AWS (3)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Claude Opus 4.7 (Bedrock) | 4.7 | chat | ¥36 | ¥180 | 1M | AWS托管、企业级安全 |
| Amazon Nova 2 Lite | 2.0 | multimodal | 平台价 | 平台价 | 300K | AWS原生、多模态 |
| Amazon Nova Premier | 1.0 | multimodal | 平台价 | 平台价 | 1M | AWS原生、复杂推理 |

### Microsoft Azure (4)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| GPT-5.4 (Azure) | 5.4 | multimodal | ¥18 | ¥108 | 1.05M | Azure托管、企业级安全 |
| GPT-5.4 mini (Azure) | 5.4 | multimodal | ¥5.4 | ¥32.4 | 400K | 快速响应、高性价比 |
| GPT-5.4 nano (Azure) | 5.4 | multimodal | ¥1.44 | ¥9 | 400K | 最经济、极速响应 |
| Phi-4 Reasoning | 4.0 | chat | 免费/平台价 | 免费/平台价 | 32K | 轻量级、推理能力 |

### DeepSeek (2)

> DeepSeek V4 Preview 于 2026-04-24 发布，官方 API ID 是 `deepseek-v4-flash` 和 `deepseek-v4-pro`，两者均支持 1M context 与 Thinking / Non-Thinking 双模式。`deepseek-chat` / `deepseek-reasoner` 当前兼容路由到 V4 Flash 非思考/思考模式，并将在 2026-07-24 15:59 UTC 后退役。V4 Pro 当前 75% off 价格延长至 2026-05-31 15:59 UTC。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| DeepSeek V4 Flash | V4 Preview | chat | ¥1.01 | ¥2.02 | 1M | 高性价比、快速响应、双模式 |
| DeepSeek V4 Pro | V4 Preview | chat | ¥3.13 | ¥6.26 | 1M | 最新旗舰、推理能力、双模式 |

### Xiaomi MiMo (5)

> MiMo-V2.5-Pro 与 MiMo-V2-Pro 有长上下文阶梯价：up to 256K 按 $1/$3 per 1M tokens，256K-1M 按 $2/$6 per 1M tokens。系统主表展示基础档价格；Token Plan 中 MiMo-V2.5 为 1x，MiMo-V2.5-Pro 为 2x。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| MiMo-V2.5-Pro | 2.5-Pro | code | ¥7.2 | ¥21.6 | 1M | 代理编码、复杂任务、开源权重 |
| MiMo-V2.5 | 2.5 | multimodal | ¥2.88 | ¥14.4 | 1M | 多模态、图像/视频/音频理解 |
| MiMo-V2-Pro | 2-Pro | code | ¥7.2 | ¥21.6 | 1M | 代理任务、代码能力、函数调用 |
| MiMo-V2-Omni | 2-Omni | multimodal | ¥2.88 | ¥14.4 | 262K | 多模态、音视频理解、函数调用 |
| MiMo-V2-Flash | 2-Flash | chat | ¥0.65 | ¥2.09 | 262K | 高性价比、极速响应、开源 |

### Moonshot 月之暗面 (3)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Kimi K2.6 | 2.6 | multimodal | ¥6.5 | ¥27 | 256K | 最新旗舰、代码能力、多模态 |
| Kimi K2.5 | 2.5 | multimodal | ¥4 | ¥21 | 256K | 视觉理解、Agent、思考模式 |
| Moonshot v1 128K Vision Preview | 1.0 | multimodal | ¥12 | ¥12 | 128K | 视觉理解、长文档处理 |

### ByteDance 字节 (2)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 豆包 Doubao Pro | 2.0 | chat | ¥2.88 | ¥8.64 | 256K | 256K上下文、抖音生态 |
| 豆包 Doubao Lite | 2.0 | chat | ¥1.44 | ¥4.32 | 256K | 轻量快速、极高性价比 |

### 商汤 SenseTime (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| SenseChat 5 | 5.0 | chat | ¥7.2 | ¥21.6 | 128K | 128K上下文、高级推理 |

### 讯飞 iFlytek (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 星火大模型 v4.0 | 4.0 | chat | ¥7.2 | ¥21.6 | 128K | 语音交互、认知智能 |

### 360 智脑 (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 360 智脑大模型 6.0 | 6.0 | chat | ¥4.32 | ¥14.4 | 128K | 安全大脑、搜索增强 |

### 华为云 盘古 (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 盘古大模型 5.0 | 5.0 | chat | ¥7.2 | ¥21.6 | 128K | 华为自研、昇腾AI加速 |

### 百度 (2)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 文心 ERNIE 4.5 | 4.5 | multimodal | 待控制台核验 | 待控制台核验 | 128K | 高级推理、知识增强 |
| 文心 ERNIE X1 | 1.0 | chat | 待控制台核验 | 待控制台核验 | 128K | 推理能力、复杂问题解决 |

### 阿里通义 (7)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Qwen3 Max | 3.0 | chat | ¥8.64 | ¥25.92 | 1M | 百万级上下文、顶级推理 |
| Qwen3.6 Plus | 3.6 | multimodal | Credits/控制台价 | Credits/控制台价 | 1M | 代码 Agent、多模态 |
| Qwen3 Coder Plus | 3.0 | code | ¥7.339 起 | ¥36.696 起 | 1M | 代码生成、架构设计 |
| Qwen3 VL Plus | 3.0 | multimodal | ¥1.5 | ¥4.5 | 128K | 多模态、图像理解 |
| Qwen3 Omni Flash | 3.0 | multimodal | ¥3.156 | ¥27.962 | 128K | 多模态、音频理解 |
| Qwen Plus | 3.0 | chat | ¥0.8 | ¥2 | 128K | 128K上下文、高性价比 |
| Qwen3-72B | 3.0 | chat | 免费 | 免费 | 32K | 开源免费、72B参数 |

### 智谱 AI (4)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| GLM-5 | 5.0 | chat | ¥7.2 | ¥23 | 200K | 200K上下文、高级推理 |
| GLM-4-Plus | 4.0 | chat | ¥10.08 | ¥31.68 | 128K | 128K上下文、高级推理 |
| GLM-4-Vision | 4.0 | multimodal | ¥7.2 | ¥21.6 | 128K | 多模态、图像理解 |
| GLM-4-Long | 4.0 | chat | ¥7.2 | ¥21.6 | 1M | 百万级上下文、长文档处理 |

### MiniMax (4)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| MiniMax-M2.7 | 2.7 | chat | 待确认 | 待确认 | 204K | 200K上下文、高智能 |
| MiniMax-M2.7-highspeed | 2.7 | chat | 待确认 | 待确认 | 204K | 200K上下文、极速响应 |
| MiniMax-M2.5 | 2.5 | chat | 待确认 | 待确认 | 204K | 200K上下文、高智能 |
| MiniMax-M2 | 2.0 | chat | 待确认 | 待确认 | 204K | 200K上下文、基础对话 |

### 腾讯混元 (6)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 腾讯混元 2.0 Think | 2.0 | chat | ¥5.3 | ¥21.2 | 128K | 推理增强、混元 2.0 系列 |
| 腾讯混元 2.0 Instruct | 2.0 | chat | ¥4.505 | ¥11.13 | 128K | 指令遵循、混元 2.0 系列 |
| 混元 Turbo | 2.0 | chat | ¥4.32 | ¥12.96 | 256K | 256K上下文、快速响应 |
| 混元 Pro | 2.0 | chat | ¥7.2 | ¥21.6 | 256K | 256K上下文、高级推理 |
| 混元 Standard | 1.0 | chat | ¥4.3 | ¥13 | 256K | 256K上下文、高性价比 |
| 混元 Lite | 1.0 | chat | ¥1.44 | ¥4.32 | 32K | 轻量快速、极高性价比 |

### Stability AI (3)

| 模型 | 版本 | 类型 | 输入 | 输出 | 特性 |
|------|------|------|------|------|------|
| Stable Diffusion 3.5 Large | 3.5 | image | 开源/平台价 | - | 图像生成、文字渲染、高一致性 |
| Stable Diffusion 3.5 Large Turbo | 3.5 | image | 开源/平台价 | - | 图像生成、高效生成 |
| Stable Diffusion 3.5 Medium | 3.5 | image | 开源/平台价 | - | 图像生成、开源 |

### Runway (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 特性 |
|------|------|------|------|------|------|
| Gen-4.5 | 4.5 | image | 积分/秒 | - | 视频生成、电影级质量 |

### Midjourney (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 特性 |
|------|------|------|------|------|------|
| Midjourney V8.1 Alpha | 8.1-alpha | image | 订阅/GPU分钟 | - | 艺术图像、高保真 |

### Perplexity (4)

> 官方 Sonar API 需要同时计算 token 价格和搜索上下文请求费，下表是系统归一化估算，不代表完整官方账单。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Sonar | 1.0 | chat | ¥7.2 | ¥7.2 | 128K | AI搜索、实时信息 |
| Sonar Pro | 1.0 | chat | ¥21.6 | ¥108 | 128K | AI搜索Pro、深度搜索 |
| Sonar Reasoning Pro | 1.0 | chat | ¥14.4 | ¥57.6 | 128K | 推理能力、搜索增强 |
| Sonar Deep Research | 1.0 | chat | ¥14.4 | ¥57.6 | 128K | 深度搜索、学术研究 |

### 出门问问 Mobvoi (1)

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| 奇点LME 2.0 | 2.0 | chat | ¥4.32 | ¥14.4 | 32K | 语音交互、中文场景 |

### 零一万物 Yi (3)

> 当前公开页不足以核验 Yi API 的所有在售价格，`Yi-34B` 作为开源/历史模型按免费展示。

| 模型 | 版本 | 类型 | 输入 | 输出 | 上下文 | 特性 |
|------|------|------|------|------|--------|------|
| Yi-Large | 2.0 | chat | ¥14.4 | ¥43.2 | 128K | 长上下文、高级推理 |
| Yi-Large-Turbo | 2.0 | chat | ¥7.2 | ¥21.6 | 128K | 高吞吐、低延迟 |
| Yi-34B | 1.0 | chat | 免费 | 免费 | 32K | 开源、34B 参数 |

## 待确认事项

### 1. 已替换的未核验型号
OpenAI 已更新到官方 GPT-5.4 系列；Anthropic 已更新到官方 Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5 系列；DeepSeek 已更新为 V4 Preview 官方 API ID，旧兼容 ID 不再作为系统主表模型展示。

### 2. MiniMax 价格待确认
MiniMax 的 4 个模型价格都标记为“待确认”，需要官方确认。

### 3. 非 token 计费模型需单独展示单位
Runway、Midjourney、Stability、Perplexity Sonar 搜索请求费等不能仅用 `input/output CNY per 1M tokens` 表示完整成本。

## 汇率说明

默认汇率: 1 USD ≈ 7.2 CNY (2026年4月)

部分国内模型直接使用人民币定价。
