#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把抓取差异（data/llm-stats/price-diff.json）应用到 src/data/models.ts。

- 已存在的模型：只更新 input/output 价格
- 新模型：追加到 models 数组末尾（仅当厂商在项目 providers 列表中）
- 不覆盖人工维护的字段（features、websiteUrl、性能评分等）

用法:
    python scripts/apply_model_updates.py --dry-run
    python scripts/apply_model_updates.py
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone

MODELS_TS = os.path.join("src", "data", "models.ts")
DIFF_JSON = os.path.join("data", "llm-stats", "price-diff.json")

TYPE_RULES = [
    (("image", "flux", "diffusion", "midjourney", "dall", "ideogram", "photo"), "image"),
    (("video", "runway", "sora", "kling", "veo"), "image"),
    (("whisper", "tts", "audio", "voice", "speech"), "audio"),
    (("embed",), "embedding"),
    (("moderation", "guard", "safety"), "moderation"),
    (("coder", "code", "codestral", "devstral"), "code"),
    (("vision", "-vl", "_vl", "omni", "multimodal"), "multimodal"),
]


def log(message: str) -> None:
    print(message, flush=True)


def infer_type(name: str) -> str:
    lowered = name.lower()
    for keywords, model_type in TYPE_RULES:
        for keyword in keywords:
            if keyword in lowered:
                return model_type
    return "chat"


def escape(value: str) -> str:
    return str(value).replace("\\", "\\\\").replace("'", "\\'")


def find_array_end(source: str, marker: str) -> int:
    """找到 `marker ... = [` 这个数组配对的 `]` 位置（跳过类型注解里的 []）。"""
    start = source.find(marker)
    if start < 0:
        raise RuntimeError(f"未找到 {marker}")
    assign = source.find("=", start)
    if assign < 0:
        raise RuntimeError(f"{marker} 后未找到赋值符号")
    bracket = source.find("[", assign)
    depth = 0
    for index in range(bracket, len(source)):
        char = source[index]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return index
    raise RuntimeError("未找到数组结束位置")


def render_entry(model: dict, stamp: str) -> str:
    name = model.get("name") or model["id"]
    context = int(model.get("performance", {}).get("contextWindow") or 0)
    max_output = min(8192, context) if context else 8192
    release = model.get("releaseDate") or ""
    pricing = model["pricing"]
    lines = [
        "  {",
        f"    id: '{escape(model['id'])}',",
        f"    providerId: '{escape(model['providerId'])}',",
        f"    name: '{escape(name)}',",
        "    version: '1.0',",
        f"    type: '{infer_type(name)}',",
        f"    pricing: {{ input: {pricing['input']}, output: {pricing['output']} }}, // llm-stats 抓取 {stamp}",
        f"    performance: {{ contextWindow: {context}, maxOutput: {max_output}, latency: 500, accuracy: 85 }},",
        "    features: [],",
        f"    releaseDate: '{escape(release)}',",
        "  },",
    ]
    return "\n".join(lines)


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(description="应用抓取差异到 src/data/models.ts")
    parser.add_argument("--diff", default=DIFF_JSON, help="抓取差异文件路径")
    parser.add_argument("--models", default=MODELS_TS, help="模型数据文件路径")
    parser.add_argument("--dry-run", action="store_true", help="只预览不写入")
    args = parser.parse_args()

    with open(args.diff, encoding="utf-8") as handle:
        diff = json.load(handle)
    with open(args.models, encoding="utf-8") as handle:
        source = handle.read()

    head = source.split("export const models", 1)[0]
    providers = set(re.findall(r"id:\s*'([^']+)'", head))
    existing_ids = set(re.findall(r"id:\s*'([^']+)'", source))
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1) 更新价格
    updated = 0
    for item in diff.get("changed", []):
        pattern = re.compile(
            r"(id:\s*'" + re.escape(item["id"]) + r"',[\s\S]{0,800}?pricing:\s*\{\s*input:\s*)"
            r"[\d.]+(,\s*output:\s*)[\d.]+"
        )
        replacement = (
            lambda m: f"{m.group(1)}{item['new']['input']}{m.group(2)}{item['new']['output']}"
        )
        source, count = pattern.subn(replacement, source)
        updated += count

    # 2) 追加新模型
    candidates = [
        model
        for model in diff.get("newCandidates", [])
        if model["providerId"] in providers and model["id"] not in existing_ids
    ]
    entries = [render_entry(model, stamp) for model in candidates]

    log(f"价格更新 {updated} 处，新增模型 {len(entries)} 个（候选 {len(diff.get('newCandidates', []))} 个）")
    skipped = len(diff.get("newCandidates", [])) - len(entries)
    if skipped:
        log(f"跳过 {skipped} 个（厂商不在 providers 列表或 id 已存在）")

    if args.dry_run or not entries:
        for entry in entries[:5]:
            log("--- 预览 ---\n" + entry)
        return 0

    end = find_array_end(source, "export const models")
    block = "\n".join(entries)
    source = source[:end].rstrip() + "\n" + block + "\n" + source[end:]

    with open(args.models, "w", encoding="utf-8") as handle:
        handle.write(source)
    log(f"已写入 {args.models}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
