# 模型数据抓取待确认包 - 2026-04-30

本次只做数据源跟进和待确认整理，未更新 `src/data/models.ts`。本抓取包可推送远端并部署为数据源快照，但不会改变线上模型列表、价格卡片或首页推荐内容；后续确认后再进入数据落库、i18n、sitemap 构建和模型数据发布流程。

## 抓取范围

- 运行 `scripts/scrape_llm_stats.mjs` 抓取 `https://llm-stats.com` 公开索引。
- 复核官方价格/模型页：OpenAI、Anthropic、Google Gemini、DeepSeek、Kimi、阿里百炼、Cursor、Claude、ChatGPT、Google AI 订阅页。
- 汇率沿用系统当前口径：`1 USD ≈ 7.2 CNY`。

## 抓取产物

| 文件 | 说明 |
|------|------|
| `data/llm-stats/summary.json` | 抓取摘要 |
| `data/llm-stats/models.json` | 第三方模型索引原始结构 |
| `data/llm-stats/companies.json` | 第三方厂商聚合 |
| `data/llm-stats/menus.json` | 第三方站点菜单/路由 |
| `data/llm-stats/llm-stats.snapshot.json` | 快照摘要 |

## 抓取摘要

| 指标 | 结果 |
|------|------|
| 抓取时间 | 2026-04-30T10:52:07.740Z |
| 路由总数 | 876 |
| 成功路由 | 874 |
| 失败路由 | 2 |
| 模型数 | 296 |
| 厂商数 | 27 |

## 建议进入确认的模型更新

| 优先级 | Provider | 候选模型/套餐 | 当前系统状态 | 抓取结论 | 建议 |
|--------|----------|---------------|--------------|----------|------|
| P0 | OpenAI | `gpt-5.5`, `gpt-5.5-pro` | 系统仍以 GPT-5.4 为最新主线 | 官方模型页和 API 价格页已有 GPT-5.5；标准价 $5/$30，Pro $30/$180；1.05M context，128K max output | 确认后新增 GPT-5.5 / GPT-5.5 Pro，并更新首页新闻和 OpenAI 文档口径 |
| P0 | Google | `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview` | 系统为 Gemini 3 Pro/Flash Preview | 官方 Gemini API 价格页已列 Gemini 3.1 Pro Preview 和 3.1 Flash-Lite Preview；Pro 标准价 $2/$12 或 >200K $4/$18；Flash-Lite $0.25/$1.5 | 确认是否替换 Gemini 3，或并列保留 3 与 3.1 |
| P0 | Alibaba | `qwen3.6-max-preview`, `qwen3.6-plus`, `qwen3.6-flash` | 系统有 `qwen3.6-plus` 但价格为 ¥0/¥0；未收录 Max Preview/Flash | 阿里官方模型页显示 Qwen3.6 系列和第三方最新模型入口；价格需要百炼控制台或公开价格索引交叉确认 | 修正 `qwen3.6-plus` 非零价格；新增 Max Preview/Flash 前需确认计费分层 |
| P0 | DeepSeek | `deepseek-v4-flash`, `deepseek-v4-pro` | 已更新 | 官方页仍确认 V4 Preview、1M context、384K max output；V4 Pro 75% off 至 2026-05-31 | 无需改主数据，仅保持来源文档 |
| P1 | Moonshot Kimi | `kimi-k2.6` | 已收录 Kimi K2.6 | 官方文档确认 K2.6、256K context、Batch API 为标准价 60%、联网搜索 ¥0.03/次；首页露出价格为缓存命中 ¥1.10、输入 ¥6.50、输出 ¥27.00/MTok | 保持模型价，补充 batch/search 套餐计费说明 |
| P1 | Zhipu | `glm-5.1` | 未收录 | 第三方索引显示 GLM-5.1：$1.4/$4.4，200K context；官方定价页为 JS 渲染，需控制台核验 | 暂列待登录核验，不直接落主表 |
| P1 | MiniMax | `minimax-m2.7` | 已收录 M2.7 / M2.7 highspeed | 第三方索引与当前系统价一致：$0.3/$1.2，204.8K context；官方价格页仍需核验 | 保持主表，补来源可信度备注 |
| P1 | xAI | `grok-4.20` | 已收录 Grok 4.20 但官方页 token 价缺失 | 官方模型页推荐 Grok 4.20，但 token 价为空；工具价格明确：Web/X Search/Code Execution $5/1K calls，Attachment Search $10/1K calls | 主表价格继续标“控制台/账户显示为准”，补工具计费 |
| P2 | Xiaomi MiMo | MiMo V2.5/V2 | 已收录 | 第三方索引只抓到 V2 Flash/Omni/Pro，未抓到 V2.5；官方页仍是主要来源 | 继续保留官方页+第三方交叉验证口径 |

## 套餐/订阅抓取

| 产品 | 官方套餐 | 抓取结论 | 建议 |
|------|----------|----------|------|
| ChatGPT | Free / Go / Plus / Pro / Business Codex / Business ChatGPT & Codex / Enterprise | 官方页显示 Plus 含 GPT-5.5 Thinking，Pro 含 GPT-5.5 Pro；Business Codex 为无固定席位费、按使用量付费；Plus 到 2026-05-31 有 Codex 用量翻倍说明 | 可更新 CodePlan/订阅对比，但价格在页面文本中部分被前端渲染隐藏，需二次确认具体 USD 价 |
| Claude | Pro / Team / Enterprise | Pro 为 $17/月（年付，$200 upfront）或 $20 月付；Team 标准席 $20/seat/月年付、$25 月付；Premium seat $100/$125；Enterprise 为 $20/seat + API usage | 可新增 Claude Code/Claude Team 订阅维度 |
| Google AI | Free / AI Plus / AI Pro / AI Ultra | 美国页：AI Plus $7.99/月，AI Pro $19.99/月，AI Ultra $249.99/月；Ultra 25,000 monthly AI credits；Pro 1,000 credits | 可补 Google AI 订阅套餐，注意地区定价差异 |
| Cursor | Hobby / Pro / Pro+ / Ultra / Teams / Enterprise；Bugbot Pro/Teams | 官方页：Pro $20/月、Pro+ $60/月、Ultra $200/月、Teams $40/user/月；Bugbot Pro/Teams $40/user/月 | 可替换当前 CodePlan 中过旧的 Cursor/编程助手套餐结构 |
| Kimi API | Batch / Web Search | Batch API 为标准模型价 60%；联网搜索工具调用 ¥0.03/次，搜索结果 token 另计 | 补充 API 工具费和批量折扣说明 |
| DeepSeek API | Cache hit / V4 Pro discount | Cache hit 降到 launch price 1/10；V4 Pro 75% off 至 2026-05-31 | 已写入来源文档，可保持 |

## 官方来源索引

- OpenAI API pricing: https://openai.com/api/pricing/
- OpenAI GPT-5.5 model: https://developers.openai.com/api/docs/models/gpt-5.5
- OpenAI GPT-5.5 Pro model: https://developers.openai.com/api/docs/models/gpt-5.5-pro
- Anthropic API pricing: https://platform.claude.com/docs/en/about-claude/pricing
- Anthropic model overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Claude plans: https://claude.com/pricing
- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Google AI subscriptions: https://gemini.google/us/subscriptions/
- DeepSeek model pricing: https://api-docs.deepseek.com/quick_start/pricing/
- 阿里百炼模型页: https://help.aliyun.com/zh/model-studio/models
- Kimi pricing: https://platform.kimi.com/docs/pricing/chat
- Cursor pricing: https://cursor.com/en-US/pricing
- xAI models/tools pricing: https://docs.x.ai/developers/models

## 发布前待确认问题

1. OpenAI 是否立刻把 GPT-5.5 作为首页/列表最新主推模型，还是先作为新条目并保留 GPT-5.4 主推。
2. Google Gemini 3.1 是否替换 Gemini 3 Preview，还是保留 3、3.1 并列展示。
3. Alibaba Qwen3.6 的价格使用国际区公开索引口径，还是等待百炼控制台账号价格截图。
4. CodePlan 页面是否新增/替换为 ChatGPT、Claude、Google AI、Cursor 的 2026 套餐。
5. xAI Grok 4.20 token 价官方页暂未公开，是否继续用第三方价格索引作为参考价并加“控制台核验”标签。

## 发布说明

本次仅发布抓取产物和待确认文档，不发布模型主表变更。真正更新线上模型价格前，还需要先确认上方待确认问题，再修改 `src/data/models.ts` 和相关 i18n/SEO 数据。

```bash
npm run build
./deploy.sh tag release-yyyymmdd-vN
```
