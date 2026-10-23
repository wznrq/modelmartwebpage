# ModelMart B2B 成本治理商业计划

## 1. 定位

ModelMart 第一阶段不做未授权的 API key 转卖，而是定位为面向国内中小 AI 团队的 B2B 模型成本治理与选型平台。

核心目标是帮助月 AI API/订阅支出约 `¥1,000-100,000` 的团队回答三个问题：

- 当前业务负载下，哪个模型组合的 TCO 更低？
- 国产、国际、云市场模型分别适合哪些场景？
- 模型价格、版本和可用性变化后，团队是否需要调整选型？

## 2. 目标客户

| 客户类型 | 典型支出 | 主要痛点 | 适配方案 |
| --- | --- | --- | --- |
| AI 应用创业公司 | `¥1,000-10,000/月` | 试错快，模型成本容易失控 | Pro |
| 企业研发/产品团队 | `¥10,000-100,000/月` | 多团队、多场景成本难解释 | Team |
| 集成商与交付团队 | 按项目波动 | 多供应商报价和客户方案需要依据 | Team / Enterprise |

## 3. 收入模型

| 套餐 | 价格 | 价值 |
| --- | --- | --- |
| Free | 免费 | 公开模型库、Benchmark、基础 TCO、数据来源可信度 |
| Pro | `¥99/月` | 保存测算、价格提醒、CSV 导出 |
| Team | `¥999/月` | 团队场景、私有价格录入、月度成本报告、多人协作 |
| Enterprise | `¥5,000/月起` | 定制选型报告、伙伴采购协助、私有化/专属支持 |

## 4. 渠道与分成策略

优先顺序：

1. 国内云与模型厂商：阿里云通义/百炼、腾讯云混元、百度千帆、华为云盘古。
   - 路径：官方伙伴、渠道、线索合作、联合方案。
   - 目标：拿到可合规转介或采购协助的商务边界。
2. 有公开伙伴计划的国际模型厂商：Mistral AI、Cohere 等。
   - 路径：Partner Program、BD、联合销售。
   - 目标：获得明确的 referral、reseller、integration 或 marketplace 权限。
3. OpenAI、Anthropic、Google、Meta 等。
   - 路径：BYOK、Azure/AWS/Google Cloud Marketplace、企业合同导流、开源权重部署服务。
   - 目标：在未签协议前不转售 API，仅提供选型、成本治理和采购路径咨询。

## 5. 法律与商业边界

禁止项：

- 未签厂商或云市场协议前，不转售 API key。
- 不承诺官方折扣、官方代理身份或保底额度。
- 不代充值非授权账号。
- 不共享、买卖、转移客户或平台 API key。
- 不把本地价格变更提醒包装成真实邮件通知或 SLA 监控。

允许项：

- BYOK 成本治理：客户使用自己的 key 或云账号。
- 云市场采购协助：指导客户走 AWS Marketplace、Azure AI Foundry、Google Cloud Marketplace 等官方路径。
- 企业合同导流：把合格客户线索导向厂商或云伙伴。
- 开源权重选型和部署咨询：前提是遵守对应模型许可。

## 6. 90 天计划

| 时间 | 目标 | KPI |
| --- | --- | --- |
| 30 天 | 上线商业方案页、询价入口、TCO 转化入口 | 10 条有效线索 |
| 60 天 | 完成国内云/模型厂商伙伴申请或 BD 洽谈 | 2 个伙伴动作 |
| 90 天 | 完成付费试点 | 1-3 个 Team/Enterprise 客户 |

## 7. 产品 MVP

已落地到站点的 MVP：

- `/business` 商业方案页。
- `LeadCaptureForm` 静态线索表单，保存到 `localStorage` 并打开 `mailto:`。
- `/calculator` 增加“获取成本优化方案”入口。
- 模型详情增加“咨询采购/合作”入口。
- Footer 与首页增加商业方案入口，顶部导航保持不新增。
- 商业方案、表单、套餐、合作路径矩阵支持 `zh-CN`、`zh-TW`、`en`。

暂不做：

- 后端线索数据库。
- 登录、团队权限和计费系统。
- 外部 CRM 集成。
- 未授权 API key 转售。

## 8. 后续实施优先级

1. 把线索表单接入 Cloudflare Pages Functions 或 FastAPI。
2. 增加保存 TCO 场景、CSV 导出和私有价格录入。
3. 增加价格变更任务和真实通知渠道。
4. 做团队成本报告模板。
5. 建立伙伴申请材料包：产品定位、客户画像、线索合作流程、合规边界。

## 9. 参考来源

- OpenAI Services Agreement: https://openai.com/policies/services-agreement/
- AWS Marketplace Channel Partner Private Offers: https://aws.amazon.com/marketplace/features/cpprivateoffers
- Azure AI Foundry model catalog: https://azure.microsoft.com/en-us/products/ai-model-catalog/
- Google Cloud Marketplace reseller discounts: https://docs.cloud.google.com/marketplace/docs/partners/resell/reseller-incentives
- Mistral AI partners: https://mistral.ai/partners
- Cohere Partner Program: https://cohere.com/partners
- 阿里云合作伙伴: https://partner.aliyun.com/
- 腾讯云合作伙伴: https://partner.cloud.tencent.com/
- 百度智能云合作伙伴: https://cloud.baidu.com/partner/index.html
- 华为云合作伙伴: https://www.huaweicloud.com/intl/zh-cn/partners/
