#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ModelMart 模型数据抓取脚本（单文件，零第三方依赖）。

从 llm-stats.com 公开页面抓取模型清单与价格，归一化为前端 `src/data/models.ts`
使用的结构（价格单位：人民币 / 百万 token），并可与现有数据做差异对比。

用法:
    python scripts/scrape_models.py
    python scripts/scrape_models.py --diff
    python scripts/scrape_models.py --rate 7.2 --out data/llm-stats/models.scraped.json
    python scripts/scrape_models.py --pages /models /models/compare --limit 50

产物:
    data/llm-stats/models.scraped.json   抓取结果（原始 + 归一化）
    data/llm-stats/price-diff.json       --diff 时生成，与现有数据的价格差异
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

BASE_URL = "https://llm-stats.com"
DEFAULT_PAGES = [
    "/",
    "/models",
    "/models/compare",
    "/leaderboards/llm-leaderboard",
    "/leaderboards/open-llm-leaderboard",
    "/benchmarks",
]
DEFAULT_OUTPUT = os.path.join("data", "llm-stats", "models.scraped.json")
DEFAULT_DIFF_OUTPUT = os.path.join("data", "llm-stats", "price-diff.json")
MODELS_TS = os.path.join("src", "data", "models.ts")
DEFAULT_RATE = 7.2
TIMEOUT = 30
RETRIES = 2
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# llm-stats 公司名/关键词 -> 前端 providerId
PROVIDER_MAP = {
    "openai": "openai",
    "anthropic": "anthropic",
    "claude": "anthropic",
    "google": "google",
    "gemini": "google",
    "deepmind": "google",
    "meta": "meta",
    "llama": "meta",
    "mistral": "mistral",
    "deepseek": "deepseek",
    "alibaba": "alibaba",
    "qwen": "alibaba",
    "tongyi": "alibaba",
    "zhipu": "zhipu",
    "glm": "zhipu",
    "bigmodel": "zhipu",
    "moonshot": "moonshot",
    "kimi": "moonshot",
    "minimax": "minimax",
    "bytedance": "bytedance",
    "doubao": "bytedance",
    "seed": "bytedance",
    "xai": "xai",
    "grok": "xai",
    "perplexity": "perplexity",
    "huawei": "huawei",
    "pangu": "huawei",
    "iflytek": "iflytek",
    "spark": "iflytek",
    "sensetime": "sensetime",
    "360": "360",
    "zhinao": "360",
    "mobvoi": "mobvoi",
    "stability": "stability",
    "runway": "runway",
    "midjourney": "midjourney",
    "tencent": "tencent",
    "hunyuan": "tencent",
    "baidu": "baidu",
    "ernie": "baidu",
    "nvidia": "nvidia",
    "nemotron": "nvidia",
    "cohere": "cohere",
    "ai21": "ai21",
    "amazon": "amazon",
    "aws": "amazon",
    "microsoft": "microsoft",
    "azure": "microsoft",
    "ibm": "ibm",
    "lg": "lg",
    "exaone": "lg",
    "meituan": "meituan",
    "xiaomi": "xiaomi",
    "stepfun": "step",
    "01.ai": "yi",
    "openbmb": "openbmb",
    "nous": "nous-research",
    "inception": "inceptionlabs",
    "ideogram": "ideogram",
    "sarvam": "sarvamai",
    "shanghai ai laboratory": "shanghai-ai-lab",
    "internlm": "shanghai-ai-lab",
}

NAME_KEYS = ("display_name", "displayName", "name", "title", "model_name", "modelName", "slug")
SLUG_KEYS = ("slug", "id", "model_id", "modelId", "path", "key")
PROVIDER_KEYS = (
    "organization_name",
    "organization_id",
    "organization",
    "company",
    "vendor",
    "routing_providers",
    "provider",
    "provider_name",
    "providerName",
)
CONTEXT_KEYS = ("context_window", "contextWindow", "context", "max_context", "maxContext", "context_length")
RELEASE_KEYS = ("release_date", "releaseDate", "released_at", "created_at", "createdAt", "date")


def log(message: str) -> None:
    print(message, flush=True)


def fetch(url: str) -> str:
    """抓取页面 HTML，失败重试。"""
    last_error = None
    for attempt in range(RETRIES + 1):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return response.read().decode(charset, errors="replace")
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
            last_error = exc
            time.sleep(1 + attempt)
    raise RuntimeError(f"抓取失败 {url}: {last_error}")


def extract_flight(html: str) -> str:
    """拼接 Next.js RSC flight 数据（页面数据都在这里）。"""
    chunks = []
    for raw in re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)', html, flags=re.S):
        try:
            chunks.append(json.loads(f'"{raw}"'))
        except json.JSONDecodeError:
            continue
    return "".join(chunks)


def find_json_value(source: str, key: str):
    """在 flight 文本中定位 `"key":` 后紧跟的 JSON 值（对象/数组）。"""
    anchor = source.find(f'"{key}":')
    if anchor < 0:
        return None
    start = anchor + len(key) + 3
    while start < len(source) and source[start].isspace():
        start += 1
    if start >= len(source) or source[start] not in "[{":
        return None
    opener = source[start]
    closer = "]" if opener == "[" else "}"
    depth = 0
    in_string = False
    escaped = False
    for index in range(start, len(source)):
        char = source[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(source[start : index + 1])
                except json.JSONDecodeError:
                    return None
    return None


def initial_payload_keys(flight: str) -> list:
    keys = re.findall(r'"(initial[A-Za-z0-9_]+)":', flight)
    seen = []
    for key in keys:
        if key not in seen and key not in ("initialTree", "initialSeedData", "initialHead"):
            seen.append(key)
    return seen


def parse_money(value) -> float:
    """把 "$1.25" / "1,250" / 1.25 / "¥9" 之类转成 float。"""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).replace(",", "").strip()
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    return float(match.group()) if match else 0.0


def pricing_of(record: dict) -> tuple:
    """从记录中取出 (input, output) 单价，未找到返回 (0.0, 0.0)。"""
    for holder in (record, record.get("pricing"), record.get("price"), record.get("prices")):
        if not isinstance(holder, dict):
            continue
        input_value = None
        output_value = None
        for key, value in holder.items():
            lowered = key.lower()
            if not isinstance(value, (int, float, str)):
                continue
            if lowered in ("input", "input_price", "inputprice", "price_input", "prompt", "prompt_price"):
                input_value = value
            elif lowered in ("output", "output_price", "outputprice", "price_output", "completion", "completion_price"):
                output_value = value
        if input_value is not None or output_value is not None:
            return parse_money(input_value), parse_money(output_value)
    return 0.0, 0.0


def looks_like_model(record: dict) -> bool:
    if not isinstance(record, dict):
        return False
    has_name = any(record.get(key) for key in NAME_KEYS)
    if not has_name:
        return False
    input_price, output_price = pricing_of(record)
    return input_price > 0 or output_price > 0


def collect_models(node, found: list) -> None:
    """深度优先遍历 payload，收集像模型记录的对象。"""
    if isinstance(node, dict):
        if looks_like_model(node):
            found.append(node)
        for value in node.values():
            collect_models(value, found)
    elif isinstance(node, list):
        for value in node:
            collect_models(value, found)


def first_value(record: dict, keys: tuple):
    for key in keys:
        value = record.get(key)
        if isinstance(value, (str, int, float)) and str(value).strip():
            return value
        if isinstance(value, dict):
            for nested in ("name", "slug", "id", "title"):
                if value.get(nested):
                    return value[nested]
        if isinstance(value, list) and value:
            return value[0]
    return None


def provider_to_id(raw_provider) -> str:
    if not raw_provider:
        return "other"
    name = str(raw_provider).lower().strip()
    if name in PROVIDER_MAP:
        return PROVIDER_MAP[name]
    for keyword, provider_id in PROVIDER_MAP.items():
        if keyword in name:
            return provider_id
    return "other"


def slugify(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", str(value).lower()).strip("-")
    return text or "unknown-model"


def completeness(model: dict) -> int:
    """信息完整度打分，跨页面合并时保留字段更全的一条。"""
    score = 0
    if model["pricing"]["input"] > 0:
        score += 1
    if model["pricing"]["output"] > 0:
        score += 1
    if model["performance"]["contextWindow"] > 0:
        score += 1
    if model["releaseDate"]:
        score += 1
    if model["providerId"] != "other":
        score += 1
    if model["name"] and model["name"] != model["id"]:
        score += 1
    return score


def normalize(record: dict, rate: float, source_url: str) -> dict:
    name = str(first_value(record, NAME_KEYS) or "").strip()
    slug = str(first_value(record, SLUG_KEYS) or slugify(name))
    input_usd, output_usd = pricing_of(record)
    context = parse_money(first_value(record, CONTEXT_KEYS) or 0)
    return {
        "id": slugify(slug),
        "providerId": provider_to_id(first_value(record, PROVIDER_KEYS)),
        "providerRaw": str(first_value(record, PROVIDER_KEYS) or ""),
        "name": name,
        "pricing": {
            "input": round(input_usd * rate, 2),
            "output": round(output_usd * rate, 2),
        },
        "pricingUsd": {"input": input_usd, "output": output_usd},
        "performance": {"contextWindow": int(context)},
        "releaseDate": str(first_value(record, RELEASE_KEYS) or ""),
        "sourceUrl": source_url,
    }


def scrape_pages(pages: list, rate: float) -> tuple:
    """抓取所有页面并归一化模型数据，返回 (models, 统计信息)。"""
    models = {}
    stats = []
    urls = [BASE_URL + page if page.startswith("/") else page for page in pages]

    def load(url: str):
        try:
            return url, fetch(url)
        except RuntimeError as exc:
            return url, f"__ERROR__{exc}"

    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(load, urls))

    for url, html in results:
        if isinstance(html, str) and html.startswith("__ERROR__"):
            log(f"[warn] {html.replace('__ERROR__', '')}")
            stats.append({"url": url, "status": "error"})
            continue

        flight = extract_flight(html)
        payloads = [find_json_value(flight, key) for key in initial_payload_keys(flight)]
        payloads = [payload for payload in payloads if payload is not None]

        raw_records = []
        for payload in payloads:
            collect_models(payload, raw_records)

        created = 0
        updated = 0
        for record in raw_records:
            model = normalize(record, rate, url)
            if model["pricing"]["input"] <= 0 and model["pricing"]["output"] <= 0:
                continue
            existing = models.get(model["id"])
            if existing is None:
                models[model["id"]] = model
                created += 1
            elif completeness(model) > completeness(existing):
                models[model["id"]] = model
                updated += 1

        log(f"[ok] {url} -> {len(raw_records)} 条记录，新增 {created} 条，更新 {updated} 条")
        stats.append(
            {
                "url": url,
                "status": "ok",
                "records": len(raw_records),
                "created": created,
                "updated": updated,
            }
        )

    return list(models.values()), stats


def parse_existing_models(path: str) -> dict:
    """从 src/data/models.ts 解析现有模型的价格，用于差异对比。"""
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as handle:
        source = handle.read()

    pattern = re.compile(
        r"id:\s*'(?P<id>[^']+)'.*?providerId:\s*'(?P<provider>[^']+)'"
        r".*?name:\s*'(?P<name>[^']+)'.*?pricing:\s*\{(?P<pricing>[^}]*)\}",
        flags=re.S,
    )
    existing = {}
    for match in pattern.finditer(source):
        pricing = match.group("pricing")
        input_match = re.search(r"input:\s*([\d.]+)", pricing)
        output_match = re.search(r"output:\s*([\d.]+)", pricing)
        if not input_match or not output_match:
            continue
        existing[match.group("id")] = {
            "id": match.group("id"),
            "providerId": match.group("provider"),
            "name": match.group("name"),
            "pricing": {
                "input": float(input_match.group(1)),
                "output": float(output_match.group(1)),
            },
        }
    return existing


def build_diff(models: list, existing: dict) -> dict:
    changed = []
    added = []
    for model in models:
        current = existing.get(model["id"])
        if current is None:
            added.append(model)
            continue
        old_input = current["pricing"]["input"]
        old_output = current["pricing"]["output"]
        new_input = model["pricing"]["input"]
        new_output = model["pricing"]["output"]
        if abs(old_input - new_input) > 0.01 or abs(old_output - new_output) > 0.01:
            changed.append(
                {
                    "id": model["id"],
                    "name": model["name"],
                    "providerId": model["providerId"],
                    "old": {"input": old_input, "output": old_output},
                    "new": {"input": new_input, "output": new_output},
                    "sourceUrl": model["sourceUrl"],
                }
            )
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "existingCount": len(existing),
        "scrapedCount": len(models),
        "changed": changed,
        "newCandidates": added,
    }


def write_json(path: str, payload) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="抓取 AI 模型价格数据")
    parser.add_argument("--pages", nargs="*", default=DEFAULT_PAGES, help="要抓取的页面路径")
    parser.add_argument("--rate", type=float, default=DEFAULT_RATE, help="USD -> CNY 汇率")
    parser.add_argument("--out", default=DEFAULT_OUTPUT, help="抓取结果输出路径")
    parser.add_argument("--diff", action="store_true", help="与 src/data/models.ts 对比价格")
    parser.add_argument("--diff-out", default=DEFAULT_DIFF_OUTPUT, help="差异报告输出路径")
    parser.add_argument("--limit", type=int, default=0, help="只保留前 N 条（0 表示不限制）")
    args = parser.parse_args()

    log(f"开始抓取 {len(args.pages)} 个页面（汇率 {args.rate}）...")
    models, stats = scrape_pages(args.pages, args.rate)

    if args.limit and len(models) > args.limit:
        models = models[: args.limit]

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": BASE_URL,
        "exchangeRate": args.rate,
        "pages": stats,
        "count": len(models),
        "models": models,
    }
    write_json(args.out, payload)
    log(f"已写入 {len(models)} 个模型 -> {args.out}")

    if args.diff:
        existing = parse_existing_models(MODELS_TS)
        diff = build_diff(models, existing)
        write_json(args.diff_out, diff)
        log(
            f"对比完成：现有 {diff['existingCount']} 个模型，"
            f"价格变化 {len(diff['changed'])} 个，新增候选 {len(diff['newCandidates'])} 个 -> {args.diff_out}"
        )
        for item in diff["changed"][:10]:
            log(
                f"  · {item['id']}: 输入 {item['old']['input']}->{item['new']['input']}, "
                f"输出 {item['old']['output']}->{item['new']['output']}"
            )

    if not models:
        log("未抓到任何模型数据，请检查网络或页面结构是否变化。")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
