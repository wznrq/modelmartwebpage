# 模型数据更新记录 - 2026-05-28

本次基于既有大模型数据源重新抓取并落库。已更新 `data/llm-stats/*` 快照，并将可通过官方/权威来源交叉确认的新增模型同步到 `src/data/models.ts`。

## 抓取范围

- 运行 `scripts/scrape_llm_stats.mjs` 抓取 `https://llm-stats.com` 公开索引。
- 复核官方来源：OpenAI API 模型页、Google Gemini API 定价页、xAI Models 文档、阿里云百炼模型列表。
- 汇率沿用系统当前口径：`1 USD ≈ 7.2 CNY`。

## 抓取摘要

| 指标 | 2026-04-30 快照 | 2026-05-28 快照 |
|------|------------------|------------------|
| 抓取时间 | 2026-04-30T10:52:07.740Z | 2026-05-28T07:58:35.275Z |
| 路由总数 | 876 | 1471 |
| 成功路由 | 874 | 1464 |
| 失败路由 | 2 | 7 |
| 模型数 | 296 | 301 |
| 厂商数 | 27 | 27 |

## 本次主表更新

| Provider | 模型 | 价格（CNY / 1M token） | 上下文 | 来源口径 |
|----------|------|------------------------|--------|----------|
| OpenAI | GPT-5.5 | ¥36 / ¥216 | 1.05M | OpenAI API 模型页确认 $5/$30 |
| OpenAI | GPT-5.5 Pro | ¥216 / ¥1296 | 1.05M | OpenAI API 模型页确认 $30/$180 |
| Google | Gemini 3.5 Flash | ¥19.44 / ¥116.64 | 1.048M | Google Gemini API 定价页确认 $2.70/$16.20 |
| xAI | Grok 4.3 | ¥9 / ¥18 | 1M | xAI Models 文档确认 $1.25/$2.50 |
| Alibaba | Qwen3.7 Max | ¥9 / ¥27 | 1M | 阿里百炼公开模型页确认存在，价格使用 llm-stats 抓取 $1.25/$3.75 |
| Alibaba | Qwen3.6 Plus | ¥3.6 / ¥21.6 | 1M | 修正原 0 价格；价格使用 llm-stats 抓取 $0.50/$3 |

## 官方来源索引

- OpenAI GPT-5.5: https://developers.openai.com/api/docs/models/gpt-5.5
- OpenAI GPT-5.5 Pro: https://developers.openai.com/api/docs/models/gpt-5.5-pro
- OpenAI GPT-5.5 发布说明: https://openai.com/index/introducing-gpt-5-5/
- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- xAI Models: https://docs.x.ai/developers/models
- 阿里云百炼模型列表: https://help.aliyun.com/zh/model-studio/models
- llm-stats 抓取源: https://llm-stats.com

## 待后续核验

1. 阿里 `qwen3.7-max` 与 `qwen3.6-plus` 的最终百炼控制台计费分层。
2. OpenAI `chat-latest` / GPT-5.5 Instant 是否需要作为单独 ChatGPT 路由展示，当前未新增 API 主表条目。
3. Google Gemini 3.5 Pro 仍未在官方定价页稳定列出，本次未落主表。
4. xAI Grok 4.20 与 4.1 Fast 旧条目的退休/别名迁移，需要结合 xAI retirement 文档单独清理。
