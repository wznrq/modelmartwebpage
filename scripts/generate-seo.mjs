import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'

const ROOT = process.cwd()
const BASE_URL = 'https://modelmart.ai'
const DIST_DIR = path.join(ROOT, 'dist')
const PUBLIC_DIR = path.join(ROOT, 'public')
const LANGUAGES = ['zh-CN', 'zh-TW', 'en']
const DEFAULT_LANGUAGE = 'zh-CN'
const LASTMOD = new Date().toISOString().slice(0, 10)
const DEFAULT_IMAGE = `${BASE_URL}/hero-ai.png`
const require = createRequire(import.meta.url)

function loadTsExports(filePath) {
  const source = fsSync.readFileSync(filePath, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: () => {
      throw new Error(`Unexpected require in ${filePath}`)
    },
  }, { filename: filePath })
  return module.exports
}

const { models, providers } = loadTsExports(path.join(ROOT, 'src/data/models.ts'))

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function stripLanguage(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  if (LANGUAGES.includes(parts[0])) parts.shift()
  return `/${parts.join('/')}`.replace(/\/$/, '') || '/'
}

function localizePath(basePath, language) {
  const [pathname, query = ''] = basePath.split('?')
  const cleanPath = stripLanguage(pathname || '/')
  const localized = `/${language}${cleanPath === '/' ? '' : cleanPath}`
  return `${localized}${query ? `?${query}` : ''}`
}

function absoluteUrl(pathname) {
  return `${BASE_URL}${pathname === '/' ? '' : pathname}`
}

function modelPath(model) {
  return `/models/${model.providerId}/${encodeURIComponent(model.id)}`
}

function providerPath(provider) {
  return `/providers/${provider.id}`
}

function titleByLanguage(language, zhCn, zhTw, en) {
  if (language === 'en') return en
  if (language === 'zh-TW') return zhTw
  return zhCn
}

function providerName(provider, language) {
  const names = {
    baidu: { 'zh-CN': '百度文心', 'zh-TW': '百度文心', en: 'Baidu ERNIE' },
    alibaba: { 'zh-CN': '阿里通义', 'zh-TW': '阿里通義', en: 'Alibaba Qwen' },
    tencent: { 'zh-CN': '腾讯混元', 'zh-TW': '騰訊混元', en: 'Tencent Hunyuan' },
    zhipu: { 'zh-CN': '智谱AI', 'zh-TW': '智譜AI', en: 'Zhipu AI' },
    moonshot: { 'zh-CN': '月之暗面 Moonshot AI', 'zh-TW': '月之暗面 Moonshot AI', en: 'Moonshot AI' },
    deepseek: { 'zh-CN': 'DeepSeek 深度求索', 'zh-TW': 'DeepSeek 深度求索', en: 'DeepSeek' },
    bytedance: { 'zh-CN': '字节豆包 ByteDance', 'zh-TW': '字節豆包 ByteDance', en: 'ByteDance Doubao' },
    sensetime: { 'zh-CN': '商汤 SenseTime', 'zh-TW': '商湯 SenseTime', en: 'SenseTime' },
    mobvoi: { 'zh-CN': '出门问问 Mobvoi', 'zh-TW': '出門問問 Mobvoi', en: 'Mobvoi' },
    iflytek: { 'zh-CN': '讯飞 iFlytek', 'zh-TW': '訊飛 iFlytek', en: 'iFlytek' },
    huawei: { 'zh-CN': '华为云 盘古', 'zh-TW': '華為雲 盤古', en: 'Huawei Cloud Pangu' },
    yi: { 'zh-CN': '零一万物 Yi', 'zh-TW': '零一萬物 Yi', en: '01.AI Yi' },
  }
  return names[provider.id]?.[language] || provider.name
}

function formatCny(value) {
  if (value === 0) return '¥0'
  return `¥${value}`
}

const basePages = [
  {
    basePath: '/',
    changefreq: 'daily',
    priority: '1.0',
    title: (language) => titleByLanguage(language, '大模型商城 - 汇聚全球主流AI模型', '大模型商城 - 匯聚全球主流AI模型', 'ModelMart - Global AI Model Marketplace'),
    description: (language) => titleByLanguage(
      language,
      'ModelMart 汇聚全球主流 AI 大模型，支持模型价格、性能、Benchmark、TCO 成本测算和商业采购路径对比。',
      'ModelMart 匯聚全球主流 AI 大模型，支持模型價格、性能、Benchmark、TCO 成本測算和商業採購路徑對比。',
      'ModelMart compares global AI models by pricing, performance, benchmarks, TCO, and procurement paths.',
    ),
    content: () => [
      'AI model pricing comparison',
      'Benchmark rankings',
      'TCO calculator',
      'B2B cost governance',
    ],
  },
  {
    basePath: '/models',
    changefreq: 'daily',
    priority: '0.9',
    title: (language) => titleByLanguage(language, '浏览全部AI大模型', '瀏覽全部AI大模型', 'Browse All AI Models'),
    description: (language) => titleByLanguage(
      language,
      `浏览 ModelMart 收录的 ${models.length} 个 AI 大模型，按厂商、价格、上下文、准确率和模型类型筛选。`,
      `瀏覽 ModelMart 收錄的 ${models.length} 個 AI 大模型，按廠商、價格、上下文、準確率和模型類型篩選。`,
      `Browse ${models.length} AI models on ModelMart by provider, price, context, accuracy, and model type.`,
    ),
    content: () => models.slice(0, 20).map((model) => model.name),
  },
  {
    basePath: '/compare',
    changefreq: 'weekly',
    priority: '0.8',
    title: (language) => titleByLanguage(language, 'AI 模型对比分析', 'AI 模型對比分析', 'AI Model Comparison'),
    description: (language) => titleByLanguage(language, '对比不同 AI 模型和代码助手套餐的价格、性能、上下文与使用限制。', '對比不同 AI 模型和代碼助手套餐的價格、性能、上下文與使用限制。', 'Compare AI models and coding plans by price, performance, context, and usage limits.'),
    content: () => ['Model comparison', 'Price comparison', 'Context window comparison'],
  },
  {
    basePath: '/codeplan',
    changefreq: 'weekly',
    priority: '0.75',
    title: (language) => titleByLanguage(language, 'AI 编程助手套餐价格对比', 'AI 編程助手套餐價格對比', 'AI Coding Plan Pricing Comparison'),
    description: (language) => titleByLanguage(language, '对比国内外 AI 编程助手套餐价格、额度、模型能力和适用场景。', '對比國內外 AI 編程助手套餐價格、額度、模型能力和適用場景。', 'Compare AI coding assistant plans by price, quota, model capability, and use case.'),
    content: () => ['CodePlan', 'AI coding assistants', 'Subscription comparison', 'MiniMax Token Plan 9折优惠', 'MiniMax voice music video image generation benefits'],
  },
  {
    basePath: '/calculator',
    changefreq: 'weekly',
    priority: '0.85',
    title: (language) => titleByLanguage(language, 'AI 模型 TCO 成本测算器', 'AI 模型 TCO 成本測算器', 'AI Model TCO Calculator'),
    description: (language) => titleByLanguage(language, '输入月请求量、输入输出 token 和上下文需求，测算 AI 模型月度成本并获得推荐。', '輸入月請求量、輸入輸出 token 和上下文需求，測算 AI 模型月度成本並獲得推薦。', 'Estimate monthly AI model cost by request volume, tokens, and context requirements.'),
    content: () => ['TCO calculator', 'AI cost optimization', 'Model recommendation'],
  },
  {
    basePath: '/business',
    changefreq: 'weekly',
    priority: '0.8',
    title: (language) => titleByLanguage(language, 'AI 模型成本治理商业方案', 'AI 模型成本治理商業方案', 'AI Model Cost Governance Business Plan'),
    description: (language) => titleByLanguage(language, '面向国内中小 AI 团队的模型成本治理、选型、价格变更提醒和伙伴采购协助方案。', '面向國內中小 AI 團隊的模型成本治理、選型、價格變更提醒和夥伴採購協助方案。', 'B2B model cost governance, selection, price-change alerts, and partner procurement assistance for small AI teams.'),
    content: () => ['Pro ¥99/月', 'Team ¥999/月', 'Enterprise ¥5,000/月起'],
  },
  {
    basePath: '/benchmarks',
    changefreq: 'weekly',
    priority: '0.85',
    title: (language) => titleByLanguage(language, 'AI大模型性能基准测试', 'AI大模型性能基準測試', 'AI Model Performance Benchmarks'),
    description: (language) => titleByLanguage(language, '查看 AI 大模型在 Chat Arena、GPQA、MMLU-Pro、AIME、SWE-Bench 等基准测试中的表现。', '查看 AI 大模型在 Chat Arena、GPQA、MMLU-Pro、AIME、SWE-Bench 等基準測試中的表現。', 'View AI model performance across Chat Arena, GPQA, MMLU-Pro, AIME, SWE-Bench, and more.'),
    content: () => ['Chat Arena', 'GPQA', 'MMLU-Pro', 'AIME', 'SWE-Bench Verified'],
  },
  {
    basePath: '/about',
    changefreq: 'monthly',
    priority: '0.6',
    title: (language) => titleByLanguage(language, '关于 ModelMart', '關於 ModelMart', 'About ModelMart'),
    description: (language) => titleByLanguage(language, '了解 ModelMart 的模型价格对比、数据可信度、成本测算和商业化愿景。', '了解 ModelMart 的模型價格對比、數據可信度、成本測算和商業化願景。', 'Learn about ModelMart model pricing comparison, data trust, TCO, and commercialization vision.'),
    content: () => ['ModelMart', 'AI model marketplace', 'Data trust'],
  },
]

const providerPages = providers.map((provider) => ({
  basePath: providerPath(provider),
  changefreq: 'weekly',
  priority: '0.82',
  title: (language) => {
    const name = providerName(provider, language)
    return titleByLanguage(language, `${name} 大模型价格、性能与基准测试`, `${name} 大模型價格、性能與基準測試`, `${name} AI models, pricing and benchmarks`)
  },
  description: (language) => {
    const name = providerName(provider, language)
    const count = models.filter((model) => model.providerId === provider.id).length
    return titleByLanguage(language, `${name} 模型目录：收录 ${count} 个模型，覆盖价格、上下文、性能和官方来源。`, `${name} 模型目錄：收錄 ${count} 個模型，覆蓋價格、上下文、性能和官方來源。`, `${name} model catalog with ${count} models, pricing, context, performance, and official source links.`)
  },
  content: () => models.filter((model) => model.providerId === provider.id).slice(0, 12).map((model) => model.name),
}))

const modelPages = models.map((model) => {
  const provider = providers.find((item) => item.id === model.providerId)
  return {
    basePath: modelPath(model),
    changefreq: 'weekly',
    priority: '0.78',
    title: (language) => titleByLanguage(language, `${model.name} 价格、上下文与性能数据`, `${model.name} 價格、上下文與性能數據`, `${model.name} pricing, context and performance`),
    description: (language) => {
      const name = provider ? providerName(provider, language) : model.providerId
      return titleByLanguage(
        language,
        `${name} ${model.name}：输入 ${formatCny(model.pricing.input)} / 百万 token，输出 ${formatCny(model.pricing.output)}，上下文 ${(model.performance.contextWindow / 1000).toFixed(0)}K。`,
        `${name} ${model.name}：輸入 ${formatCny(model.pricing.input)} / 百萬 token，輸出 ${formatCny(model.pricing.output)}，上下文 ${(model.performance.contextWindow / 1000).toFixed(0)}K。`,
        `${model.name} by ${name}: input ${formatCny(model.pricing.input)} per 1M tokens, output ${formatCny(model.pricing.output)}, ${(model.performance.contextWindow / 1000).toFixed(0)}K context.`,
      )
    },
    content: () => [
      provider?.name || model.providerId,
      model.name,
      `Input ${formatCny(model.pricing.input)}`,
      `Output ${formatCny(model.pricing.output)}`,
      `${(model.performance.contextWindow / 1000).toFixed(0)}K context`,
      ...model.features,
    ],
  }
})

const seoRoutes = [...basePages, ...providerPages, ...modelPages]
const notFoundRoute = {
  basePath: '/404',
  changefreq: 'yearly',
  priority: '0.0',
  noindex: true,
  title: (language) => titleByLanguage(language, '页面不存在', '頁面不存在', 'Page not found'),
  description: (language) => titleByLanguage(language, '你访问的 ModelMart 页面不存在。', '你訪問的 ModelMart 頁面不存在。', 'The requested ModelMart page does not exist.'),
  content: () => ['404', 'ModelMart', 'Noindex'],
}

function routeSchema(route, language, path) {
  const model = models.find((item) => route.basePath === modelPath(item))
  const provider = providers.find((item) => route.basePath === providerPath(item))

  if (model) {
    const modelProvider = providers.find((item) => item.id === model.providerId)
    return [{
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: model.name,
      applicationCategory: 'AI model',
      operatingSystem: 'API',
      url: absoluteUrl(path),
      datePublished: model.releaseDate,
      publisher: {
        '@type': 'Organization',
        name: modelProvider ? providerName(modelProvider, language) : model.providerId,
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'CNY',
        price: model.pricing.input,
        description: 'Input price per 1M tokens',
      },
    }]
  }

  if (provider) {
    const providerModels = models.filter((item) => item.providerId === provider.id)
    return [{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: providerName(provider, language),
      url: absoluteUrl(path),
      logo: absoluteUrl(provider.logo),
      description: provider.description,
    }, {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${providerName(provider, language)} models`,
      itemListElement: providerModels.slice(0, 20).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absoluteUrl(localizePath(modelPath(item), language)),
      })),
    }]
  }

  if (route.basePath === '/business') {
    return [{
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: route.title(language),
      url: absoluteUrl(path),
      provider: { '@type': 'Organization', name: 'ModelMart' },
      areaServed: 'China',
      serviceType: 'AI model cost governance',
    }]
  }

  return [{
    '@context': 'https://schema.org',
    '@type': route.basePath === '/benchmarks' ? 'ItemList' : 'WebPage',
    name: route.title(language),
    url: absoluteUrl(path),
    description: route.description(language),
  }]
}

function metaTags(route, language, outputPath) {
  const canonicalPath = localizePath(route.basePath, language)
  const title = `${route.title(language)} - ModelMart`
  const description = route.description(language)
  const alternates = LANGUAGES.map((lang) => `  <link rel="alternate" hreflang="${lang}" href="${absoluteUrl(localizePath(route.basePath, lang))}" />`).join('\n')
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ModelMart',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ModelMart',
      url: BASE_URL,
      description,
      inLanguage: language,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/zh-CN/models?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    ...routeSchema(route, language, canonicalPath),
  ]

  return `
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${route.noindex ? 'noindex, follow' : 'index, follow'}" />
  <link rel="canonical" href="${absoluteUrl(canonicalPath)}" />
${alternates}
  <link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.basePath)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${absoluteUrl(canonicalPath)}" />
  <meta property="og:site_name" content="ModelMart" />
  <meta property="og:image" content="${DEFAULT_IMAGE}" />
  <meta property="og:locale" content="${language.replace('-', '_')}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${DEFAULT_IMAGE}" />
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
  <meta name="modelmart-prerender-path" content="${escapeHtml(outputPath)}" />`
}

function staticBody(route, language) {
  const items = route.content(language)
  return `
    <section class="seo-prerender" style="max-width:960px;margin:0 auto;padding:96px 24px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#d1fae5;background:#030712">
      <p style="color:#22d3ee;margin:0 0 12px">ModelMart SEO prerender</p>
      <h1 style="font-size:32px;line-height:1.2;margin:0 0 16px;color:#f8fafc">${escapeHtml(route.title(language))}</h1>
      <p style="font-size:16px;line-height:1.7;color:#94a3b8;margin:0 0 24px">${escapeHtml(route.description(language))}</p>
      <ul style="display:grid;gap:8px;margin:0;padding-left:20px;color:#86efac">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n        ')}
      </ul>
    </section>`
}

function injectSeo(template, route, language, outputPath) {
  let html = template
    .replace(/<html lang="[^"]*"/, `<html lang="${language}"`)
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/\s*<meta name="description" content="[^"]*" \/>\s*/g, '\n')
    .replace('</head>', `${metaTags(route, language, outputPath)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${staticBody(route, language)}</div>`)

  return html
}

async function writeRouteHtml(template, route, outputPath, language) {
  const normalized = outputPath === '/' ? '/index.html' : `${outputPath.replace(/\/$/, '')}/index.html`
  const filePath = path.join(DIST_DIR, normalized)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, injectSeo(template, route, language, outputPath), 'utf8')
}

function sitemapXml() {
  const entries = seoRoutes.flatMap((route) => LANGUAGES.map((language) => {
    const loc = absoluteUrl(localizePath(route.basePath, language))
    const alternates = LANGUAGES.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${absoluteUrl(localizePath(route.basePath, lang))}" />`).join('\n')
    return `  <url>
    <loc>${loc}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.basePath)}" />
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  }))

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`
}

function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`
}

async function main() {
  const sitemap = sitemapXml()
  const robots = robotsTxt()
  await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8')
  await fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8')

  const indexPath = path.join(DIST_DIR, 'index.html')
  if (!fsSync.existsSync(indexPath)) {
    console.log('SEO data generated in public/. Run after vite build to prerender dist/.')
    return
  }

  const template = await fs.readFile(indexPath, 'utf8')

  for (const route of seoRoutes) {
    await writeRouteHtml(template, route, route.basePath, DEFAULT_LANGUAGE)
    for (const language of LANGUAGES) {
      await writeRouteHtml(template, route, localizePath(route.basePath, language), language)
    }
  }

  await fs.writeFile(
    path.join(DIST_DIR, '404.html'),
    injectSeo(template, notFoundRoute, DEFAULT_LANGUAGE, '/404'),
    'utf8',
  )

  await fs.writeFile(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8')
  await fs.writeFile(path.join(DIST_DIR, 'robots.txt'), robots, 'utf8')
  console.log(`Generated SEO sitemap and prerendered ${seoRoutes.length * (LANGUAGES.length + 1)} routes.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
