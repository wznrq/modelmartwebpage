# ModelMart AI 开发规范

## 项目概述

ModelMart AI 是一个 AI 模型价格对比平台，帮助用户比较不同厂商的 AI 模型价格、性能和功能。

**技术栈**: React + TypeScript + Vite + Tailwind CSS
**部署**: Cloudflare Pages
**语言**: 中文（简体/繁体）、英文

---

## 目录

1. [i18n 多语言规范](#1-多语言规范)
2. [货币转换规范](#2-货币转换规范)
3. [代码开发规范](#3-代码开发规范)
4. [关键文件说明](#4-关键文件说明)
5. [数据模型规范](#5-数据模型规范)
6. [部署流程](#6-部署流程)

---

## 1. 多语言规范

### 支持语言
- `zh-CN` - 简体中文（默认）
- `zh-TW` - 繁体中文
- `en` - 英文

### 实现方式

翻译文件位于 `src/i18n/translations.ts`，使用 `useLanguage()` hook 获取当前语言。

```tsx
import { useLanguage } from '@/i18n/LanguageContext'

// 使用
const { language } = useLanguage()
// language: 'zh-CN' | 'zh-TW' | 'en'
```

### 新增功能的 i18n 要求

**所有新增功能必须支持三种语言切换**：

1. **静态文本**: 使用翻译 key
   ```tsx
   // 正确写法
   <h1>{t('home.title')}</h1>

   // 错误写法
   <h1>标题</h1>
   ```

2. **动态文本内容**: 使用语言判断
   ```tsx
   // 模型名称、新闻标题等动态内容
   const title = lang === 'en' ? 'GPT-5.4 Released' : 'GPT-5.4 发布'
   const desc = lang === 'en' ? 'New flagship model' : '全新旗舰模型'
   ```

3. **翻译文件更新**: 在 `translations.ts` 中为每种语言添加对应的 key
   ```typescript
   // 例: 添加 news.title
   'zh-CN': { 'news.title': '最新优惠', ... },
   'zh-TW': { 'news.title': '最新優惠', ... },
   'en': { 'news.title': 'Latest Deals', ... },
   ```

### 语言切换组件

使用 `LanguageSwitcher` 组件进行语言切换，位于 `src/components/LanguageSwitcher.tsx`。

---

## 2. 货币转换规范

### 规则

| 语言 | 货币 | 格式 |
|------|------|------|
| zh-CN | CNY | ¥xxx |
| zh-TW | CNY | ¥xxx |
| en | USD | $xxx |

### 实现位置

货币转换在 `src/utils/formatPrice.ts` 的 `formatPrice()` 函数中实现：

```typescript
export function formatPrice(priceInCNY: number, currency: '¥' | '$', exchangeRate = 7.2): string {
  if (currency === '$') {
    return `$${(priceInCNY / exchangeRate).toFixed(2)}`
  }
  return `¥${priceInCNY.toFixed(2)}`
}
```

**注意**: 实际项目中可能使用实时汇率，需查看 `useExchangeRate` hook。

### 规则说明

- 默认货币为 CNY（人民币）
- 当 `language === 'en'` 时，价格自动转换为美元
- 价格格式需符合各语言习惯

---

## 3. 代码开发规范

### 组件结构

```
src/
├── components/     # 可复用组件
├── pages/          # 页面组件
├── data/           # 静态数据
├── i18n/           # 国际化
├── hooks/          # 自定义 Hooks
└── utils/          # 工具函数
```

### 命名规范

- 组件文件: PascalCase (如 `ModelCard.tsx`)
- 组件函数: PascalCase (如 `export function ModelCard`)
- CSS 类: kebab-case (如 `text-primary`, `bg-green-500`)
- 翻译 key: dot notation (如 `home.title`, `model.price`)

### 状态管理

使用 React Context 进行全局状态管理：
- `LanguageContext` - 语言状态
- `CurrencyContext` - 货币状态（可选）

### 样式规范

使用 Tailwind CSS，优先使用 design system 中的变量：
- `text-primary` - 主色
- `text-cyan-400` - 强调色
- `bg-card` - 卡片背景
- `border-border` - 边框色

---

## 4. 关键文件说明

| 文件 | 说明 |
|------|------|
| `src/data/models.ts` | 模型数据，包含定价（CNY）、性能、特性 |
| `src/data/benchmarks.ts` | 基准测试分数 |
| `src/i18n/translations.ts` | 所有翻译文本 |
| `src/pages/Home.tsx` | 首页，包含新闻轮播模块 |
| `src/components/LanguageSwitcher.tsx` | 语言切换组件 |

### models.ts 结构

```typescript
interface Model {
  id: string
  providerId: string
  name: string           // 模型名称
  version?: string       // 版本号
  type: string           // 模型类型 (chat/vision/etc)
  pricing: {
    input: number        // CNY / 百万token
    output: number
  }
  performance: {
    contextLength: number
    // ...
  }
  features: string[]
  releaseDate: string
}
```

---

## 5. 数据模型规范

### Provider ID 映射

| Provider | ID |
|----------|-----|
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| Google | `google` |
| DeepSeek | `deepseek` |
| 阿里 | `alibaba` |
| 智谱 | `zhipu` |
| Moonshot | `moonshot` |
| MiniMax | `minimax` |

### Benchmark 分数

benchmarks.ts 中的 `modelId` 必须与 models.ts 中的 `id` 完全匹配。

---

## 6. 部署流程

```bash
# 1. 确保本地测试通过
npm run dev

# 2. 构建生产版本
npm run build

# 3. 提交 PR 并合入 main 分支

# 4. 按照规则打 tag 并推送
git tag -a v1.x.x -m "release: 功能描述"
git push origin v1.x.x

# 5. 部署自动触发
# tag 推送后 GitHub Actions 自动部署到 Cloudflare Pages
```

**注意**: 所有 PR 合并到 main 分支后自动部署。

---

## 7. 发布规范

### Tag 命名规则
- 格式: `release-yyyymmdd-v{n}`（日期 + 序号）
- 示例: `release-20260424-v1`, `release-20260424-v2`, `release-20260425-v1`

### 发布流程
1. 代码必须先 PR 合入 `main` 分支
2. 从 `main` 分支打 tag
3. 推送 tag 触发部署: `git push origin v1.x.x`
4. 等待 GitHub Actions 自动部署完成

### 禁止事项
- 禁止直接从 feature 分支发布
- 禁止强制推送 tag
- 禁止删除已推送的 tag

---

## 检查清单

新增功能时确保：

- [ ] 静态文本使用 `t('key')` 而非硬编码
- [ ] 动态内容支持三种语言
- [ ] 货币在英文模式下转换为 USD
- [ ] 翻译文件包含三种语言
- [ ] 组件在 `zh-CN`、`zh-TW`、`en` 下均正常显示
