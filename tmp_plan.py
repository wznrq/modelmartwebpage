import json, re, collections

diff = json.load(open('data/llm-stats/price-diff.json', encoding='utf-8'))
src = open('src/data/models.ts', encoding='utf-8').read()

providers = set(re.findall(r"^\s*\{\s*\n\s*id:\s*'([a-z0-9\-]+)',\s*\n\s*name:", src, flags=re.M))
if not providers:
    providers = set(re.findall(r"id:\s*'([a-z0-9\-]+)'", src.split('export const models')[0]))
print('providers:', len(providers))

cands = diff['newCandidates']
counter = collections.Counter(c['providerId'] for c in cands)
print('candidates:', len(cands))
for pid, n in counter.most_common():
    print(f'  {pid}: {n} {"OK" if pid in providers else "NOT-IN-PROVIDERS"}')

usable = [c for c in cands if c['providerId'] in providers]
print('usable:', len(usable))
for c in usable[:8]:
    print(' ', c['id'], '|', c['providerId'], '|', c['name'], '|', c['pricing'], '| ctx', c['performance']['contextWindow'], '|', c['releaseDate'])
