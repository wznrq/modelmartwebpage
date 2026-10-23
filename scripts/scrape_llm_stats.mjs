import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://llm-stats.com';
const OUTPUT_DIR = path.resolve('data/llm-stats');
const CONCURRENCY = 5;

const seedPaths = [
  '/',
  '/benchmarks',
  '/models/compare',
  '/playground',
  '/arenas',
  '/gateway',
  '/services',
  '/leaderboards/llm-leaderboard',
  '/leaderboards/open-llm-leaderboard',
  '/leaderboards/best-ai-for-coding',
  '/leaderboards/best-ai-for-math',
  '/leaderboards/best-ai-for-image-generation',
  '/leaderboards/best-ai-for-writing',
  '/arenas/llm-arena',
  '/arenas/coding-arena',
  '/arenas/image-arena',
  '/arenas/video-arena',
  '/arenas/audio-arena',
  '/arenas/trading-arena',
  '/generator/ai-image-generator',
  '/generator/ai-photo-editor',
];

function decodeEntities(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function textFromHtml(value = '') {
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function attr(html, name) {
  const match = html.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return match ? decodeEntities(match[1]) : null;
}

function categoryForPath(pathname) {
  const first = pathname.split('/').filter(Boolean)[0] || 'home';
  const second = pathname.split('/').filter(Boolean)[1] || '';
  if (pathname === '/') return 'home';
  if (pathname === '/models/compare' || (first === 'models' && second === 'compare')) return 'compare';
  if (first === 'models') return second === 'list' ? 'models-list' : 'models';
  if (first === 'leaderboards') return 'leaderboards';
  if (first === 'benchmarks') return 'benchmarks';
  if (first === 'arenas' || pathname === '/3d-arena') return 'arenas';
  if (first === 'generator') return 'generators';
  if (['image', 'audio', 'video', 'generations'].includes(first)) return 'media';
  if (['ai-news', 'ai-trends', 'llm-updates', 'new-models', 'trends'].includes(first)) return 'updates';
  if (['blog', 'posts', 'authors'].includes(first)) return 'content';
  if (['providers', 'organizations'].includes(first)) return 'organizations';
  if (['gateway', 'services', 'playground'].includes(first)) return 'tools';
  if (first === 'legal' || first === 'about-us') return 'site';
  return first;
}

function extractFlight(html) {
  let flight = '';
  const re = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g;
  let match;
  while ((match = re.exec(html))) {
    try {
      flight += JSON.parse(`"${match[1]}"`);
    } catch {
      // Ignore malformed chunks; rendered tables still get parsed from HTML.
    }
  }
  return flight;
}

function findJsonValue(source, key) {
  const keyIndex = source.indexOf(`"${key}":`);
  if (keyIndex < 0) return null;
  let start = keyIndex + key.length + 3;
  while (/\s/.test(source[start])) start += 1;

  const opener = source[start];
  const closer = opener === '[' ? ']' : opener === '{' ? '}' : null;
  if (!closer) {
    let end = start;
    while (end < source.length && ![',', '}', ']'].includes(source[end])) end += 1;
    return source.slice(start, end);
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === opener) depth += 1;
    else if (ch === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function extractInitialData(flight) {
  const keys = [...new Set([...flight.matchAll(/"(initial[A-Za-z0-9_]+)":/g)].map((m) => m[1]))]
    .filter((key) => !['initialTree', 'initialSeedData', 'initialHead'].includes(key));
  const data = {};
  for (const key of keys) {
    const raw = findJsonValue(flight, key);
    if (!raw) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return data;
}

function extractTables(html) {
  const tables = [];
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  let tableMatch;
  while ((tableMatch = tableRe.exec(html))) {
    const tableHtml = tableMatch[0];
    const headers = [...tableHtml.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)]
      .map((m) => textFromHtml(m[1]))
      .filter(Boolean);
    const rows = [];
    for (const rowMatch of tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const rowHtml = rowMatch[1];
      const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => textFromHtml(m[1]));
      if (!cells.length || cells.every((cell, i) => cell === headers[i])) continue;
      if (headers.length && cells.length === headers.length) {
        rows.push(Object.fromEntries(headers.map((header, i) => [header || `column_${i + 1}`, cells[i] ?? null])));
      } else {
        rows.push(cells);
      }
    }
    if (headers.length || rows.length) tables.push({ headers, rows });
  }
  return tables;
}

function extractLinks(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((m) => ({
      href: decodeEntities(m[1]),
      text: textFromHtml(m[2]),
    }))
    .filter((link) => link.href && link.text && !link.href.startsWith('/_next'));
}

function extractPageMeta(html, url) {
  const title = textFromHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = attr(html.match(/<meta[^>]+name="description"[^>]*>/i)?.[0] ?? '', 'content');
  const canonical = attr(html.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0] ?? '', 'href');
  return {
    url,
    path: new URL(url).pathname,
    category: categoryForPath(new URL(url).pathname),
    title,
    description,
    canonical,
  };
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'ModelMart data audit crawler (+https://modelmart.ai)',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function sitemapUrls() {
  const xml = await fetchText(`${BASE_URL}/sitemap.xml`);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeEntities(m[1]));
}

async function collectRoutes() {
  const fromSitemap = await sitemapUrls();
  const seeds = seedPaths.map((pathname) => new URL(pathname, BASE_URL).href);
  return [...new Set([...fromSitemap, ...seeds])]
    .filter((url) => url.startsWith(BASE_URL))
    .filter((url) => !new URL(url).pathname.startsWith('/api/'));
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

function modelFromHomepage(model) {
  return {
    id: model.model_id,
    name: model.name,
    organization: model.organization,
    organizationId: model.organization_id,
    type: model.model_type ?? 'llm',
    source: 'homepage-leaderboard',
    metrics: {
      gpqaScore: model.gpqa_score,
      sweBenchVerifiedScore: model.swe_bench_verified_score,
      hleScore: model.hle_score,
      arenaScores: model.arena_scores ?? {},
    },
    context: model.context,
    pricing: {
      inputUsdPerMillionTokens: model.input_price,
      outputUsdPerMillionTokens: model.output_price,
    },
    isOpenSource: model.is_open_source,
    announcementDate: model.announcement_date,
  };
}

function mergeHomepageModel(modelsById, model) {
  const existing = modelsById.get(model.model_id) ?? {};
  modelsById.set(model.model_id, {
    ...modelFromHomepage(model),
    ...existing,
    metrics: {
      ...modelFromHomepage(model).metrics,
      ...(existing.metrics ?? {}),
    },
    pricing: {
      ...modelFromHomepage(model).pricing,
      ...(existing.pricing ?? {}),
    },
  });
}

function mergeModelData(modelsById, page) {
  const data = page.initialData?.initialModelData;
  if (!data?.model_id) return;
  const existing = modelsById.get(data.model_id) ?? {};
  modelsById.set(data.model_id, {
    ...existing,
    id: data.model_id,
    name: data.name ?? existing.name,
    organization: data.organization?.name ?? existing.organization,
    organizationId: data.organization?.id ?? existing.organizationId,
    type: data.model_type ?? existing.type,
    detailUrl: page.url,
    detail: data,
    similarModels: page.initialData?.initialSimilarModels ?? null,
    providerMetrics: page.initialData?.initialProviderMetrics ?? null,
    zeroevalPricing: page.initialData?.initialZeroevalPricing ?? null,
    faq: page.initialData?.initialFaqItems ?? null,
  });
}

function buildCompanies(models) {
  const companies = new Map();
  for (const model of models) {
    const key = model.organizationId || model.organization || 'unknown';
    const company = companies.get(key) ?? {
      id: key,
      name: model.organization || key,
      modelCount: 0,
      models: [],
    };
    company.modelCount += 1;
    company.models.push({
      id: model.id,
      name: model.name,
      type: model.type,
      announcementDate: model.announcementDate ?? model.detail?.announcement_date ?? null,
      inputPrice: model.pricing?.inputUsdPerMillionTokens ?? model.detail?.input_price ?? null,
      outputPrice: model.pricing?.outputUsdPerMillionTokens ?? model.detail?.output_price ?? null,
      context: model.context ?? model.detail?.context ?? null,
    });
    companies.set(key, company);
  }
  return [...companies.values()].sort((a, b) => b.modelCount - a.modelCount || a.name.localeCompare(b.name));
}

function buildMenus(pages) {
  const menus = {};
  for (const page of pages) {
    const bucket = menus[page.category] ?? {
      category: page.category,
      routeCount: 0,
      tableCount: 0,
      rowsInTables: 0,
      routes: [],
    };
    bucket.routeCount += 1;
    bucket.tableCount += page.tables.length;
    bucket.rowsInTables += page.tables.reduce((sum, table) => sum + table.rows.length, 0);
    bucket.routes.push({
      path: page.path,
      url: page.url,
      title: page.title,
      description: page.description,
      tables: page.tables.map((table) => ({
        headers: table.headers,
        rowCount: table.rows.length,
      })),
      initialDataKeys: Object.keys(page.initialData),
      internalLinkCount: page.links.filter((link) => link.href.startsWith('/')).length,
    });
    menus[page.category] = bucket;
  }
  return Object.fromEntries(Object.entries(menus).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const routes = await collectRoutes();
  console.log(`Discovered ${routes.length} public routes from sitemap and menus.`);

  const pages = await mapLimit(routes, CONCURRENCY, async (url, index) => {
    if ((index + 1) % 50 === 0 || index === 0) console.log(`Fetching ${index + 1}/${routes.length}: ${url}`);
    try {
      const html = await fetchText(url);
      const flight = extractFlight(html);
      const initialData = extractInitialData(flight);
      const page = {
        ...extractPageMeta(html, url),
        status: 'ok',
        tables: extractTables(html),
        links: extractLinks(html),
        initialData,
      };
      return page;
    } catch (error) {
      return {
        url,
        path: new URL(url).pathname,
        category: categoryForPath(new URL(url).pathname),
        status: 'error',
        error: error.message,
        tables: [],
        links: [],
        initialData: {},
      };
    }
  });

  const modelsById = new Map();
  for (const page of pages) {
    const homepageModels = page.initialData?.initialHomepageLLMModels;
    if (Array.isArray(homepageModels)) {
      for (const model of homepageModels) mergeHomepageModel(modelsById, model);
    }
    mergeModelData(modelsById, page);
  }

  const models = [...modelsById.values()].sort((a, b) => (a.organization || '').localeCompare(b.organization || '') || a.name.localeCompare(b.name));
  const companies = buildCompanies(models);
  const menus = buildMenus(pages);
  const snapshot = {
    source: BASE_URL,
    scrapedAt: new Date().toISOString(),
    routeCount: routes.length,
    okRouteCount: pages.filter((page) => page.status === 'ok').length,
    errorRouteCount: pages.filter((page) => page.status !== 'ok').length,
    modelCount: models.length,
    companyCount: companies.length,
    menuCategories: Object.keys(menus),
    files: {
      summary: 'summary.json',
      menus: 'menus.json',
      companies: 'companies.json',
      models: 'models.json',
      snapshot: 'llm-stats.snapshot.json',
    },
  };

  await writeFile(path.join(OUTPUT_DIR, 'summary.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, 'menus.json'), `${JSON.stringify(menus, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, 'companies.json'), `${JSON.stringify(companies, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, 'models.json'), `${JSON.stringify(models, null, 2)}\n`);
  await writeFile(path.join(OUTPUT_DIR, 'llm-stats.snapshot.json'), `${JSON.stringify({
    ...snapshot,
    menuRouteCounts: Object.fromEntries(Object.entries(menus).map(([key, value]) => [key, value.routeCount])),
    topCompanies: companies.slice(0, 20).map((company) => ({
      id: company.id,
      name: company.name,
      modelCount: company.modelCount,
    })),
  }, null, 2)}\n`);

  console.log(JSON.stringify(snapshot, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
