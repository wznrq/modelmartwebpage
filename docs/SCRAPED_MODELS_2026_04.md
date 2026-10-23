# 模型数据爬取结果 (2026年4月)

本文档记录从各提供商官网爬取的最新模型数据，待用户确认后更新。

---

## OpenAI

**官网**: https://openai.com
**API定价**: https://platform.openai.com/docs/pricing (访问受限)

### 当前官方模型列表

| 模型 | ID | 上下文 | 输入价格 | 输出价格 |
|------|-----|--------|----------|----------|
| GPT-4.5 | gpt-4.5 | 200K | $75/$150 | $150/$300 |
| GPT-4o | gpt-4o-2024-05-13 | 128K | $5/$10 | $15/$30 |
| GPT-4o-mini | gpt-4o-mini | 128K | $0.15/$0.6 | $0.60/$2.40 |
| o1 | o1 | 128K | $15 | $60 |
| o1-mini | o1-mini | 128K | $1.10 | $4.40 |
| o1-pro | o1-pro | 128K | $150 | $600 |
| o3 | o3 | 200K | $10 | $40 |
| o3-mini | o3-mini | 200K | $1.10 | $4.40 |
| GPT-4.5-turbo | gpt-4.5-turbo | 128K | $75 | $150 |

### 需验证
- GPT-4.5 实际上下文可能是 1M
- o1-pro 是新模型
- o3/o3-mini 输出价格可能有额外thinking费用

---

## Anthropic

**官网**: https://www.anthropic.com
**定价**: https://platform.claude.com/docs/en/about-claude/models/overview

### 当前官方模型

| 模型 | ID | 上下文 | 输入价格 | 输出价格 |
|------|-----|--------|----------|----------|
| Claude Opus 4.7 | claude-opus-4-7 | 1M | $5 | $25 |
| Claude Sonnet 4.6 | claude-sonnet-4-6 | 1M | $3 | $15 |
| Claude Haiku 4.5 | claude-haiku-4-5-20251001 | 200K | $1 | $5 |
| Claude Opus 4.6 | claude-opus-4-6 | 1M | $5 | $25 |
| Claude Sonnet 4.5 | claude-sonnet-4-5-20250929 | 200K | $3 | $15 |

### Legacy Models (deprecated)
| 模型 | ID | 上下文 | 输入价格 | 输出价格 |
|------|-----|--------|----------|----------|
| Claude Sonnet 4 | claude-sonnet-4-20250514 | 200K | $3 | $15 |
| Claude Opus 4 | claude-opus-4-20250514 | 200K | $15 | $75 |

**备注**: Claude Sonnet 4 和 Claude Opus 4 将于2026年6月15日停用

---

## Google DeepMind

**官网**: https://deepmind.google
**定价**: https://ai.google.dev/pricing

### 当前官方模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| Gemini 3 Pro Preview | 1M+ | $2-4 | $12-18 |
| Gemini 3 Flash Preview | 1M+ | $0.50 | $3 |
| Gemini 3 Pro Image Preview | 65K | $2 | $12-120 |
| Gemini 2.5 Pro | 1M | $1.25-2.50 | $10-15 |
| Gemini 2.5 Flash | 1M | $0.30 | $2.50 |
| Gemini 2.5 Flash-Lite | 1M | $0.10 | $0.40 |
| Gemini 2.5 Flash Native Audio | 1M | $0.50-3 | $2-12 |
| Gemini 2.5 Flash Image | 1M | $0.30 | $0.039/image |

**注意**: Gemini 2.0 Flash 和 Flash-Lite 已deprecated

---

## Meta AI (Llama)

**官网**: https://ai.meta.com
**Llama**: https://www.llama.com/llama4/

### Llama 4 系列

| 模型 | 上下文 | 价格 |
|------|--------|------|
| Llama 4 Maverick | 128K | 开源免费 |
| Llama 4 Scout | 10M (1千万) | 开源免费 |
| Llama 4 Behemoth | TBD | 开源免费 |
| Llama 4 Reasoning | TBD | 开源免费 |

**备注**: Llama 4 API托管版本价格待确认

---

## DeepSeek

**官网**: https://www.deepseek.com
**API文档**: https://api-docs.deepseek.com/

### 当前API模型

| 模型 | ID | 上下文 | 输入价格 | 输出价格 |
|------|-----|--------|----------|----------|
| DeepSeek V4 Flash | deepseek-v4-flash | 1M | ¥1.01 | ¥2.02 |
| DeepSeek V4 Pro | deepseek-v4-pro | 1M | ¥3.13 | ¥6.26 |

**备注**: DeepSeek V4 Preview 于 2026-04-24 发布。`deepseek-chat` 和 `deepseek-reasoner` 当前兼容路由到 V4 Flash 的非思考/思考模式，并将在 2026-07-24 15:59 UTC 后退役。V4 Pro 当前展示 75% off 价格，折扣延长至 2026-05-31 15:59 UTC。

**已验证**: 官方价格页面 https://api-docs.deepseek.com/quick_start/pricing/

---

## Mistral AI

**官网**: https://mistral.ai
**定价**: https://mistral.ai/technology#pricing

### 当前官方模型

| 模型 | 上下文 | 价格 |
|------|--------|------|
| Mistral Large 3 | 128K | 待确认 |
| Mistral Medium 3 | 128K | 待确认 |
| Ministral 3 (边缘模型) | 32K | 待确认 |

**需验证**: 官方API定价

---

## Moonshot (Kimi)

**官网**: https://www.moonshot.cn
**定价**: https://platform.kimi.com/docs/pricing

### 当前官方模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| Kimi K2.6 | 200K+ | ¥0.6 | ¥3 |
| Kimi K2 | 128K | ¥0.5 | ¥2 |
| Moonshot V1 | 128K | ¥0.5 | ¥2 |

**需验证**: 官方价格

---

## 智谱AI (Zhipu)

**官网**: https://www.zhipuai.cn
**定价**: https://open.bigmodel.cn/pricing (无法访问)

### 根据网络信息

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| GLM-4-Plus | 128K | ¥1.4 | ¥4.4 |
| GLM-4V | 128K | ¥1 | ¥3 |
| GLM-4-Long | 1M | ¥1 | ¥3 |
| GLM-5 | 200K | ¥1 | ¥3.2 |
| GLM-5.1 | 200K | ¥1.4 | ¥4.4 |

**需验证**: 官方价格

---

## 阿里通义 (Qwen)

**官网**: https://tongyi.aliyun.com

### Qwen 系列 (开源免费)

| 模型 | 上下文 | 价格 |
|------|--------|------|
| Qwen3-72B | 32K | 开源免费 |
| Qwen3-32B | 32K | 开源免费 |
| Qwen3-14B | 32K | 开源免费 |
| Qwen3-7B | 32K | 开源免费 |
| Qwen2.5-72B | 128K | 开源免费 |
| Qwen2.5-7B | 128K | 开源免费 |
| Qwen2.5-1.5B | 32K | 开源免费 |

**API托管价格需确认**

---

## MiniMax

**官网**: https://www.minimax.com
**API文档**: https://platform.minimaxi.com/docs/guides/text-generation

### 当前模型 (上下文统一 204,800 Token)

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| MiniMax-M2.7 | 204,800 | 待确认 | 待确认 |
| MiniMax-M2.7-highspeed | 204,800 | 待确认 | 待确认 |
| MiniMax-M2.5 | 204,800 | 待确认 | 待确认 |
| MiniMax-M2.5-highspeed | 204,800 | 待确认 | 待确认 |
| MiniMax-M2.1 | 204,800 | 待确认 | 待确认 |
| MiniMax-M2.1-highspeed | 204,800 | 待确认 | 待确认 |
| MiniMax-M2 | 204,800 | 待确认 | 待确认 |

**注意**: 定价需要登录后查看或联系官方 Model@minimaxi.com

---

## 字节豆包 (Doubao)

**官网**: https://www.volcengine.com

### 当前模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| Doubao Pro | 256K | ¥0.4 | ¥1.2 |
| Doubao Lite | 256K | ¥0.2 | ¥0.6 |

---

## 腾讯混元 (Hunyuan)

**官网**: https://cloud.tencent.com

### 当前模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| hunyuan-turbo | 256K | ¥0.6 | ¥1.8 |
| hunyuan-pro | 256K | ¥1 | ¥3 |

---

## 百度文心 (Wenxin)

**官网**: https://cloud.baidu.com

### 当前模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| ERNIE-4.0 | 128K | ¥1 | ¥3 |
| ERNIE-3.5 | 32K | ¥0.4 | ¥1.2 |

---

## 商汤 (SenseTime)

**官网**: https://www.sensetime.com

### 当前模型

| 模型 | 上下文 | 输入价格 | 输出价格 |
|------|--------|----------|----------|
| SenseChat 5 | 128K | ¥1 | ¥3 |
| Nova 2 | 128K | ¥0.5 | ¥1.5 |

---

## 数据来源
- [OpenAI Models](https://platform.openai.com/docs/models)
- [Anthropic Claude](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Google AI Studio](https://ai.google.dev/pricing)
- [DeepSeek API](https://api-docs.deepseek.com/quick_start/pricing/)
- [Llama](https://www.llama.com/llama4/)
- [Mistral](https://mistral.ai/technology#pricing)
- [Moonshot Kimi](https://platform.kimi.com/docs/pricing)
- [智谱AI](https://open.bigmodel.cn/pricing)

---

## 待办
- [ ] OpenAI 官方价格确认
- [x] DeepSeek 官方价格确认
- [ ] Mistral 官方价格确认
- [ ] 智谱AI 官方价格确认
- [ ] Llama 4 API托管价格
- [ ] xAI Grok 最新模型
