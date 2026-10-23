import { readFile, writeFile } from 'node:fs/promises';

const INPUT = 'data/llm-stats/models.json';
const OUTPUT = 'src/data/benchmarks.ts';
const SCRAPED_AT_FALLBACK = new Date().toISOString().slice(0, 10);

function categoryOf(categories = [], id = '') {
  const set = new Set(categories);
  if (set.has('code') || set.has('frontend_development') || id.includes('code') || id.includes('swe')) return 'coding';
  if (set.has('math') || id.includes('math') || id.includes('aime')) return 'math';
  if (set.has('safety')) return 'safety';
  if (set.has('language') || set.has('factuality') || set.has('general')) return 'knowledge';
  return 'reasoning';
}

function descriptionOf(benchmark) {
  const text = benchmark.description || `${benchmark.name} benchmark from llm-stats.com`;
  return text.replace(/\s+/g, ' ').slice(0, 220);
}

function scoreValue(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return score <= 1 ? Number((score * 100).toFixed(1)) : Number(score.toFixed(1));
}

function arenaValue(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  return Number(Math.min(100, Math.max(0, score * 5)).toFixed(1));
}

function jsString(value) {
  return JSON.stringify(value);
}

const providerIdAliases = {
  qwen: 'alibaba',
  moonshotai: 'moonshot',
  stepfun: 'step',
  'zai-org': 'zhipu',
};

function canonicalProviderId(providerId) {
  return providerIdAliases[providerId] ?? providerId;
}

const models = JSON.parse(await readFile(INPUT, 'utf8'));
const scrapedSummary = JSON.parse(await readFile('data/llm-stats/summary.json', 'utf8'));
const lastUpdated = scrapedSummary.scrapedAt?.slice(0, 10) || SCRAPED_AT_FALLBACK;

const benchmarkStats = new Map();
for (const model of models) {
  for (const benchmark of model.detail?.benchmarks ?? []) {
    if (typeof benchmark.normalized_score !== 'number') continue;
    const existing = benchmarkStats.get(benchmark.benchmark_id) ?? {
      id: benchmark.benchmark_id,
      name: benchmark.name,
      description: benchmark.description,
      categories: benchmark.categories ?? [],
      count: 0,
    };
    existing.count += 1;
    benchmarkStats.set(benchmark.benchmark_id, existing);
  }
}

const selectedBenchmarkIds = [
  'gpqa',
  'mmlu-pro',
  'aime-2025',
  'mmlu',
  'swe-bench-verified',
  "humanity's-last-exam",
  'livecodebench',
  'math',
  'humaneval',
  'ifeval',
  'mmmu',
  'simpleqa',
  'browsecomp',
  'terminal-bench-2',
  'math-500',
];

const benchmarkDefs = [
  {
    name: 'chat_arena',
    fullName: 'Chat Arena',
    description: 'Crowd preference arena score from llm-stats.com, normalized to 0-100 for UI comparison.',
    category: 'reasoning',
  },
  {
    name: 'coding_arena',
    fullName: 'Coding Arena',
    description: 'Coding arena score from llm-stats.com, normalized to 0-100 for UI comparison.',
    category: 'coding',
  },
  ...selectedBenchmarkIds
    .map((id) => benchmarkStats.get(id))
    .filter(Boolean)
    .map((benchmark) => ({
      name: benchmark.id.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
      fullName: benchmark.name,
      description: descriptionOf(benchmark),
      category: categoryOf(benchmark.categories, benchmark.id),
    })),
];

const modelBenchmarks = models
  .map((model) => {
    const scores = {};
    const chatArena = arenaValue(model.metrics?.arenaScores?.['chat-arena']);
    const codingArena = arenaValue(model.metrics?.arenaScores?.['coding-arena']);
    if (chatArena !== null) scores.chat_arena = chatArena;
    if (codingArena !== null) scores.coding_arena = codingArena;

    for (const benchmark of model.detail?.benchmarks ?? []) {
      if (!selectedBenchmarkIds.includes(benchmark.benchmark_id)) continue;
      const key = benchmark.benchmark_id.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const score = scoreValue(benchmark.normalized_score);
      if (score !== null) scores[key] = score;
    }

    if (!Object.keys(scores).length) return null;
    return {
      modelId: model.id,
      modelName: model.name,
      providerName: model.organization,
      providerId: canonicalProviderId(model.organizationId),
      sourceUrl: model.detailUrl,
      scores,
      lastUpdated,
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    const avgA = Object.values(a.scores).reduce((sum, score) => sum + score, 0) / Object.keys(a.scores).length;
    const avgB = Object.values(b.scores).reduce((sum, score) => sum + score, 0) / Object.keys(b.scores).length;
    return avgB - avgA;
  });

const output = `export interface BenchmarkScore {
  name: string;
  fullName: string;
  description: string;
  category: 'reasoning' | 'knowledge' | 'coding' | 'math' | 'safety';
}

export interface ModelBenchmark {
  modelId: string;
  modelName?: string;
  providerName?: string;
  providerId?: string;
  sourceUrl?: string;
  scores: Record<string, number>;
  lastUpdated: string;
}

// Generated from data/llm-stats/models.json by scripts/build_benchmarks_from_llm_stats.mjs.
// Source: https://llm-stats.com public pages, scraped ${lastUpdated}.
export const benchmarks: BenchmarkScore[] = [
${benchmarkDefs.map((benchmark) => `  {
    name: ${jsString(benchmark.name)},
    fullName: ${jsString(benchmark.fullName)},
    description: ${jsString(benchmark.description)},
    category: ${jsString(benchmark.category)},
  }`).join(',\n')},
];

export const modelBenchmarks: ModelBenchmark[] = [
${modelBenchmarks.map((model) => `  {
    modelId: ${jsString(model.modelId)},
    modelName: ${jsString(model.modelName)},
    providerName: ${jsString(model.providerName)},
    providerId: ${jsString(model.providerId)},
    sourceUrl: ${jsString(model.sourceUrl)},
    scores: ${JSON.stringify(model.scores)},
    lastUpdated: ${jsString(model.lastUpdated)},
  }`).join(',\n')},
];
`;

await writeFile(OUTPUT, output);

console.log(JSON.stringify({
  output: OUTPUT,
  benchmarkCount: benchmarkDefs.length,
  modelBenchmarkCount: modelBenchmarks.length,
  lastUpdated,
}, null, 2));
